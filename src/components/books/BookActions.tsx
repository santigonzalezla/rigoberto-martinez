import {cart, isInCart, useCart} from '../cart/cartStore';
import styles from './BookActions.module.css';

interface Props
{
    id: string;
    title: string;
}

export default function BookActions({id, title}: Props)
{
    const {items} = useCart();
    const added = isInCart(items, id);

    return (
        <div className={styles.actions}>
            <button
                type="button"
                className={`btnPrimary ${styles.addButton} ${added ? styles.isAdded : ''}`}
                onClick={() => (added ? cart.open() : cart.add(id))}
                aria-label={added ? `${title} ya está en el carrito. Abrir carrito` : `Agregar ${title} al carrito`}
            >
                <span className={`${styles.label} ${added ? styles.hidden : ''}`} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                        <path d="M1.5375 1.5375L2.36175 1.5165C2.53982 1.51201 2.71368 1.57105 2.8522 1.68305C2.99072 1.79504 3.08485 1.95268 3.11775 2.12775L5.13525 12.888C5.16745 13.06 5.25877 13.2153 5.3934 13.3271C5.52804 13.4388 5.69752 13.5 5.8725 13.5H13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3.42225 3.75H15.7485C15.8601 3.74977 15.9703 3.77446 16.0712 3.82225C16.172 3.87004 16.261 3.93974 16.3315 4.02625C16.402 4.11277 16.4522 4.21393 16.4787 4.32236C16.5051 4.43079 16.507 4.54375 16.4843 4.653L15.7147 9.3225C15.6403 9.6611 15.4508 9.96345 15.1786 10.1781C14.9063 10.3928 14.5681 10.5065 14.2215 10.5H4.6875" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.5 16.5C14.3284 16.5 15 15.8284 15 15C15 14.1716 14.3284 13.5 13.5 13.5C12.6716 13.5 12 14.1716 12 15C12 15.8284 12.6716 16.5 13.5 16.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 16.5C6.82843 16.5 7.5 15.8284 7.5 15C7.5 14.1716 6.82843 13.5 6 13.5C5.17157 13.5 4.5 14.1716 4.5 15C4.5 15.8284 5.17157 16.5 6 16.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Agregar al carrito
                </span>
                <span className={`${styles.label} ${added ? '' : styles.hidden}`} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path className={styles.check} d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Agregado
                </span>
            </button>
            <span className="srOnly" aria-live="polite">{added ? `${title} está en el carrito` : ''}</span>
            <button type="button" className="btnGhost" onClick={() => cart.preview(id)}>
                Ver libro
            </button>
        </div>
    );
}
