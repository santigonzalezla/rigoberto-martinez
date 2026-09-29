/**
 * Inclinación 3D que sigue al puntero, con interpolación (lerp) para que tenga inercia.
 * Uso: data-tilt en el elemento, data-tilt-max="8" (grados), data-tilt-glare en un hijo opcional.
 * Solo en dispositivos con puntero fino y sin prefers-reduced-motion.
 */
const LERP = 0.1;

export function initTilt()
{
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) =>
    {
        const max = Number(el.dataset.tiltMax ?? 8);
        const glare = el.querySelector<HTMLElement>('[data-tilt-glare]');
        const hoverTarget = el.parentElement ?? el;
        const baseShadow = getComputedStyle(el).boxShadow;

        let tx = 0, ty = 0, cx = 0, cy = 0;
        let raf = 0;
        let active = false;

        const render = () =>
        {
            cx += (tx - cx) * LERP;
            cy += (ty - cy) * LERP;

            el.style.transform = `rotateX(${cy.toFixed(3)}deg) rotateY(${cx.toFixed(3)}deg)`;

            // La sombra se desplaza en sentido contrario a la inclinación: la luz viene de arriba-izquierda.
            if (baseShadow && baseShadow !== 'none')
            {
                const sx = (-cx * 1.6).toFixed(1);
                const sy = (18 + cy * 1.6).toFixed(1);
                el.style.boxShadow = `${sx}px ${sy}px 44px -18px rgba(62, 45, 30, 0.38), ${baseShadow}`;
            }

            const settled = Math.abs(tx - cx) < 0.01 && Math.abs(ty - cy) < 0.01;
            if (!active && settled)
            {
                el.style.transform = '';
                el.style.boxShadow = '';
                raf = 0;
                return;
            }
            raf = requestAnimationFrame(render);
        };

        const start = () =>
        {
            if (!raf) raf = requestAnimationFrame(render);
        };

        hoverTarget.addEventListener('pointerenter', () =>
        {
            active = true;
            if (glare) glare.style.opacity = '1';
            start();
        });

        hoverTarget.addEventListener('pointermove', (e) =>
        {
            const r = el.getBoundingClientRect();
            const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
            const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
            tx = (px - 0.5) * 2 * max;
            ty = -(py - 0.5) * 2 * max;
            if (glare)
            {
                glare.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
                glare.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
            }
            start();
        });

        hoverTarget.addEventListener('pointerleave', () =>
        {
            active = false;
            tx = 0;
            ty = 0;
            if (glare) glare.style.opacity = '0';
            start();
        });
    });
}
