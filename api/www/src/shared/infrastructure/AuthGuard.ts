import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ConfigService } from '../../config/config.service';

export interface AuthGuardConfig {
  protected?: boolean;
}

export const AUTH_GUARD_CONFIG = Symbol('AUTH_GUARD_CONFIG');

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const handlerConfig = this.reflector.get<AuthGuardConfig>(
      AUTH_GUARD_CONFIG,
      context.getHandler(),
    );
    const controllerConfig = this.reflector.get<AuthGuardConfig>(
      AUTH_GUARD_CONFIG,
      context.getClass(),
    );

    if (controllerConfig?.protected || handlerConfig?.protected) {
      // if its protected, check for auth
      const authorization = context.switchToHttp().getRequest().headers.authorization;
      if (authorization) {
        const parts = authorization.split(' ');
        const token = parts[1];
        return token === this.configService.getAuthorizedToken();
      }
    } else {
      // otherwise, let pass
      return true;
    }
  }
}
