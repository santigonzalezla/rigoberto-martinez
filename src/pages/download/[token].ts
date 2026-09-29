import type {APIRoute} from 'astro';
import {booksOf, verifyDownloadToken} from '../../lib/fulfillment';
import {watermarkEbook} from '../../lib/watermark';

export const prerender = false;

const slug = (text: string) =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');

export const GET: APIRoute = async ({params, redirect}) =>
{
    const verified = verifyDownloadToken(params.token ?? '');
    if (!verified.ok)
    {
        return redirect(`/download-unavailable?reason=${verified.reason}`, 303);
    }

    const {orderId, bookId, name, email} = verified.payload;
    const [book] = booksOf([bookId]);
    if (!book)
    {
        return redirect('/download-unavailable?reason=invalid', 303);
    }

    try
    {
        // El PDF se sella en cada descarga: nunca existe una copia sin marca en una URL pública.
        const pdf = await watermarkEbook(book.id, book.title, {name, email, orderId});
        const filename = `${slug(book.title)}-${orderId}.pdf`;

        return new Response(pdf as Uint8Array<ArrayBuffer>, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'private, no-store',
                'X-Robots-Tag': 'noindex, nofollow',
                'Referrer-Policy': 'no-referrer'
            }
        });
    }
    catch (err)
    {
        console.error(`[download] ${orderId} ${bookId}:`, err);
        return redirect('/download-unavailable?reason=error', 303);
    }
};
