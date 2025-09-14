import { IsNumber, IsPositive, Min, Max } from 'class-validator';

export class SolicitarEmprestimoDto {
  @IsNumber()
  @IsPositive()
  valor: number;

  @IsNumber()
  @Min(1)
  @Max(4)
  parcelas: number;
}
