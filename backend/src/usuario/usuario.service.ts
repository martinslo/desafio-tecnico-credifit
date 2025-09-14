import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dts';
import * as bcrypt from 'bcrypt';
import { UsuarioEntity } from './entities/usuario.entity';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioEntity> {
    const hashedSenha = await bcrypt.hash(dto.password, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        email: dto.email,
        password: hashedSenha,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...rest } = usuario;
    return rest as UsuarioEntity;
  }

  async findAll(): Promise<UsuarioEntity[]> {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }
}
