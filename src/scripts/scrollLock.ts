/**
 * Bloquea el scroll de fondo mientras hay un drawer o modal abierto.
 * animations.ts escucha el evento para pausar Lenis.
 */
let locks = 0;

export function lockScroll(lock: boolean)
{
    locks = Math.max(0, locks + (lock ? 1 : -1));
    const locked = locks > 0;
    document.documentElement.classList.toggle('scrollLocked', locked);
    window.dispatchEvent(new CustomEvent('rm:scroll-lock', {detail: locked}));
}
