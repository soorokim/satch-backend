import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import axios from 'axios';

import { UserService } from 'src/user/user.service';
import { AuthRequestDto } from './dto/auth-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  InvalidTokenException,
  InvalidVendorNameException,
  KakaoOAuthFailedException,
} from 'src/errors/auth.errors';
import { Request, Response } from 'express';
import * as dayjs from 'dayjs';

const ACCESS_TOKEN_EXPIRE = 36000;
const JwtSubjectType = {
  ACCESS: 'access',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(data: AuthRequestDto, res: Response): Promise<AuthResponseDto> {
    let userId;

    switch (data.vendor) {
      case 'kakao': {
        userId = await this.getUserByKakaoAccessToken(data.accessToken);
        break;
      }
      default: {
        throw new InvalidVendorNameException();
      }
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId),
      this.generateRefreshToken(userId),
    ]);

    res.cookie('refresh_token', refreshToken, {
      path: '/auth',
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return new AuthResponseDto(accessToken);
  }

  async refresh(req: Request, res: Response) {
    const token = this.getRefreshTokenByCookie(req.headers.cookie);
    const userId = await this.getUserIdByRefreshToken(token);
    if (!userId) {
      throw new InvalidTokenException();
    }
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId),
      this.generateRefreshToken(userId),
    ]);

    res.cookie('refresh_token', refreshToken, {
      path: '/auth',
      httpOnly: true,
      sameSite: 'strict',
    });

    return new AuthResponseDto(accessToken);
  }

  getRefreshTokenByCookie(cookie: string) {
    return new Map<string, string>(
      cookie.split('; ').map((t) => t.split('=')) as [[string, string]],
    ).get('refresh_token');
  }

  async getUserByKakaoAccessToken(accessToken: string): Promise<string> {
    const userOfKakao = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userOfKakao) throw new KakaoOAuthFailedException();

    const user = await this.userService.findOne(userOfKakao.data.id);
    if (!user) {
      console.log('create User!');
      return this.userService.create({
        id: userOfKakao.data.id,
        created_at: userOfKakao.data.connected_at,
        vendor: 'kakao',
      });
    }

    return user.id;
  }

  protected async generateAccessToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        user_id: userId,
      },
      { expiresIn: ACCESS_TOKEN_EXPIRE, subject: JwtSubjectType.ACCESS },
    );
  }

  protected async generateRefreshToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        user_id: userId,
      },
      { expiresIn: ACCESS_TOKEN_EXPIRE, subject: JwtSubjectType.ACCESS },
    );
  }

  protected async getUserIdByRefreshToken(token: string) {
    try {
      const result = await this.jwtService.verifyAsync(token);
      if (result) {
        const isValidToken = dayjs(result.exp).isBefore(dayjs());
        if (isValidToken) return result.user_id;
        return false;
      }
    } catch {
      return false;
    }
  }
}
