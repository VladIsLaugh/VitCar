import { type TestingModule, Test } from '@nestjs/testing';
import {
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$hashed'),
  compare: jest.fn(),
}));

const bcryptCompareMock = bcrypt.compare as jest.Mock;

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: '$2a$12$hashedpassword',
  firstName: 'John',
  lastName: 'Doe',
  role: 'CLIENT',
  isVerified: true,
  isActive: true,
  blockedReason: null,
};

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  },
  emailVerificationToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  passwordResetToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

const emailMock = {
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('access-token') } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: EmailService, useValue: emailMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('throws ConflictException when email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      await expect(
        service.register({ email: 'test@example.com', password: 'Password1' })
      ).rejects.toThrow(ConflictException);
    });

    it('returns success message for new user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockUser);
      prismaMock.emailVerificationToken.create.mockResolvedValue({});

      const result = await service.register({ email: 'new@example.com', password: 'Password1' });
      expect(result.message).toContain('verify your email');
    });
  });

  describe('verifyEmail', () => {
    it('throws BadRequestException for invalid token', async () => {
      prismaMock.emailVerificationToken.findUnique.mockResolvedValue(null);
      await expect(service.verifyEmail('bad-token')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for expired token', async () => {
      prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
        token: 'tok',
        expiresAt: new Date(Date.now() - 1000),
        user: mockUser,
        userId: mockUser.id,
      });
      prismaMock.emailVerificationToken.delete.mockResolvedValue({});
      await expect(service.verifyEmail('tok')).rejects.toThrow(BadRequestException);
    });

    it('issues tokens on valid token', async () => {
      prismaMock.emailVerificationToken.findUnique.mockResolvedValue({
        token: 'valid',
        expiresAt: new Date(Date.now() + 60000),
        user: mockUser,
        userId: mockUser.id,
      });
      prismaMock.user.update.mockResolvedValue(mockUser);
      prismaMock.emailVerificationToken.delete.mockResolvedValue({});
      prismaMock.refreshToken.create.mockResolvedValue({});

      const result = await service.verifyEmail('valid');
      expect(result.accessToken).toBe('access-token');
      expect(result.user.email).toBe(mockUser.email);
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@example.com', password: 'Password1' })
      ).rejects.toThrow(UnauthorizedException);
    });

    // TODO: restore when Resend domain is verified and email delivery is confirmed
    it.skip('throws ForbiddenException when email not verified', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, isVerified: false });
      bcryptCompareMock.mockResolvedValueOnce(true);
      await expect(
        service.login({ email: 'test@example.com', password: 'Password1' })
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when account is blocked', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
        blockedReason: 'policy violation',
      });
      bcryptCompareMock.mockResolvedValueOnce(true);
      await expect(
        service.login({ email: 'test@example.com', password: 'Password1' })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException when token not found', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue(null);
      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for expired token', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        token: 'tok',
        expiresAt: new Date(Date.now() - 1000),
        user: mockUser,
      });
      prismaMock.refreshToken.delete.mockResolvedValue({});
      await expect(service.refresh('tok')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user is inactive', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        token: 'tok',
        expiresAt: new Date(Date.now() + 60000),
        user: { ...mockUser, isActive: false },
      });
      prismaMock.refreshToken.delete.mockResolvedValue({});
      await expect(service.refresh('tok')).rejects.toThrow(UnauthorizedException);
    });

    it('rotates token and returns new accessToken on valid refresh', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        token: 'valid-tok',
        expiresAt: new Date(Date.now() + 60000),
        user: mockUser,
      });
      prismaMock.refreshToken.delete.mockResolvedValue({});
      prismaMock.refreshToken.create.mockResolvedValue({});

      const result = await service.refresh('valid-tok');
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBeDefined();
      expect(prismaMock.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: 'valid-tok' },
      });
    });
  });

  describe('logout', () => {
    it('deletes the refresh token when found', async () => {
      prismaMock.refreshToken.delete.mockResolvedValue({});
      await service.logout('some-token');
      expect(prismaMock.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: 'some-token' },
      });
    });

    it('is a no-op when token is undefined', async () => {
      await service.logout(undefined);
      expect(prismaMock.refreshToken.delete).not.toHaveBeenCalled();
    });
  });

  describe('logoutAll', () => {
    it('deletes all refresh tokens for the user', async () => {
      prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 3 });
      await service.logoutAll('user-1');
      expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });

  describe('forgotPassword', () => {
    it('returns same message whether user exists or not', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const result = await service.forgotPassword('nobody@example.com');
      expect(result.message).toContain("we've sent a link");
      expect(emailMock.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('creates reset token and sends email when user exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.passwordResetToken.create.mockResolvedValue({});
      const result = await service.forgotPassword('test@example.com');
      expect(result.message).toContain("we've sent a link");
      expect(emailMock.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.any(String)
      );
    });
  });

  describe('resetPassword', () => {
    it('throws BadRequestException when passwords do not match', async () => {
      await expect(service.resetPassword('tok', 'Password1', 'Different1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('throws BadRequestException for invalid token', async () => {
      prismaMock.passwordResetToken.findUnique.mockResolvedValue(null);
      await expect(service.resetPassword('bad', 'Password1', 'Password1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('updates password and clears all sessions on success', async () => {
      prismaMock.passwordResetToken.findUnique.mockResolvedValue({
        token: 'valid',
        expiresAt: new Date(Date.now() + 60000),
        user: mockUser,
        userId: mockUser.id,
      });
      prismaMock.user.update.mockResolvedValue(mockUser);
      prismaMock.passwordResetToken.delete.mockResolvedValue({});
      prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.resetPassword('valid', 'NewPass1', 'NewPass1');
      expect(result.message).toContain('Password updated');
      expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
    });
  });

  describe('handleGoogleAuth', () => {
    const googleUser = {
      googleId: 'g-123',
      email: 'google@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      avatarUrl: 'https://photo.example.com/jane.jpg',
    };

    it('logs in existing user matched by googleId', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser); // googleId lookup
      prismaMock.refreshToken.create.mockResolvedValue({});

      const result = await service.handleGoogleAuth(googleUser);
      expect(result.accessToken).toBe('access-token');
      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('links googleId to existing account with same email', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null) // googleId lookup → not found
        .mockResolvedValueOnce(mockUser); // email lookup → found
      prismaMock.user.update.mockResolvedValue(mockUser);
      prismaMock.refreshToken.create.mockResolvedValue({});

      const result = await service.handleGoogleAuth(googleUser);
      expect(result.accessToken).toBe('access-token');
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({ googleId: googleUser.googleId }),
        })
      );
    });

    it('registers new user when no matching email or googleId', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null) // googleId lookup
        .mockResolvedValueOnce(null); // email lookup
      prismaMock.user.create.mockResolvedValue({ ...mockUser, email: googleUser.email });
      prismaMock.refreshToken.create.mockResolvedValue({});

      const result = await service.handleGoogleAuth(googleUser);
      expect(result.accessToken).toBe('access-token');
      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ googleId: googleUser.googleId, isVerified: true }),
        })
      );
    });

    it('throws ForbiddenException when account is blocked', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ ...mockUser, isActive: false });
      await expect(service.handleGoogleAuth(googleUser)).rejects.toThrow(ForbiddenException);
    });
  });
});
