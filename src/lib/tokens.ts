import {createHmac, timingSafeEqual} from 'node:crypto';

/**
 * Tokens firmados sin estado: `base64url(payload).base64url(hmac)`.
 * No hace falta base de datos: la firma garantiza que nadie altera el contenido
 * y el campo `exp` hace que caduquen solos.
 */

function secret()
{
    const value = import.meta.env.DOWNLOAD_SECRET;
    if (!value || value.length < 32)
    {
        throw new Error('DOWNLOAD_SECRET no está configurado (mínimo 32 caracteres).');
    }
    return value;
}

const b64url = (buf: Buffer) => buf.toString('base64url');

function sign(data: string, purpose: string)
{
    // El propósito entra en la firma: un token de confirmación no sirve como token de descarga.
    return createHmac('sha256', secret()).update(`${purpose}.${data}`).digest();
}

export function createToken<T extends object>(purpose: string, payload: T, ttlSeconds: number)
{
    const body = b64url(Buffer.from(JSON.stringify({...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds})));
    return `${body}.${b64url(sign(body, purpose))}`;
}

export type VerifyResult<T> =
    | {ok: true; payload: T & {exp: number}}
    | {ok: false; reason: 'invalid' | 'expired'};

export function verifyToken<T extends object>(purpose: string, token: string): VerifyResult<T>
{
    const [body, sig] = token.split('.');
    if (!body || !sig) return {ok: false, reason: 'invalid'};

    const expected = sign(body, purpose);
    const given = Buffer.from(sig, 'base64url');
    if (given.length !== expected.length || !timingSafeEqual(given, expected))
    {
        return {ok: false, reason: 'invalid'};
    }

    let payload: T & {exp: number};
    try
    {
        payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    }
    catch
    {
        return {ok: false, reason: 'invalid'};
    }

    if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000)
    {
        return {ok: false, reason: 'expired'};
    }
    return {ok: true, payload};
}
