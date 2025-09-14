import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { EmprestimosService } from './emprestimos.service';
import { SolicitarEmprestimoDto } from './dto/solicitar-emprestimo.dto';
import { EmprestimoResponseDto } from './dto/emprestimo-response.dto';
import { MargemDisponivelDto } from './dto/margem-disponivel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('emprestimos')
export class EmprestimosController {
  constructor(private readonly emprestimosService: EmprestimosService) {}

  @UseGuards(JwtAuthGuard)
  @Get('margem-disponivel')
  async obterMargemDisponivel(@Request() req): Promise<MargemDisponivelDto> {
    const funcionarioId = req.user.sub;
    return this.emprestimosService.obterMargemDisponivel(funcionarioId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('solicitar')
  async solicitarEmprestimo(
    @Request() req,
    @Body() dto: SolicitarEmprestimoDto,
  ): Promise<EmprestimoResponseDto> {
    const funcionarioId = req.user.sub;
    return this.emprestimosService.solicitarEmprestimo(funcionarioId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('meus-emprestimos')
  async listarMeusEmprestimos(@Request() req): Promise<EmprestimoResponseDto[]> {
    const funcionarioId = req.user.sub;
    return this.emprestimosService.listarEmprestimos(funcionarioId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('empresa/:empresaId')
  async listarEmprestimosPorEmpresa(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ): Promise<EmprestimoResponseDto[]> {
    return this.emprestimosService.listarEmprestimosPorEmpresa(empresaId);
  }
}
