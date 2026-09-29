import type {ImageMetadata} from 'astro';
import coverLider from '../assets/images/cover-lider.webp';
import coverConchudez from '../assets/images/cover-conchudez.webp';
import coverEndomarketing from '../assets/images/cover-endomarketing.webp';

export interface Book
{
    id: string;
    title: string;
    edition: string;
    year: number;
    category: string;
    synopsis: string;
    price: number;
    cover: ImageMetadata;
}

export const books: Book[] = [
    {
        id: 'lider-que-tu-equipo-necesita',
        title: 'Conviértete en el Líder que tu Equipo Necesita',
        edition: 'Primera edición',
        year: 2023,
        category: 'Liderazgo y gestión',
        synopsis: 'Los principios del liderazgo efectivo llevados a la práctica: 30 días para pasar del jefe improvisado al líder que su equipo necesita, con hábitos concretos para sostener autoridad, confianza y resultados.',
        price: 39900,
        cover: coverLider
    },
    {
        id: 'la-conchudez',
        title: 'La Conchudez',
        edition: 'Primera edición',
        year: 2023,
        category: 'Comportamiento organizacional',
        synopsis: 'Una radiografía de la conchudez en la familia, el trabajo y la educación: cómo identificarla, entender sus estrategias y liberarte de su influencia.',
        price: 39900,
        cover: coverConchudez
    },
    {
        id: 'endomarketing-y-cliente-interno',
        title: 'Endomarketing y Cliente Interno',
        edition: 'Primera edición',
        year: 2023,
        category: 'Cultura y servicio',
        synopsis: 'Un modelo de gestión que pone al colaborador primero: diagnóstico, estrategias colectivas y un plan de mejora por etapas.',
        price: 39900,
        cover: coverEndomarketing
    }
];

export const bookMeta = (book: Pick<Book, 'edition' | 'year' | 'category'>) =>
    `${book.edition} · ${book.year} · ${book.category}`;
