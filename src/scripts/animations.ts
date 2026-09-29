import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {initTilt} from "./tilt";

gsap.registerPlugin(ScrollTrigger);

const ease = "power3.out";
const easeExpo = "expo.out";

// ── Scroll suave ─────────────────────────────
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion)
{
    const lenis = new Lenis({duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))});
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Anclas internas con el mismo scroll suave, compensando el nav sticky
    document.addEventListener("click", (e) =>
    {
        const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
        if (!link || link.hash.length < 2) return;
        const target = document.querySelector<HTMLElement>(link.hash);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(link.hash === "#top" ? 0 : target, {offset: -72});
        history.replaceState(null, "", link.hash);
    });

    window.addEventListener("rm:scroll-lock", (e) =>
    {
        (e as CustomEvent<boolean>).detail ? lenis.stop() : lenis.start();
    });
}

initTilt();

// ── Coreografía ───────────────────────────────
const mm = gsap.matchMedia();
// Solo la landing tiene coreografía; las páginas de utilidad (descargas, confirmación) no.
const isLanding = Boolean(document.querySelector("[data-intro]"));

if (isLanding) mm.add("(prefers-reduced-motion: no-preference)", () =>
{
    // Entrada del hero. Se hace visible y en el mismo frame se aplica el estado inicial.
    gsap.set("[data-intro]", {visibility: "visible", animation: "none"});
    gsap.timeline({defaults: {ease, duration: 0.8}})
        .from("[data-navbar]", {autoAlpha: 0, y: -24, duration: 0.6})
        .from("[data-hero-portrait]", {clipPath: "inset(100% 0% 0% 0% round 32px)", duration: 1.3, ease: "expo.inOut"}, 0)
        .from("[data-hero-portrait-img]", {scale: 1.12, duration: 1.6, ease: easeExpo}, 0.1)
        .from("[data-hero-fade]:first-child", {autoAlpha: 0, y: 16, duration: 0.6}, 0.25)
        .from("[data-hero-word]", {yPercent: 110, duration: 0.9, stagger: 0.04, ease: easeExpo}, 0.3)
        .from(".heroSubtitle[data-hero-fade]", {autoAlpha: 0, y: 20}, 0.7)
        .from(".heroCtas[data-hero-fade]", {autoAlpha: 0, y: 16}, 0.85)
        .from("[data-hero-credential]", {
            autoAlpha: 0,
            y: 40,
            rotateX: -18,
            transformOrigin: "50% 100%",
            duration: 1,
            ease: easeExpo
        }, 0.9);

    // Franja de credibilidad
    gsap.from("[data-cred-item]", {
        scrollTrigger: {trigger: "[data-cred-item]", start: "top 92%", once: true},
        autoAlpha: 0, y: 10, duration: 0.6, stagger: 0.06, ease
    });

    // Encabezado "Mis publicaciones": los filetes crecen desde el título
    const heading = document.querySelector("[data-books-heading]");
    if (heading)
    {
        const tl = gsap.timeline({scrollTrigger: {trigger: heading, start: "top 82%", once: true}});
        tl.from(heading.querySelector("[data-reveal]"), {autoAlpha: 0, y: 24, duration: 0.8, ease})
            .from(heading.querySelectorAll("[data-heading-line]"), {scaleX: 0, duration: 1.1, ease: "expo.inOut"}, 0.1);
    }

    // Filas de libros: la portada gira en 3D hacia su lugar y el detalle entra en cascada
    document.querySelectorAll<HTMLElement>("[data-book-row]").forEach((row) =>
    {
        const fromRight = row.dataset.direction === "right";
        const cover = row.querySelector("[data-cover-reveal]");
        const detail = row.querySelector("[data-book-detail]");

        const tl = gsap.timeline({scrollTrigger: {trigger: row, start: "top 78%", once: true}});
        tl.from(cover, {
            autoAlpha: 0,
            rotateY: fromRight ? -24 : 24,
            rotateX: 6,
            z: -140,
            x: fromRight ? 60 : -60,
            transformOrigin: fromRight ? "100% 50%" : "0% 50%",
            duration: 1.4,
            ease: easeExpo
        });
        if (detail)
        {
            tl.from(detail.children, {autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.07, ease}, 0.2);
        }

        // Parallax leve (±8px) mientras la fila cruza el viewport
        gsap.fromTo(row.querySelector("[data-cover-parallax]"), {y: 8}, {
            y: -8,
            ease: "none",
            scrollTrigger: {trigger: row, start: "top bottom", end: "bottom top", scrub: true}
        });
    });

    // Acerca de
    const aboutTl = gsap.timeline({scrollTrigger: {trigger: "#sobre-el-autor", start: "top 70%", once: true}});
    aboutTl.from("[data-about-avatar]", {autoAlpha: 0, scale: 0.9, y: 20, duration: 1, ease: easeExpo})
        .from("[data-about-item]", {autoAlpha: 0, y: 20, duration: 0.8, stagger: 0.08, ease}, 0.15)
        .from("[data-about-chip]", {autoAlpha: 0, y: 12, scale: 0.96, duration: 0.6, stagger: 0.06, ease}, 0.5);

    // Contacto: copy en cascada y la tarjeta del formulario se levanta desde la perspectiva
    const contactTl = gsap.timeline({scrollTrigger: {trigger: "#contacto", start: "top 70%", once: true}});
    contactTl.from("[data-contact-item]", {autoAlpha: 0, y: 20, duration: 0.8, stagger: 0.07, ease})
        .from("[data-contact-form]", {
            autoAlpha: 0,
            y: 60,
            rotateX: 10,
            transformOrigin: "50% 100%",
            duration: 1.2,
            ease: easeExpo
        }, 0.1);

    gsap.from("[data-footer] > *", {
        scrollTrigger: {trigger: "[data-footer]", start: "top 90%", once: true},
        autoAlpha: 0, y: 16, duration: 0.7, stagger: 0.08, ease
    });
});

// Con movimiento reducido: solo fundidos de opacidad, sin desplazamientos
if (isLanding) mm.add("(prefers-reduced-motion: reduce)", () =>
{
    gsap.from("[data-book-row], #sobre-el-autor, #contacto", {autoAlpha: 0, duration: 0.4});
});

// Las fuentes y las imágenes pueden cambiar alturas: recalcular triggers
window.addEventListener("load", () => ScrollTrigger.refresh());
