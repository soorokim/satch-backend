import { PartialType } from '@nestjs/swagger';
import { CreateSatchDto } from './create-satch.dto';

export class UpdateSatchDto extends PartialType(CreateSatchDto) {}
