import {
  Injectable,
  Inject,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 12;
const VERIFY_TOKEN_TTL_HOURS = 24;
const REFRESH_TOKEN_TTL_DAYS = 30;
const RESET_TOKEN_TTL_HOURS = 1;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends TokenPair {
  user: { id: string; email: string; firstName: string | null; role: string };
}

export interface GoogleUser {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(EmailService) private readonly email: EmailService
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('This email is already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        isVerified: false,
      },
    });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_HOURS * 60 * 60 * 1000);

    await this.prisma.emailVerificationToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    await this.email.sendVerificationEmail(user.email, token);

    return { message: 'Please verify your email. Check your inbox.' };
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      if (record) {
        await this.prisma.emailVerificationToken.delete({ where: { token } });
      }
      throw new BadRequestException('Invalid or expired verification token');
    }

    const user = await this.prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });

    await this.prisma.emailVerificationToken.delete({ where: { token } });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto, userAgent?: string, ip?: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // TODO: re-enable once Resend domain vitauto.ua is verified and email delivery confirmed
    // if (!user.isVerified) {
    //   throw new ForbiddenException({
    //     message: 'Email not verified',
    //     action: 'resend_verification',
    //   });
    // }

    if (!user.isActive) {
      throw new ForbiddenException({
        message: 'Account is blocked',
        reason: user.blockedReason,
      });
    }

    return this.issueTokens(user, userAgent, ip);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
    return user;
  }

  async refresh(
    refreshToken: string,
    userAgent?: string,
    ip?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date() || !record.user.isActive) {
      if (record) {
        await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { token: refreshToken } });

    const result = await this.issueTokens(record.user, userAgent, ip);
    return { accessToken: result.accessToken, refreshToken: result.refreshToken };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    try {
      await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
    } catch {
      // token not found — idempotent
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const message = "If this email exists we've sent a link";

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message };

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_HOURS * 60 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    await this.email.sendPasswordResetEmail(user.email, token);

    return { message };
  }

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<{ message: string }> {
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      if (record) {
        await this.prisma.passwordResetToken.delete({ where: { token } });
      }
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });

    await this.prisma.passwordResetToken.delete({ where: { token } });
    await this.prisma.refreshToken.deleteMany({ where: { userId: record.userId } });

    return { message: 'Password updated successfully' };
  }

  async handleGoogleAuth(
    googleUser: GoogleUser,
    userAgent?: string,
    ip?: string
  ): Promise<AuthResponse> {
    const { googleId, email, firstName, lastName, avatarUrl } = googleUser;

    let user = await this.prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      // Check if account with same email exists (link googleId to it)
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) {
        user = await this.prisma.user.update({
          where: { id: existing.id },
          data: { googleId, avatarUrl: avatarUrl ?? existing.avatarUrl },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email,
            googleId,
            firstName: firstName ?? null,
            lastName: lastName ?? null,
            avatarUrl: avatarUrl ?? null,
            isVerified: true,
          },
        });
      }
    }

    if (!user.isActive) {
      throw new ForbiddenException({ message: 'Account is blocked', reason: user.blockedReason });
    }

    return this.issueTokens(user, userAgent, ip);
  }

  private async issueTokens(
    user: { id: string; email: string; firstName: string | null; role: string },
    userAgent?: string,
    ip?: string
  ): Promise<AuthResponse> {
    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt, userAgent, ip },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role },
    };
  }
}
