import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
} from '@nestjs/common';
import { SatchsService } from './satchs.service';
import { CreateSatchDto } from './dto/create-satch.dto';
import { UpdateSatchDto } from './dto/update-satch.dto';
import { Request } from 'express';

@Controller('satchs')
export class SatchsController {
  constructor(private readonly satchsService: SatchsService) {}

  @Post(':goalId')
  create(
    @Param('goalId') goalId: string,
    @Body() createSatchDto: CreateSatchDto,
    @Req() req: Request,
  ) {
    return this.satchsService.create(goalId, createSatchDto, req);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSatchDto: UpdateSatchDto) {
    return this.satchsService.update(+id, updateSatchDto);
  }

  @Delete(':goalId/:id')
  remove(
    @Param('goalId') goalId: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.satchsService.remove(goalId, id, req);
  }
}
