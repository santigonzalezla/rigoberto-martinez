/**
 * Genera PDFs de ejemplo en private/ebooks/ para probar la marca de agua y las descargas.
 * Reemplázalos por los eBooks reales con el mismo nombre de archivo (id del libro + .pdf).
 *
 * Uso:  node scripts/create-sample-ebooks.mjs
 */
import {PDFDocument, StandardFonts, rgb} from 'pdf-lib';
import {promises as fs} from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('private/ebooks');

const books = [
    {id: 'lider-que-tu-equipo-necesita', title: 'Conviértete en el Líder que tu Equipo Necesita'},
    {id: 'la-conchudez', title: 'La Conchudez'},
    {id: 'endomarketing-y-cliente-interno', title: 'Endomarketing y Cliente Interno'}
];

await fs.mkdir(OUT_DIR, {recursive: true});

for (const book of books)
{
    const target = path.join(OUT_DIR, `${book.id}.pdf`);
    const exists = await fs.stat(target).then(() => true, () => false);
    if (exists)
    {
        console.log(`Se conserva ${book.id}.pdf (ya existe)`);
        continue;
    }

    const pdf = await PDFDocument.create();
    const serif = await pdf.embedFont(StandardFonts.TimesRoman);
    const sans = await pdf.embedFont(StandardFonts.Helvetica);

    for (let n = 1; n <= 3; n++)
    {
        const page = pdf.addPage([432, 648]); // 6 × 9 in
        page.drawText(n === 1 ? book.title : `Capítulo ${n - 1}`, {x: 48, y: 560, size: n === 1 ? 20 : 16, font: serif, maxWidth: 336, lineHeight: 24});
        page.drawText('EJEMPLO — reemplazar por el eBook real', {x: 48, y: 520, size: 10, font: sans, color: rgb(0.78, 0.55, 0.52)});
        page.drawText('Rigoberto Martínez Bermúdez', {x: 48, y: 500, size: 10, font: sans, color: rgb(0.42, 0.41, 0.38)});
    }

    pdf.setTitle(book.title);
    pdf.setAuthor('Rigoberto Martínez Bermúdez');
    await fs.writeFile(target, await pdf.save());
    console.log(`Creado ${book.id}.pdf`);
}
