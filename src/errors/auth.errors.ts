import { HttpException, HttpStatus } from '@nestjs/common';

export class KakaoOAuthFailedException extends HttpException {
  constructor() {
    super('Can not get Kakao user info!', HttpStatus.EXPECTATION_FAILED);
  }
}

export class InvalidVendorNameException extends HttpException {
  constructor() {
    super('Invalid OAuth vendor!', HttpStatus.EXPECTATION_FAILED);
  }
}

export class InvalidTokenException extends HttpException {
  constructor() {
    super('Invalid Token!', HttpStatus.UNAUTHORIZED);
  }
}
