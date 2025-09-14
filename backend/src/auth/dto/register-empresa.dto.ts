import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterEmpresaDto {
  @IsString()
  cnpj: string;

  @IsString()
  razaoSocial: string;

  @IsString()
  nomeRepresentante: string;

  @IsString()
  cpfRepresentante: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;
}
