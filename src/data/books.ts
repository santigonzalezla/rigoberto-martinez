import type {ImageMetadata} from 'astro';
import coverProjectMonitoring from '../assets/images/cover-project-monitoring.webp';
import coverConchudos from '../assets/images/cover-conchudos.webp';
import coverInternalCustomer from '../assets/images/cover-internal-customer.webp';

/**
 * Catálogo de eBooks. Fuente: carpeta `Libros/` (páginas legales, reseñas y fichas del autor).
 * - shortDescription: tarjeta de la página principal (1–2 líneas).
 * - review / highlights / chapters / ficha: modal "Ver libro".
 * El `id` también es el nombre del PDF en private/ebooks/.
 */
export interface Book
{
    id: string;
    title: string;
    subtitle: string;
    category: string;
    edition: string;
    place: string;
    /** null mientras el autor no confirme el registro */
    isbn: string | null;
    audience: string;
    shortDescription: string;
    review: string[];
    highlights: string[];
    chapters: string[];
    keywords: string[];
    price: number;
    cover: ImageMetadata;
}

export const AUTHOR_NAME = 'Rigoberto Martínez Bermúdez';
export const BOOK_FORMAT = 'eBook (PDF)';

export const books: Book[] = [
    {
        id: 'project-monitoring',
        title: 'Monitoreo aplicado a proyectos',
        subtitle: 'Para evitar pérdidas, frustraciones, deficiencias, conflictos legales y daños a la reputación',
        category: 'Gestión de proyectos',
        edition: 'Primera edición',
        place: 'Colombia',
        isbn: null,
        audience: 'Gerentes, formuladores, supervisores y equipos de proyectos públicos y privados',
        shortDescription: 'Cómo monitorear un proyecto desde su formulación hasta su operación para anticipar sobrecostos, retrasos y fracasos, con el Modelo FEA: Formulación, Ejecución y Ajustes.',
        review: [
            'Esta publicación se ocupa del monitoreo como la forma más efectiva de garantizar el éxito de un proyecto, no solo en su formulación sino también en la ejecución, los ajustes y la operación. Aplicado con rigor y con tecnología de seguimiento apropiada, incluida la inteligencia artificial, el monitoreo evita los tropiezos que suelen tomar por sorpresa: ineficiencias, sobrecostos, cierres inesperados, acciones judiciales, desmotivación y pérdida de recursos.',
            'En lugar del control convencional, el libro plantea una gestión integrada por la formulación, la ejecución y los ajustes, atravesada por el monitoreo y seguida de un control que define e implanta las mejoras. De ahí nace el Modelo FEA, una guía práctica para quienes participan en la gestión de proyectos públicos y privados.'
        ],
        highlights: [
            'Las principales causas de fracaso de los proyectos y los riesgos que pueden derribarlos.',
            'Los ingredientes de un monitoreo efectivo, apoyado en tecnología de seguimiento e inteligencia artificial.',
            'El Modelo FEA: Formulación, Ejecución y Ajustes, con el monitoreo como acción transversal.',
            'Un control orientado a definir e implantar mejoras, no solo a señalar fallas.',
            'Factores clave de éxito para proyectos públicos y privados.'
        ],
        chapters: [],
        keywords: ['Monitoreo', 'Proyectos', 'Control', 'Gestión de riesgos', 'Indicadores', 'Éxito del proyecto', 'Causas de fracaso', 'Acción preventiva y correctiva'],
        price: 39900,
        cover: coverProjectMonitoring
    },
    {
        id: 'conchudos',
        title: '¡Fuera, Conchudos!',
        subtitle: 'Detéctalos y libérate de ellos',
        category: 'Comportamiento humano',
        edition: 'Primera edición',
        place: 'Bogotá D. C., Colombia',
        isbn: '978-628-01-9993-1',
        audience: 'Lectores adultos, familias, docentes, líderes de equipo y profesionales de la conducta',
        shortDescription: 'Una mirada directa a la conchudez en la familia, el estudio y el trabajo: cómo reconocer a quien vive a costa de otros y qué hacer para liberarte de su influencia.',
        review: [
            'Este libro ofrece una reflexión profunda sobre la conchudez y sus aspectos clave. Identifica los tipos más frecuentes de personas conchudas en la familia, el trabajo y la educación, describe las estrategias que usan para sostener ese patrón de conducta y entrega herramientas prácticas para reconocerlas y liberarse de su influencia.',
            'Sin rodeos, presenta a los tres actores de la conchudez, el vividor, el alcahuete y la víctima, e invita al lector a revisar de qué lado está, porque a veces jugamos en los tres bandos. Incluye una encuesta de autoevaluación y propuestas de acción para cada uno de los involucrados.'
        ],
        highlights: [
            'Quiénes son los actores de la conchudez: el vividor, el alcahuete y la víctima.',
            'Los rasgos, habilidades y causas que hay detrás del comportamiento conchudo.',
            'Cómo se manifiesta en la familia, la vida social, los estudios y el trabajo.',
            'Una encuesta de autoevaluación para descubrir de qué lado estás.',
            'Qué pueden hacer la familia, las víctimas, las instituciones educativas, las autoridades y la sociedad.'
        ],
        chapters: [
            'Generalidades de los conchudos y la conchudez',
            'Los conchudos a la orden del día',
            '¿Conchudo yo?',
            'Ante el panorama de la conchudez, ¿qué se puede hacer y por parte de quiénes?'
        ],
        keywords: ['Conchudez', 'Comportamiento', 'Relaciones familiares', 'Clima laboral', 'Autoevaluación'],
        price: 39900,
        cover: coverConchudos
    },
    {
        id: 'internal-customer',
        title: 'Atención centrada en el cliente interno',
        subtitle: 'Todos somos clientes y todos tenemos clientes',
        category: 'Cultura organizacional y servicio',
        edition: 'Primera edición',
        place: 'Bogotá D. C., Colombia',
        isbn: '978-628-02-0876-3',
        audience: 'Directivos, jefes de área, equipos de talento humano y servidores del sector público y privado',
        shortDescription: 'Un modelo práctico de endomarketing que pone primero a los colaboradores: cuando el equipo está bien atendido, el cliente externo también lo está.',
        review: [
            'El libro propone priorizar la satisfacción del cliente interno, es decir, de los colaboradores, como base para brindar un mejor servicio al cliente externo. Desde esta perspectiva, el endomarketing se presenta como una estrategia para fortalecer las relaciones entre compañeros, equipos y dependencias, mediante un equilibrio de cooperación, servicio y calidad en el intercambio de bienes y servicios internos.',
            'La obra desarrolla un modelo de gestión con fundamentos conceptuales, estrategias colectivas, herramientas de diagnóstico, criterios para evaluar la calidad del servicio interno y un plan de mejora por etapas. Su enfoque teórico-práctico promueve una cultura organizacional basada en el respeto, la actitud positiva, la colaboración y la atención de las necesidades tangibles e intangibles de los trabajadores.'
        ],
        highlights: [
            'Por qué el cliente interno debe atenderse antes que el externo.',
            'Un modelo colectivo con cuatro enfoques: dentro del equipo, dentro de la dependencia, entre dependencias y de la empresa hacia sus colaboradores.',
            'Canales, protocolos, actitud y momentos de verdad para una atención fuera de serie.',
            'Herramientas para diagnosticar la satisfacción y evaluar la calidad de los bienes y servicios internos.',
            'Un plan de mejoramiento por etapas, con roles y factores clave de éxito. Cada capítulo cierra con una autoevaluación.'
        ],
        chapters: [
            'Fundamentos del servicio al cliente interno',
            'Satisfacción del cliente interno mediante la gestión colectiva del servicio',
            'Atención fuera de serie al cliente interno',
            'Elementos estratégicos del servicio al cliente interno',
            'Diagnóstico de la percepción de satisfacción del cliente interno',
            'Plan de mejoramiento de la atención al cliente interno'
        ],
        keywords: ['Cliente interno', 'Endomarketing', 'Servicio', 'Cultura organizacional', 'Clima laboral', 'Calidad del servicio'],
        price: 39900,
        cover: coverInternalCustomer
    }
];

export const bookMeta = (book: Pick<Book, 'edition' | 'category'>) => `${book.edition} · ${book.category}`;

/** Ficha técnica para el modal y los datos estructurados */
export const bookDetails = (book: Book) => [
    {label: 'Autor', value: AUTHOR_NAME},
    {label: 'Edición', value: `${book.edition} · ${book.place}`},
    ...(book.isbn ? [{label: 'ISBN', value: book.isbn}] : []),
    {label: 'Formato', value: BOOK_FORMAT},
    {label: 'Idioma', value: 'Español'},
    {label: 'Categoría', value: book.category},
    {label: 'Dirigido a', value: book.audience}
];
