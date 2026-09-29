import {randomBytes} from 'node:crypto';
import {books, type Book} from '../data/books';
import {formatCOP} from '../data/format';
import {createToken, verifyToken} from './tokens';
import {AUTHOR_EMAIL, button, escape, layout, sendEmail} from './email';

/**
 * Entrega de eBooks.
 * Flujo actual (pago manual):
 *   1. `order` (action) le envía al autor el pedido con un enlace firmado de confirmación.
 *   2. El autor verifica el pago y abre /order/confirm → `fulfillOrder()`.
 *   3. El comprador recibe un enlace de descarga por libro, que caduca y sella el PDF con sus datos.
 * Con Mercado Pago, el webhook de pago aprobado llamará directamente a `fulfillOrder()`.
 */

export interface Order
{
    id: string;
    name: string;
    email: string;
    phone: string;
    bookIds: string[];
}

export interface DownloadGrant
{
    orderId: string;
    bookId: string;
    name: string;
    email: string;
}

const CONFIRM_PURPOSE = 'order-confirm';
const DOWNLOAD_PURPOSE = 'ebook-download';
const CONFIRM_TTL = 60 * 60 * 24 * 30;
export const DOWNLOAD_TTL_HOURS = Number(import.meta.env.DOWNLOAD_TTL_HOURS ?? 72);

export const newOrderId = () =>
{
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `RM-${ymd}-${randomBytes(3).toString('hex').toUpperCase()}`;
};

export const booksOf = (ids: string[]) =>
    [...new Set(ids)].map((id) => books.find((b) => b.id === id)).filter((b): b is Book => Boolean(b));

export const createConfirmToken = (order: Order) => createToken(CONFIRM_PURPOSE, order, CONFIRM_TTL);
export const verifyConfirmToken = (token: string) => verifyToken<Order>(CONFIRM_PURPOSE, token);
export const verifyDownloadToken = (token: string) => verifyToken<DownloadGrant>(DOWNLOAD_PURPOSE, token);

export async function fulfillOrder(order: Order, origin: string)
{
    const items = booksOf(order.bookIds);
    if (items.length === 0) throw new Error('El pedido no tiene libros válidos');

    const expires = new Date(Date.now() + DOWNLOAD_TTL_HOURS * 3600 * 1000)
        .toLocaleString('es-CO', {timeZone: 'America/Bogota', dateStyle: 'long', timeStyle: 'short'});

    const links = items.map((book) =>
    {
        const token = createToken<DownloadGrant>(
            DOWNLOAD_PURPOSE,
            {orderId: order.id, bookId: book.id, name: order.name, email: order.email},
            DOWNLOAD_TTL_HOURS * 3600
        );
        return {book, url: `${origin}/download/${token}`};
    });

    await sendEmail({
        to: order.email,
        replyTo: AUTHOR_EMAIL,
        subject: `Tus eBooks están listos · Pedido ${order.id}`,
        html: layout(`Gracias por tu compra, ${escape(order.name)}`, `
          <p>Tu pago del pedido <strong>${escape(order.id)}</strong> fue confirmado. Aquí están tus libros:</p>
          ${links.map(({book, url}) => `
            <div style="padding: 16px 0; border-bottom: 1px solid #DBD6CD;">
              <p style="margin: 0 0 4px; font-size: 17px; font-weight: bold;">${escape(book.title)}</p>
              <p style="margin: 0 0 8px; color: #6B6862;">eBook en PDF · ${formatCOP(book.price)}</p>
              ${button(url, 'Descargar PDF')}
            </div>`).join('')}
          <p style="margin-top: 20px; color: #6B6862; font-size: 14px;">
            Los enlaces son personales y vencen el <strong>${expires}</strong> (hora de Colombia).
            Descarga los archivos y guárdalos en tu dispositivo.
          </p>
          <p style="color: #6B6862; font-size: 14px;">
            Cada PDF lleva tu nombre y tu correo como licencia de uso personal. Por favor no lo compartas.
            Si necesitas copias para tu equipo, responde este correo y te ayudo con una licencia corporativa.
          </p>`)
    });

    return {links: links.length, expires};
}
