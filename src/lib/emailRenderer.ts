import Handlebars from 'handlebars';
import baseSource from '../emails/templates/base.hbs?raw';
import orderReceivedSource from '../emails/templates/order-received.hbs?raw';
import orderNotificationSource from '../emails/templates/order-notification.hbs?raw';
import ebooksReadySource from '../emails/templates/ebooks-ready.hbs?raw';
import contactNotificationSource from '../emails/templates/contact-notification.hbs?raw';
import contactReceivedSource from '../emails/templates/contact-received.hbs?raw';
import orderSummaryPartial from '../emails/templates/partials/order-summary.hbs?raw';
import buttonPartial from '../emails/templates/partials/button.hbs?raw';
import {AUTHOR_EMAIL} from './email';

/*
 * Plantillas Handlebars de los correos (src/emails/templates).
 * Se importan como texto con `?raw`, así quedan dentro del bundle de la función de Vercel
 * sin depender de rutas en disco. Cada plantilla se envuelve en base.hbs.
 */

export type EmailTemplateName =
    | 'order-received'
    | 'order-notification'
    | 'ebooks-ready'
    | 'contact-notification'
    | 'contact-received';

const sources: Record<EmailTemplateName, string> = {
    'order-received': orderReceivedSource,
    'order-notification': orderNotificationSource,
    'ebooks-ready': ebooksReadySource,
    'contact-notification': contactNotificationSource,
    'contact-received': contactReceivedSource
};

const hbs = Handlebars.create();
hbs.registerPartial('order-summary', orderSummaryPartial);
hbs.registerPartial('button', buttonPartial);
hbs.registerHelper('inc', (value: number) => value + 1);

const cache = new Map<string, Handlebars.TemplateDelegate>();

function compile(name: string, source: string)
{
    let template = cache.get(name);
    if (!template)
    {
        template = hbs.compile(source, {strict: false});
        cache.set(name, template);
    }
    return template;
}

export interface LayoutOptions
{
    subject: string;
    /** Texto de vista previa en la bandeja de entrada */
    preheader: string;
    /** Etiqueta pequeña del encabezado, p. ej. "Tu pedido" */
    eyebrow: string;
    /** Origen absoluto para imágenes y enlaces (https://…) */
    origin: string;
    signature?: boolean;
    footerNote?: string;
}

export function renderEmail(template: EmailTemplateName, context: Record<string, unknown>, layout: LayoutOptions)
{
    const shared = {assetsUrl: layout.origin, siteUrl: layout.origin, contactEmail: AUTHOR_EMAIL};
    const body = compile(template, sources[template])({...shared, ...context});

    return compile('base', baseSource)({
        ...shared,
        ...layout,
        body,
        year: new Date().getFullYear()
    });
}

/** "Santiago González" → "Santiago" */
export const firstNameOf = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** Texto plano multilínea → HTML seguro con saltos de línea */
export const textToHtml = (text: string) =>
    Handlebars.escapeExpression(text).replace(/\r?\n/g, '<br>');
