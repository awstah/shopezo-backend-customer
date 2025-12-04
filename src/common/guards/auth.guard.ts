import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { supabase } from '../../config/supabase.config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
	constructor(private reflector: Reflector) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
			context.getHandler(),
			context.getClass(),
		]);

		const request = context.switchToHttp().getRequest<Request>();
		const token = request.headers.authorization?.replace('Bearer ', '');

		// MISSING TOKEN
		if (!token) throw new UnauthorizedException('Missing access token');

		const { data: { user }, error } = await supabase.auth.getUser(token);

		// TOKEN EXPIRED
		if (error?.message?.toLowerCase().includes('token is expired')) {
			throw new UnauthorizedException({
				message: "token_expired",
				reason: "Token expired"
			});
		}
		console.log({ error });

		// INVALID TOKEN
		if (error || !user) throw new UnauthorizedException('Invalid token');

		request['user'] = user; // Attach to request

		// Check role from user_metadata
		const userRole = user.user_metadata?.role;

		if (!requiredRoles || requiredRoles.length === 0) return true;
		return requiredRoles.includes(userRole);
	}
}

export class RefreshTokenGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();

		const refreshToken = req.headers["x-refresh-token"] 

		if (!refreshToken) throw new UnauthorizedException("Refresh token missing");

		req.refreshToken = refreshToken;
		return true;
	}
}

export class OptionalGuard {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = request.headers.authorization?.replace('Bearer ', '');

		if (!token) {
			// No token = public request
			request.user = null;
			return true;
		}

		const { data: { user }, error } = await supabase.auth.getUser(token);

		if (error || !user) {
			// Invalid token but request still allowed (as guest)
			request.user = null;
			return true;
		}

		// Valid user attach karo
		request.user = user;
		return true;
	}
}
