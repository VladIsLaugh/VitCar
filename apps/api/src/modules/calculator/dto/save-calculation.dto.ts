import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CalculationInputsDto } from './calculation-inputs.dto';

export class SaveCalculationDto {
  @ValidateNested()
  @Type(() => CalculationInputsDto)
  inputParams!: CalculationInputsDto;

  @IsObject()
  @IsNotEmpty()
  result!: Record<string, unknown>;
}
