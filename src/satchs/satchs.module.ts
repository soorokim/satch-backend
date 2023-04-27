import { Module } from '@nestjs/common';
import { SatchsService } from './satchs.service';
import { SatchsController } from './satchs.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SatchsController],
  providers: [SatchsService],
})
export class SatchsModule {}
