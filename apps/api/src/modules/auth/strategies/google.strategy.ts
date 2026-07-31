import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { StrategyOptions, VerifyCallback } from 'passport-google-oauth20';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified: boolean }>;
  photos: Array<{ value: string }>;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(@Inject(ConfigService) config: ConfigService) {
    const options: StrategyOptions = {
      clientID: config.get<string>('GOOGLE_CLIENT_ID') ?? 'not-configured',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') ?? 'not-configured',
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL') ??
        'http://localhost:3001/api/auth/google/callback',
      scope: ['email', 'profile'],
    };
    super(options);
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback
  ) {
    const { id, displayName, emails, photos } = profile;
    const [firstName, ...rest] = displayName.split(' ');
    done(null, {
      googleId: id,
      email: emails[0]?.value,
      firstName,
      lastName: rest.join(' ') || undefined,
      avatarUrl: photos[0]?.value,
    });
  }
}
