import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import envConfig from '../config';
import { AccessTokenPayload, AccessTokenPayloadCreate, RefresTokenPayload, RefresTokenPayloadCreate } from '../types/jwt.type';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
    generateTwoFactorSecret(arg0: { name: string; account: string; }): { secret: any; uri: any; } {
      throw new Error('Method not implemented.');
    }
    constructor(
        private readonly jwtService: JwtService,
    ) { }
    signAccessToken(payload:AccessTokenPayloadCreate) {
        return this.jwtService.sign({...payload,uuid:uuidv4()}, {
            secret: envConfig.ACCESS_TOKEN_SECRET,
            expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
            algorithm: 'HS256'
        })
    }
    signRefreshToken(payload: RefresTokenPayloadCreate) {
        return this.jwtService.sign({...payload,uuid:uuidv4()}, {
            secret: envConfig.REFRESH_TOKEN_SECRET,
            expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
            algorithm: 'HS256'
        })
    }
    verifyAccessToken(token: string): Promise<AccessTokenPayload> {
        return this.jwtService.verifyAsync(token, {
            secret: envConfig.ACCESS_TOKEN_SECRET,
        });
    }
    verifyRefreshToken(token: string): Promise<RefresTokenPayload> {
        return this.jwtService.verifyAsync(token, {
            secret: envConfig.REFRESH_TOKEN_SECRET,
        });
    }
}
