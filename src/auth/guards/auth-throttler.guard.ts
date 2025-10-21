import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // Utiliser l'IP + email pour le rate limiting sur l'auth
    const email = req.body?.email || '';
    return `${req.ip}-${email}`;
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const { req } = context.switchToHttp().getRequest();
    
    // Rate limiting plus strict pour l'authentification
    const key = this.getTracker(req);
    const totalHits = await this.storageService.increment(key, ttl);
    
    if (totalHits > limit) {
      throw new Error('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
    }
    
    return true;
  }
}
