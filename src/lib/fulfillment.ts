import {randomBytes} from 'node:crypto';
import {books, type Book} from '../data/books';
import {formatCOP} from '../data/format';
import {createToken, verifyToken} from './tokens';
import {AUTHOR_EMAIL, colombiaDateTime, sendEmail} from './email';
import {firstNameOf, renderEmail} from './emailRenderer';

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

/** Datos de resumen compartidos por las plantillas de pedido */
export function orderSummary(items: Book[])
{
    const totalValue = items.reduce((sum, b) => sum + b.price, 0);
    return {
        items: items.map((b) => ({id: b.id, title: b.title, isbn: b.isbn, price: formatCOP(b.price)})),
        itemsLabel: items.length === 1 ? '1 eBook' : `${items.length} eBooks`,
        total: formatCOP(totalValue),
        totalValue
    };
}

export async function fulfillOrder(order: Order, origin: string)
{
    const items = booksOf(order.bookIds);
    if (items.length === 0) throw new Error('El pedido no tiene libros válidos');

    const expires = colombiaDateTime(new Date(Date.now() + DOWNLOAD_TTL_HOURS * 3600 * 1000));
    const firstName = firstNameOf(order.name);
    const {itemsLabel} = orderSummary(items);

    const links = items.map((book) =>
    {
        const token = createToken<DownloadGrant>(
            DOWNLOAD_PURPOSE,
            {orderId: order.id, bookId: book.id, name: order.name, email: order.email},
            DOWNLOAD_TTL_HOURS * 3600
        );
        return {id: book.id, title: book.title, subtitle: book.subtitle, url: `${origin}/download/${token}`};
    });

    const subject = `${firstName}, tus eBooks están listos · Pedido ${order.id}`;
    await sendEmail({
        to: order.email,
        replyTo: AUTHOR_EMAIL,
        subject,
        html: renderEmail('ebooks-ready', {orderId: order.id, firstName, itemsLabel, links, expires}, {
            subject,
            preheader: `Pago confirmado. Descarga ${itemsLabel} antes del ${expires}.`,
            eyebrow: 'Tus eBooks',
            origin,
            signature: true,
            footerNote: 'Recibes este correo porque compraste en nuestra página. Los enlaces son personales.'
        })
    });

    return {links: links.length, expires};
}
