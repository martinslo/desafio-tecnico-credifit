import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('funcionarios')
  async listarFuncionarios(@Request() req) {
    const empresaId = req.user.sub;
    
    return this.prisma.funcionario.findMany({
      where: { empresaId },
      select: {
        id: true,
        nome: true,
        cpf: true,
        email: true,
        salario: true,
      },
    });
  }
}
