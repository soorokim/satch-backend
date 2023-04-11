import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import axios from 'axios';

import { UserService } from 'src/user/user.service';
import { AuthRequestDto } from './dto/auth-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  InvalidVendorNameException,
  KakaoOAuthFailedException,
} from 'errors/auth.errors';
import { Request, Response } from 'express';
import { config } from 'process';

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

    console.log(data);
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
    // console.log(req);
    console.log(req.headers.cookie);
    console.log(req.cookies?.refresh_token);
    return 'cool';
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
}
