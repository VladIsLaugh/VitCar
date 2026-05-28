import { Controller, Get, Param } from '@nestjs/common';
import type { MakeDto, ModelDto } from '@vitauto/shared-types';
import { MakesService } from './makes.service';

@Controller('makes')
export class MakesController {
  constructor(private readonly makesService: MakesService) {}

  @Get()
  async getMakes(): Promise<MakeDto[]> {
    return this.makesService.getMakes();
  }

  @Get(':makeId/models')
  async getModels(@Param('makeId') makeId: string): Promise<ModelDto[]> {
    return this.makesService.getModelsForMake(makeId);
  }
}
