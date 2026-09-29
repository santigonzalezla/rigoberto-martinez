import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {toast} from 'sonner';
import {cart, countItems, useCart, type CatalogBook} from './cartStore';
import {submitOrder} from './checkout';
import {formatCOP} from '../../data/format';
import {lockScroll} from '../../scripts/scrollLock';
import styles from './CartDrawer.module.css';

interface Props
{
    catalog: CatalogBook[];
}

type Step = 'cart' | 'checkout';

export default function CartDrawer({catalog}: Props)
{
    const {items, isOpen} = useCart();
    const [step, setStep] = useState<Step>('cart');
    const [loading, setLoading] = useState(false);
    const panelRef = useRef<HTMLElement>(null);
    const lastFocus = useRef<HTMLElement | null>(null);

    const lines = items
        .map((item) => ({item, book: catalog.find((b) => b.id === item.id)}))
        .filter((l): l is {item: typeof l.item; book: CatalogBook} => Boolean(l.book));
    const total = lines.reduce((sum, {book}) => sum + book.price, 0);
    const count = countItems(items);

    useEffect(() =>
    {
        if (!isOpen) return;
        lastFocus.current = document.activeElement as HTMLElement;
        lockScroll(true);
        const t = setTimeout(() => panelRef.current?.focus(), 60);

        const onKey = (e: KeyboardEvent) =>
        {
            if (e.key === 'Escape') cart.close();
        };
        window.addEventListener('keydown', onKey);

        return () =>
        {
            clearTimeout(t);
            window.removeEventListener('keydown', onKey);
            lockScroll(false);
            lastFocus.current?.focus?.();
        };
    }, [isOpen]);

    useEffect(() =>
    {
        if (!isOpen) setStep('cart');
    }, [isOpen]);

    useEffect(() =>
    {
        if (lines.length === 0) setStep('cart');
    }, [lines.length]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>)
    {
        e.preventDefault();
        setLoading(true);
        const {error} = await submitOrder(e.currentTarget, items);
        setLoading(false);

        if (error)
        {
            toast.error('No pudimos enviar tu pedido. Intenta de nuevo o escríbenos por correo.');
            return;
        }

        toast.success('Pedido recibido. Te escribiremos en menos de 48 horas con los datos de pago y, al confirmarlo, recibirás tus eBooks.');
        cart.clear();
        cart.close();
    }

    return createPortal(
        <div className={`${styles.root} ${isOpen ? styles.open : ''}`} aria-hidden={!isOpen}>
            <div className={styles.overlay} onClick={cart.close}/>
            <aside
                ref={panelRef}
                className={styles.panel}
                role="dialog"
                aria-modal="true"
                aria-label="Carrito de compras"
                tabIndex={-1}
                inert={!isOpen}
                data-lenis-prevent
            >
                <header className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>{step === 'cart' ? 'Tu carrito' : 'Tus datos'}</p>
                        <h2 className={styles.title}>
                            {step === 'cart'
                                ? `${count} ${count === 1 ? 'libro' : 'libros'}`
                                : 'Finalizar pedido'}
                        </h2>
                    </div>
                    <button type="button" className={styles.close} onClick={cart.close} aria-label="Cerrar carrito">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                    </button>
                </header>

                {lines.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyBooks} aria-hidden="true">
                            <span/><span/><span/>
                        </div>
                        <p className={styles.emptyTitle}>Tu carrito está vacío</p>
                        <p className={styles.emptyText}>Elige uno de los tres libros y aparecerá aquí.</p>
                        <a href="#libros" className="btnPrimary" onClick={cart.close}>Ver los libros</a>
                    </div>
                ) : step === 'cart' ? (
                    <>
                        <ul className={styles.list}>
                            {lines.map(({item, book}) => (
                                <li key={book.id} className={styles.line}>
                                    <img src={book.cover} alt="" className={styles.cover} width={64} height={84}/>
                                    <div className={styles.lineInfo}>
                                        <p className={styles.lineTitle}>{book.title}</p>
                                        <p className={styles.linePrice}>{formatCOP(book.price)}</p>
                                        <div className={styles.lineControls}>
                                            <span className={styles.format}>eBook · descarga digital</span>
                                            <button type="button" className={styles.remove} onClick={() => cart.remove(book.id)}>
                                                Quitar
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <footer className={styles.footer}>
                            <div className={styles.totalRow}>
                                <span>Subtotal</span>
                                <span className={styles.total}>{formatCOP(total)}</span>
                            </div>
                            <p className={styles.note}>Son libros digitales: después de confirmar el pago recibirás los enlaces de descarga en tu correo.</p>
                            <button type="button" className={`btnPrimary ${styles.fullWidth}`} onClick={() => setStep('checkout')}>
                                Continuar con el pedido
                            </button>
                        </footer>
                    </>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.fields}>
                            <label className={styles.field}>
                                <span>Nombre completo</span>
                                <input name="nombre" type="text" autoComplete="name" required/>
                            </label>
                            <label className={styles.field}>
                                <span>Correo</span>
                                <input name="email" type="email" autoComplete="email" required/>
                            </label>
                            <label className={styles.field}>
                                <span>Teléfono / WhatsApp</span>
                                <input name="telefono" type="tel" autoComplete="tel" required/>
                            </label>
                            <p className={styles.note}>Los eBooks se envían a este correo. Revisa que esté bien escrito.</p>
                            <label className={styles.consent}>
                                <input type="checkbox" name="autorizacionDatos" required/>
                                <span>Autorizo el tratamiento de mis datos personales para gestionar este pedido (Ley 1581 de 2012).</span>
                            </label>
                        </div>
                        <footer className={styles.footer}>
                            <div className={styles.totalRow}>
                                <span>Total · {count} {count === 1 ? 'libro' : 'libros'}</span>
                                <span className={styles.total}>{formatCOP(total)}</span>
                            </div>
                            <button type="submit" className={`btnPrimary ${styles.fullWidth}`} disabled={loading}>
                                {loading ? 'Enviando pedido…' : 'Enviar pedido'}
                            </button>
                            <button type="button" className={styles.back} onClick={() => setStep('cart')}>
                                Volver al carrito
                            </button>
                        </footer>
                    </form>
                )}
            </aside>
        </div>,
        document.body
    );
}
