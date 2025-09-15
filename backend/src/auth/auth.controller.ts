import {
  Controller,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { RegisterFuncionarioDto } from './dto/register-funcionario.dto';
import { RegisterEmpresaDto } from './dto/register-empresa.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/funcionario')
  async registerFuncionario(@Body() data: RegisterFuncionarioDto) {
    return this.authService.registerFuncionario(data);
  }

  @Post('register/empresa')
  async registerEmpresa(@Body() data: RegisterEmpresaDto) {
    return this.authService.registerEmpresa(data);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() dto: LoginUsuarioDto): Promise<LoginResponseDto> {
    const usuario = await this.authService.validateUser(
      dto.email,
      dto.password,
    );
    if (!usuario) {
      throw new UnauthorizedException();
    }
    return this.authService.login(usuario);
  }
}
