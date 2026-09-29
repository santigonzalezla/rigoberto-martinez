import {ActionError, defineAction} from 'astro:actions';
import {z} from 'astro:schema';
import {formatCOP} from '../data/format';
import {AUTHOR_EMAIL, button, escape, colombiaDateTime, layout, row, sendEmail} from '../lib/email';
import {booksOf, createConfirmToken, newOrderId, type Order} from '../lib/fulfillment';

// eBooks: una licencia por título; qty se ignora
const itemsSchema = z.array(z.object({id: z.string()})).min(1, 'El carrito está vacío').max(20);

export const server = {
    contact: defineAction({
        accept: 'form',
        input: z.object({
            name: z.string().trim().min(1, 'El nombre es requerido').max(120),
            email: z.string().trim().email('Correo inválido'),
            message: z.string().trim().min(1, 'Escribe tu mensaje').max(4000),
            dataConsent: z.string().min(1, 'Debes autorizar el tratamiento de datos')
        }),
        handler: async ({name, email, message}) =>
        {
            await sendEmail({
                to: AUTHOR_EMAIL,
                replyTo: email,
                subject: `Nuevo mensaje desde la web: ${name}`,
                html: layout('Nuevo mensaje desde rigobertomartinezautor.com', `
                  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                    ${row('Nombre', escape(name))}
                    ${row('Correo', `<a href="mailto:${escape(email)}">${escape(email)}</a>`)}
                    ${row('Mensaje', escape(message).replace(/\n/g, '<br/>'))}
                    ${row('Autorización datos', `Aceptada el ${colombiaDateTime()} (Colombia)`)}
                  </table>`)
            });
            return {success: true};
        }
    }),

    order: defineAction({
        accept: 'form',
        input: z.object({
            name: z.string().trim().min(1, 'El nombre es requerido').max(120),
            email: z.string().trim().email('Correo inválido'),
            phone: z.string().trim().min(7, 'Teléfono inválido').max(30),
            dataConsent: z.string().min(1, 'Debes autorizar el tratamiento de datos'),
            items: z.string()
        }),
        handler: async ({name, email, phone, items: rawItems}, context) =>
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
            // Títulos y precios salen del catálogo del servidor, nunca del cliente.
            const lines = result.success ? booksOf(result.data.map((i) => i.id)) : [];
            if (lines.length === 0)
            {
                throw new ActionError({code: 'BAD_REQUEST', message: 'Carrito inválido'});
            }

            const order: Order = {id: newOrderId(), name, email, phone, bookIds: lines.map((b) => b.id)};
            const total = lines.reduce((sum, b) => sum + b.price, 0);
            const confirmUrl = `${context.url.origin}/order/confirm?token=${encodeURIComponent(createConfirmToken(order))}`;

            const itemsHtml = lines.map((b) => `
              <tr>
                <td style="padding: 8px 10px;">${escape(b.title)}</td>
                <td style="padding: 8px 10px; text-align: center;">eBook</td>
                <td style="padding: 8px 10px; text-align: right;">${formatCOP(b.price)}</td>
              </tr>`).join('');

            await sendEmail({
                to: AUTHOR_EMAIL,
                replyTo: email,
                subject: `Nuevo pedido de eBooks ${order.id}: ${name} · ${formatCOP(total)}`,
                html: layout(`Nuevo pedido ${order.id}`, `
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
                    ${row('Pedido', escape(order.id))}
                    ${row('Nombre', escape(name))}
                    ${row('Correo', `<a href="mailto:${escape(email)}">${escape(email)}</a>`)}
                    ${row('Teléfono', escape(phone))}
                    ${row('Autorización datos', `Aceptada el ${colombiaDateTime()} (Colombia)`)}
                  </table>
                  <h3 style="margin-top: 28px;">Siguientes pasos</h3>
                  <ol style="line-height: 1.6; padding-left: 20px;">
                    <li>Responde a este correo con los datos de pago.</li>
                    <li>Cuando recibas el pago, pulsa el botón. El comprador recibirá sus eBooks sellados con su nombre y enlaces que vencen.</li>
                  </ol>
                  ${button(confirmUrl, 'Confirmar pago y enviar eBooks')}
                  <p style="color: #6B6862; font-size: 13px;">No reenvíes este correo: el botón entrega los libros a este comprador.</p>`)
            });

            // Acuse al comprador. Si falla (p. ej. dominio de envío sin verificar), el pedido ya quedó registrado.
            await sendEmail({
                to: email,
                replyTo: AUTHOR_EMAIL,
                subject: `Recibimos tu pedido ${order.id}`,
                html: layout(`Hola, ${escape(name)}`, `
                  <p>Recibimos tu pedido <strong>${escape(order.id)}</strong> por <strong>${formatCOP(total)}</strong>:</p>
                  <ul>${lines.map((b) => `<li>${escape(b.title)} (eBook)</li>`).join('')}</ul>
                  <p>En menos de 48 horas te escribiré con los datos de pago. Al confirmarlo recibirás los enlaces de descarga en este correo.</p>
                  <p style="color: #6B6862;">Rigoberto Martínez Bermúdez</p>`)
            }).catch((err) => console.error('[order] acuse al comprador falló:', err));

            return {success: true, orderId: order.id, total};
        }
    })
};
