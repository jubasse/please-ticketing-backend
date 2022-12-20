import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jose from 'jose';

@Injectable()
export class CommonJWTService {
  private _cachedSecret: Uint8Array;
  private _cachedIssuer: string;
  private _cachedAudience: string;
  private _cachedAlgorithm: string;
  private _cachedExpirationTime: string;
  public constructor(private readonly configService: ConfigService) {}

  /**
   * Creates a JWT Token
   * @param {string} subject JWT token subject
   * @param payload JWT payload
   * @returns {Promise<string>}
   */
  public async sign(subject: string, payload): Promise<string> {
    const jwtSecret = this._secret();
    return await new jose.SignJWT(payload)
      .setExpirationTime(this._expirationTime())
      .setIssuedAt()
      .setIssuer(this._issuer())
      .setAudience(this._audience())
      .setSubject(subject)
      .setProtectedHeader({ alg: this._algorithm() })
      .sign(jwtSecret);
  }

  /**
   * Verifies if a given JWT token is valid
   * @param {string} jwtToken JWT Token to verify
   * @returns {Promise<jose.JWTVerifyResult}
   */
  public async verify(jwtToken: string): Promise<jose.JWTVerifyResult> {
    const jwtSecret = this._secret();
    return jose.jwtVerify(jwtToken, jwtSecret, {
      issuer: this._issuer(),
      audience: this._audience(),
      algorithms: [this._algorithm()],
    });
  }

  private _secret(): Uint8Array {
    if (!this._cachedSecret) {
      this._cachedSecret = new TextEncoder().encode(
        this.configService.get('JWT_SECRET'),
      );
    }
    return this._cachedSecret;
  }

  private _issuer(): string {
    if (!this._cachedIssuer) {
      this._cachedIssuer = this.configService.get('JWT_ISSUER');
    }
    return this._cachedIssuer;
  }

  private _audience(): string {
    if (!this._cachedAudience) {
      this._cachedAudience = this.configService.get('JWT_AUDIENCE');
    }
    return this._cachedAudience;
  }

  private _algorithm(): string {
    if (!this._cachedAlgorithm) {
      this._cachedAlgorithm = this.configService.get('JWT_ALGORITHM');
    }
    return this._cachedAlgorithm;
  }

  private _expirationTime(): string {
    if (!this._cachedExpirationTime) {
      this._cachedExpirationTime = this.configService.get(
        'JWT_EXPIRATION_TIME',
      );
    }
    return this._cachedExpirationTime;
  }
}
