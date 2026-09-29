import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {cart, isInCart, useCart, type CatalogBook} from '../cart/cartStore';
import {formatCOP} from '../../data/format';
import {lockScroll} from '../../scripts/scrollLock';
import styles from './BookPreview.module.css';

interface Props
{
    catalog: CatalogBook[];
}

export default function BookPreview({catalog}: Props)
{
    const {previewId, items} = useCart();
    const isOpen = previewId !== null;
    // Conserva el último libro para que el contenido no desaparezca durante la salida.
    const [book, setBook] = useState<CatalogBook | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<HTMLDivElement>(null);

    useEffect(() =>
    {
        const next = catalog.find((b) => b.id === previewId);
        if (next) setBook(next);
    }, [previewId, catalog]);

    useEffect(() =>
    {
        if (!isOpen) return;
        const lastFocus = document.activeElement as HTMLElement | null;
        lockScroll(true);
        const t = setTimeout(() => dialogRef.current?.focus(), 60);
        const onKey = (e: KeyboardEvent) =>
        {
            if (e.key === 'Escape') cart.preview(null);
        };
        window.addEventListener('keydown', onKey);
        return () =>
        {
            clearTimeout(t);
            window.removeEventListener('keydown', onKey);
            lockScroll(false);
            lastFocus?.focus?.();
        };
    }, [isOpen]);

    // Libro 3D que sigue al puntero con interpolación suave
    useEffect(() =>
    {
        const el = bookRef.current;
        if (!isOpen || !el) return;
        if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let tx = -22, ty = 6, cx = -22, cy = 6, raf = 0;
        const loop = () =>
        {
            cx += (tx - cx) * 0.08;
            cy += (ty - cy) * 0.08;
            el.style.transform = `rotateY(${cx.toFixed(2)}deg) rotateX(${cy.toFixed(2)}deg)`;
            raf = requestAnimationFrame(loop);
        };
        const onMove = (e: PointerEvent) =>
        {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
            const py = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
            tx = -22 + px * 36;
            ty = 6 - py * 16;
        };
        window.addEventListener('pointermove', onMove);
        raf = requestAnimationFrame(loop);
        return () =>
        {
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', onMove);
            el.style.transform = '';
        };
    }, [isOpen]);

    const added = book ? isInCart(items, book.id) : false;

    function handleAdd()
    {
        if (!book) return;
        cart.add(book.id);
        cart.open();
    }

    return createPortal(
        <div className={`${styles.root} ${isOpen ? styles.open : ''}`} aria-hidden={!isOpen}>
            <div className={styles.overlay} onClick={() => cart.preview(null)}/>
            <div
                ref={dialogRef}
                className={styles.dialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="bookPreviewTitle"
                tabIndex={-1}
                inert={!isOpen}
                data-lenis-prevent
            >
                <button type="button" className={styles.close} onClick={() => cart.preview(null)} aria-label="Cerrar vista previa">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                </button>

                {book && (
                    <>
                        <div className={styles.stage}>
                            <div className={styles.book} ref={bookRef}>
                                <div className={styles.front}>
                                    <img src={book.cover} alt={`Portada de ${book.title}`}/>
                                    <span className={styles.glare}/>
                                </div>
                                <div className={styles.spine}/>
                                <div className={styles.pages}/>
                                <div className={styles.back}/>
                            </div>
                            <div className={styles.floor} aria-hidden="true"/>
                        </div>

                        <div className={styles.info}>
                            <p className={styles.meta}>{book.meta}</p>
                            <h2 id="bookPreviewTitle" className={styles.title}>{book.title}</h2>
                            <p className={styles.synopsis}>{book.synopsis}</p>
                            <div className={styles.buy}>
                                <span className={styles.price}>{formatCOP(book.price)}</span>
                                <button type="button" className="btnPrimary" onClick={handleAdd}>
                                    {added ? 'Agregado · Ver carrito' : 'Agregar al carrito'}
                                </button>
                            </div>
                            <p className={styles.note}>eBook · Rigoberto Martínez Bermúdez</p>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}
