import {ActionError, defineAction} from 'astro:actions';
import {z} from 'astro:schema';
import {AUTHOR_EMAIL, colombiaDateTime, sendEmail} from '../lib/email';
import {firstNameOf, renderEmail, textToHtml} from '../lib/emailRenderer';
import {booksOf, createConfirmToken, DOWNLOAD_TTL_HOURS, newOrderId, orderSummary, type Order} from '../lib/fulfillment';

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
        handler: async ({name, email, message}, context) =>
        {
            const origin = context.url.origin;
            const firstName = firstNameOf(name);
            const messageHtml = textToHtml(message);

            await sendEmail({
                to: AUTHOR_EMAIL,
                replyTo: email,
                subject: `Nuevo mensaje de ${name}`,
                html: renderEmail('contact-notification', {
                    name,
                    firstName,
                    email,
                    messageHtml,
                    date: colombiaDateTime(),
                    replyUrl: `mailto:${email}?subject=${encodeURIComponent('Re: tu mensaje en rigobertomartinezautor.com')}`,
                    replyLabel: `Responder a ${firstName}`
                }, {
                    subject: `Nuevo mensaje de ${name}`,
                    preheader: message.slice(0, 110),
                    eyebrow: 'Formulario de contacto',
                    origin
                })
            });

            // Acuse al remitente: si falla, el mensaje ya llegó al autor.
            await sendEmail({
                to: email,
                replyTo: AUTHOR_EMAIL,
                subject: 'Recibí tu mensaje',
                html: renderEmail('contact-received', {
                    firstName,
                    messageHtml,
                    booksUrl: `${origin}/#libros`
                }, {
                    subject: 'Recibí tu mensaje',
                    preheader: 'Gracias por escribir. Te responderé en menos de 48 horas.',
                    eyebrow: 'Contacto',
                    origin,
                    signature: true,
                    footerNote: 'Recibes este correo porque escribiste desde el formulario de contacto.'
                })
            }).catch((err) => console.error('[contact] acknowledgement failed:', err));

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

            const origin = context.url.origin;
            const order: Order = {id: newOrderId(), name, email, phone, bookIds: lines.map((b) => b.id)};
            const summary = orderSummary(lines);
            const firstName = firstNameOf(name);
            const date = colombiaDateTime();
            const confirmUrl = `${origin}/order/confirm?token=${encodeURIComponent(createConfirmToken(order))}`;

            const notificationSubject = `Nuevo pedido ${order.id} · ${name} · ${summary.total}`;
            await sendEmail({
                to: AUTHOR_EMAIL,
                replyTo: email,
                subject: notificationSubject,
                html: renderEmail('order-notification', {
                    ...summary,
                    orderId: order.id,
                    name,
                    firstName,
                    email,
                    phone,
                    phoneHref: phone.replace(/[^\d+]/g, ''),
                    date,
                    confirmUrl,
                    ttlHours: DOWNLOAD_TTL_HOURS
                }, {
                    subject: notificationSubject,
                    preheader: `${summary.itemsLabel} por ${summary.total}. Confirma el pago para enviar los eBooks.`,
                    eyebrow: 'Nuevo pedido',
                    origin
                })
            });

            // Acuse al comprador. Si falla, el pedido ya quedó registrado en el correo del autor.
            const receivedSubject = `Recibimos tu pedido ${order.id}`;
            await sendEmail({
                to: email,
                replyTo: AUTHOR_EMAIL,
                subject: receivedSubject,
                html: renderEmail('order-received', {
                    ...summary,
                    orderId: order.id,
                    firstName,
                    email,
                    date,
                    steps: [
                        {title: 'Te escribo con los datos de pago', text: 'En menos de 48 horas recibirás en este correo las opciones para pagar.'},
                        {title: 'Realizas el pago', text: 'Cuando lo recibo, confirmo tu pedido de inmediato.'},
                        {title: 'Descargas tus eBooks', text: `Te llega un enlace de descarga por cada libro, válido por ${DOWNLOAD_TTL_HOURS} horas.`}
                    ]
                }, {
                    subject: receivedSubject,
                    preheader: `Gracias, ${firstName}. Recibí tu pedido de ${summary.itemsLabel} por ${summary.total}.`,
                    eyebrow: 'Tu pedido',
                    origin,
                    signature: true,
                    footerNote: 'Recibes este correo porque hiciste un pedido en nuestra página.'
                })
            }).catch((err) => console.error('[order] buyer acknowledgement failed:', err));

            return {success: true, orderId: order.id, total: summary.totalValue};
        }
    })
};
