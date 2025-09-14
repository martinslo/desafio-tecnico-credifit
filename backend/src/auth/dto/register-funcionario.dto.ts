import {
  IsString,
  IsEmail,
  IsNumber,
  IsPositive,
  MinLength,
} from 'class-validator';

export class RegisterFuncionarioDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsString()
  cpf: string;

  @IsNumber()
  @IsPositive()
  salario: number;

  @IsNumber()
  @IsPositive()
  empresaId: number;
}
