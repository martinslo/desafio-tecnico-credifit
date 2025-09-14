import { Module } from '@nestjs/common';
import { EmprestimosController } from './emprestimos.controller';
import { EmprestimosService } from './emprestimos.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [EmprestimosController],
  providers: [EmprestimosService],
  exports: [EmprestimosService],
})
export class EmprestimosModule {}
