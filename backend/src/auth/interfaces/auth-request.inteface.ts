import { Request } from 'express';
import { UsuarioEntity } from '../../usuario/entities/usuario.entity';

export interface AuthRequest extends Request {
  user: UsuarioEntity;
}
