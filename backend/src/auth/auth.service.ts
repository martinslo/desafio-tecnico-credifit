import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { Empresa, Funcionario } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    senha: string,
  ): Promise<Empresa | Funcionario | null> {
    let usuario: Empresa | Funcionario | null =
      await this.prisma.funcionario.findUnique({
        where: { email },
      });

    if (!usuario) {
      usuario = await this.prisma.empresa.findUnique({ where: { email } });
    }

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Senha inválida');
    }

    return usuario;
  }

  login(usuario: Empresa | Funcionario) {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      tipo: 'funcionario' in usuario ? 'funcionario' : 'empresa',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerFuncionario(data: {
    nome: string;
    email: string;
    senha: string;
    cpf: string;
    salario: number;
    empresaId: number;
  }): Promise<Funcionario> {
    const hashedSenha = await bcrypt.hash(data.senha, 10);
    const funcionario = await this.prisma.funcionario.create({
      data: { ...data, senha: hashedSenha },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { senha, ...rest } = funcionario;
    return rest as Funcionario;
  }

  async registerEmpresa(data: {
    cnpj: string;
    razaoSocial: string;
    nomeRepresentante: string;
    cpfRepresentante: string;
    email: string;
    senha: string;
  }): Promise<Empresa> {
    const hashedSenha = await bcrypt.hash(data.senha, 10);
    const empresa = await this.prisma.empresa.create({
      data: { ...data, senha: hashedSenha },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { senha, ...rest } = empresa;
    return rest as Empresa;
  }
}
