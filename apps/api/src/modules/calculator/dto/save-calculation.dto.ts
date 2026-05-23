import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CalculationInputsDto } from './calculation-inputs.dto';

export class SaveCalculationDto {
  @ValidateNested()
  @Type(() => CalculationInputsDto)
  inputParams!: CalculationInputsDto;

  // result is whatever the engine returned — we store it as-is
  result!: Record<string, unknown>;
}
