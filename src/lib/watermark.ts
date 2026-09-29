import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {PDFDocument, StandardFonts, degrees, rgb} from 'pdf-lib';

export interface Licensee
{
    name: string;
    email: string;
    orderId: string;
}

/**
 * Carpeta privada con los PDF originales. Nunca se sirve como archivo público:
 * en Vercel se incluye dentro de la función (ver `includeFiles` en astro.config.mjs).
 */
const EBOOKS_DIR = import.meta.env.EBOOKS_DIR ?? path.join(process.cwd(), 'private', 'ebooks');

export const ebookPath = (bookId: string) => path.join(EBOOKS_DIR, `${bookId}.pdf`);

// Las fuentes estándar de PDF solo codifican Latin-1; lo demás se reemplaza para no romper el sellado.
const latin1 = (text: string) => text.normalize('NFC').replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');

/**
 * Devuelve una copia del eBook marcada con los datos del comprador:
 * - pie de página visible en cada página
 * - sello diagonal muy tenue en el centro de cada página
 * - metadatos del PDF (autor de la licencia, pedido y fecha)
 */
export async function watermarkEbook(bookId: string, bookTitle: string, licensee: Licensee)
{
    const original = await readFile(ebookPath(bookId));
    const pdf = await PDFDocument.load(original, {updateMetadata: false});
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    const date = new Date().toLocaleDateString('es-CO', {timeZone: 'America/Bogota'});
    const footer = latin1(`Licencia personal de ${licensee.name} · ${licensee.email} · Pedido ${licensee.orderId} · ${date} · Prohibida su distribución`);
    const stamp = latin1(`${licensee.email} · ${licensee.orderId}`);

    for (const page of pdf.getPages())
    {
        const {width, height} = page.getSize();

        let size = 7;
        while (size > 4.5 && font.widthOfTextAtSize(footer, size) > width - 40) size -= 0.5;
        page.drawText(footer, {
            x: (width - font.widthOfTextAtSize(footer, size)) / 2,
            y: 14,
            size,
            font,
            color: rgb(0.42, 0.41, 0.38),
            opacity: 0.85
        });

        const stampSize = Math.min(width, height) / 26;
        const stampWidth = font.widthOfTextAtSize(stamp, stampSize);
        const angle = Math.atan2(height, width);
        page.drawText(stamp, {
            x: width / 2 - (stampWidth / 2) * Math.cos(angle),
            y: height / 2 - (stampWidth / 2) * Math.sin(angle),
            size: stampSize,
            font,
            rotate: degrees((angle * 180) / Math.PI),
            color: rgb(0.5, 0.45, 0.4),
            opacity: 0.06
        });
    }

    pdf.setTitle(bookTitle);
    pdf.setAuthor('Rigoberto Martínez Bermúdez');
    pdf.setSubject(`Licencia personal de ${licensee.name} <${licensee.email}> · Pedido ${licensee.orderId}`);
    pdf.setKeywords([licensee.orderId, licensee.email, 'licencia-personal']);
    pdf.setProducer('rigobertomartinezautor.com');
    pdf.setModificationDate(new Date());

    return pdf.save();
}
