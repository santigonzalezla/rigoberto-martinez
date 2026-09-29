/**
 * Convierte todos los PNG/JPG de src/assets/images a WebP (máx 1920px de ancho, calidad 80).
 * Los originales se mueven a src/assets/images/_originals/ (misma estructura de carpetas).
 *
 * Uso:  node scripts/optimize-images.mjs
 */
import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('src/assets/images');
const ORIGINALS = path.join(ROOT, '_originals');
const MAX_WIDTH = 1920;
const QUALITY = 80;
const RASTER = /\.(png|jpe?g)$/i;

async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (full === ORIGINALS) continue;
            files.push(...(await walk(full)));
        } else if (RASTER.test(entry.name)) {
            files.push(full);
        }
    }
    return files;
}

const kb = (n) => (n / 1024).toFixed(0).padStart(6) + ' KB';

const files = await walk(ROOT);
if (files.length === 0) {
    console.log('No hay PNG/JPG que convertir.');
    process.exit(0);
}

let before = 0;
let after = 0;

for (const file of files) {
    const rel = path.relative(ROOT, file);
    const srcBytes = (await fs.stat(file)).size;
    const image = sharp(file);
    const meta = await image.metadata();

    const webpPath = file.replace(RASTER, '.webp');
    await image
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(webpPath);

    const outBytes = (await fs.stat(webpPath)).size;
    before += srcBytes;
    after += outBytes;

    const backup = path.join(ORIGINALS, rel);
    await fs.mkdir(path.dirname(backup), { recursive: true });
    await fs.rename(file, backup);

    const w = Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH);
    console.log(`${kb(srcBytes)} → ${kb(outBytes)}  ${rel}  (${w}px)`);
}

console.log('\n────────────────────────────────────────');
console.log(`Total: ${kb(before)} → ${kb(after)}  (-${(100 - (after / before) * 100).toFixed(1)}%)`);
console.log(`Originales guardados en: ${path.relative(process.cwd(), ORIGINALS)}`);
