import {ActionError} from 'astro:actions';
import {Resend} from 'resend';

// Se crea al primer envío: sin API key, Resend lanza error al construirse y tumbaría rutas que no envían correo.
let resend: Resend | null = null;

export const AUTHOR_EMAIL = import.meta.env.CONTACT_EMAIL ?? 'contacto@rigobertomartinezautor.com';
// Para escribirle a los compradores, Resend exige un dominio verificado.
const FROM = import.meta.env.EMAIL_FROM ?? 'Rigoberto Martínez <contacto@rigobertomartinezautor.com>';

export const colombiaDateTime = (date = new Date()) =>
    date.toLocaleString('es-CO', {timeZone: 'America/Bogota', dateStyle: 'long', timeStyle: 'short'});

export async function sendEmail({to, subject, html, replyTo}: {to: string; subject: string; html: string; replyTo?: string})
{
    resend ??= new Resend(import.meta.env.RESEND_API_KEY);
    const {error} = await resend.emails.send({from: FROM, to: [to], replyTo, subject, html});
    if (error)
    {
        throw new ActionError({code: 'INTERNAL_SERVER_ERROR', message: error.message});
    }
}
