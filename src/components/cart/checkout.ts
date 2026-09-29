import {actions} from 'astro:actions';
import type {CartItem} from './cartStore';

/**
 * Punto único de cierre de compra.
 * Hoy: envía el pedido por correo (acción `order`).
 * Mañana: aquí se crea la preferencia de Mercado Pago y se redirige a su checkout.
 */
export async function submitOrder(form: HTMLFormElement, items: CartItem[])
{
    const formData = new FormData(form);
    formData.set('items', JSON.stringify(items));
    return actions.order(formData);
}
