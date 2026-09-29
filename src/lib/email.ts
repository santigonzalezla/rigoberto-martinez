import {ActionError} from 'astro:actions';
import {Resend} from 'resend';

// Se crea al primer envío: sin API key, Resend lanza error al construirse y tumbaría rutas que no envían correo.
let resend: Resend | null = null;

export const AUTHOR_EMAIL = import.meta.env.CONTACT_EMAIL ?? 'contacto@rigobertomartinezautor.com';
// Para escribirle a los compradores, Resend exige un dominio verificado (p. ej. libros@rigobertomartinezautor.com).
const FROM = import.meta.env.EMAIL_FROM ?? 'Rigoberto Martínez · Libros <onboarding@resend.dev>';

export const escape = (value: string) =>
    value.replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]!);

export const row = (label: string, value: string) => `
  <tr>
    <td style="padding: 10px; background: #F4F1EC; font-weight: bold; width: 35%;">${label}</td>
    <td style="padding: 10px;">${value}</td>
  </tr>`;

export const button = (href: string, label: string) => `
  <a href="${escape(href)}" style="display: inline-block; margin: 8px 0; padding: 14px 26px; background: #232321; color: #F4F1EC; border-radius: 999px; text-decoration: none; font-weight: bold;">${label}</a>`;

export const layout = (title: string, body: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #232321;">
    <h2 style="border-bottom: 2px solid #C68B84; padding-bottom: 8px;">${title}</h2>
    ${body}
  </div>`;

export const colombiaDateTime = () => new Date().toLocaleString('es-CO', {timeZone: 'America/Bogota'});

export async function sendEmail({to, subject, html, replyTo}: {to: string; subject: string; html: string; replyTo?: string})
{
    resend ??= new Resend(import.meta.env.RESEND_API_KEY);
    const {error} = await resend.emails.send({from: FROM, to: [to], replyTo, subject, html});
    if (error)
    {
        throw new ActionError({code: 'INTERNAL_SERVER_ERROR', message: error.message});
    }
}
