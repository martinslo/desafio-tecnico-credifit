// src/usuario/usuario.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }
}
