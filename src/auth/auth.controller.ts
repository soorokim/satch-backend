import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/auth-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() data: AuthRequestDto,
    @Res({ passthrough: true }) res,
  ): Promise<AuthResponseDto> {
    return this.authService.login(data, res);
  }

  @Get('refresh')
  async refresh(
    @Req() req,
    @Res({ passthrough: true }) res,
  ): Promise<AuthResponseDto> {
    return this.authService.refresh(req, res);
  }
}
