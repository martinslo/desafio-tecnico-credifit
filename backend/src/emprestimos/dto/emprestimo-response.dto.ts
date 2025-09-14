export class EmprestimoResponseDto {
  id: number;
  valor: number;
  parcelas: number;
  status: string;
  scoreUsado: number;
  createdAt: Date;
  parcelasGeradas: ParcelaResponseDto[];
}

export class ParcelaResponseDto {
  id: number;
  numero: number;
  valor: number;
  vencimento: Date;
}
