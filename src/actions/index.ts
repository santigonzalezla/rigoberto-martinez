import {ActionError, defineAction} from 'astro:actions';
import {z} from 'astro:schema';
import {Resend} from 'resend';
import {books} from '../data/books';
import {formatCOP} from '../data/format';

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const TO = import.meta.env.CONTACT_EMAIL ?? 'contacto@rigobertomartinezautor.com';
const FROM = 'Rigoberto Martínez · Libros <onboarding@resend.dev>';

const escape = (value: string) =>
    value.replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]!);

const row = (label: string, value: string) => `
  <tr>
    <td style="padding: 10px; background: #F4F1EC; font-weight: bold; width: 35%;">${label}</td>
    <td style="padding: 10px;">${value}</td>
  </tr>`;

const layout = (title: string, body: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #232321;">
    <h2 style="border-bottom: 2px solid #C68B84; padding-bottom: 8px;">${title}</h2>
    ${body}
  </div>`;

const fechaColombia = () => new Date().toLocaleString('es-CO', {timeZone: 'America/Bogota'});

async function send(subject: string, html: string, replyTo: string)
{
    const {error} = await resend.emails.send({from: FROM, to: [TO], replyTo, subject, html});
    if (error)
    {
        throw new ActionError({code: 'INTERNAL_SERVER_ERROR', message: error.message});
    }
}

// eBooks: una licencia por título; qty se ignora
const itemsSchema = z.array(z.object({id: z.string()})).min(1, 'El carrito está vacío').max(20);

export const server = {
    contact: defineAction({
        accept: 'form',
        input: z.object({
            nombre: z.string().trim().min(1, 'El nombre es requerido').max(120),
            email: z.string().trim().email('Correo inválido'),
            mensaje: z.string().trim().min(1, 'Escribe tu mensaje').max(4000),
            autorizacionDatos: z.string().min(1, 'Debes autorizar el tratamiento de datos')
        }),
        handler: async ({nombre, email, mensaje}) =>
        {
            await send(
                `Nuevo mensaje desde la web: ${nombre}`,
                layout('Nuevo mensaje desde rigobertomartinezautor.com', `
                  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                    ${row('Nombre', escape(nombre))}
                    ${row('Correo', `<a href="mailto:${escape(email)}">${escape(email)}</a>`)}
                    ${row('Mensaje', escape(mensaje).replace(/\n/g, '<br/>'))}
                    ${row('Autorización datos', `Aceptada el ${fechaColombia()} (Colombia)`)}
                  </table>`),
                email
            );
            return {success: true};
        }
    }),

    order: defineAction({
        accept: 'form',
        input: z.object({
            nombre: z.string().trim().min(1, 'El nombre es requerido').max(120),
            email: z.string().trim().email('Correo inválido'),
            telefono: z.string().trim().min(7, 'Teléfono inválido').max(30),
            autorizacionDatos: z.string().min(1, 'Debes autorizar el tratamiento de datos'),
            items: z.string()
        }),
        handler: async ({nombre, email, telefono, items: rawItems}) =>
        {
            let parsed: unknown;
            try
            {
                parsed = JSON.parse(rawItems);
            }
            catch
            {
                throw new ActionError({code: 'BAD_REQUEST', message: 'Carrito inválido'});
            }

            const result = itemsSchema.safeParse(parsed);
            if (!result.success)
            {
                throw new ActionError({code: 'BAD_REQUEST', message: 'Carrito inválido'});
            }

            // Títulos y precios salen del catálogo del servidor, nunca del cliente.
            const ids = [...new Set(result.data.map((i) => i.id))];
            const lines = ids.flatMap((id) =>
            {
                const book = books.find((b) => b.id === id);
                return book ? [{title: book.title, price: book.price}] : [];
            });

            if (lines.length === 0)
            {
                throw new ActionError({code: 'BAD_REQUEST', message: 'Carrito inválido'});
            }

            const total = lines.reduce((sum, l) => sum + l.price, 0);
            const itemsHtml = lines.map((l) => `
              <tr>
                <td style="padding: 8px 10px;">${escape(l.title)}</td>
                <td style="padding: 8px 10px; text-align: center;">eBook</td>
                <td style="padding: 8px 10px; text-align: right;">${formatCOP(l.price)}</td>
              </tr>`).join('');

            await send(
                `Nuevo pedido de eBooks: ${nombre} · ${formatCOP(total)}`,
                layout('Nuevo pedido desde la web', `
                  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                    <tr style="background: #232321; color: #F4F1EC;">
                      <th style="padding: 8px 10px; text-align: left;">Libro</th>
                      <th style="padding: 8px 10px;">Formato</th>
                      <th style="padding: 8px 10px; text-align: right;">Precio</th>
                    </tr>
                    ${itemsHtml}
                    <tr>
                      <td colspan="2" style="padding: 10px; font-weight: bold; border-top: 1px solid #DBD6CD;">Total</td>
                      <td style="padding: 10px; font-weight: bold; text-align: right; border-top: 1px solid #DBD6CD;">${formatCOP(total)}</td>
                    </tr>
                  </table>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
                    ${row('Nombre', escape(nombre))}
                    ${row('Correo', `<a href="mailto:${escape(email)}">${escape(email)}</a>`)}
                    ${row('Teléfono', escape(telefono))}
                    ${row('Autorización datos', `Aceptada el ${fechaColombia()} (Colombia)`)}
                  </table>
                  <p style="margin-top: 20px; color: #6B6862;">Responde a este correo con los datos de pago; al confirmarlo, envía los eBooks al comprador.</p>`),
                email
            );

            return {success: true, total};
        }
    })
};
