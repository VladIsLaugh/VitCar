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
  },
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
        { provide: EmailService, useValue: { sendVerificationEmail: jest.fn() } },
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

    it('throws ForbiddenException when email not verified', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, isVerified: false });
      // bcrypt.compare would return false for mock hash — we spy to force true
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
});
