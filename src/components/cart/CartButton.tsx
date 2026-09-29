import {useEffect, useRef, useState} from 'react';
import {cart, countItems, useCart} from './cartStore';
import styles from './CartButton.module.css';

export default function CartButton()
{
    const {items, lastAddedAt} = useCart();
    const count = countItems(items);
    const [bump, setBump] = useState(false);
    const firstRender = useRef(true);

    useEffect(() =>
    {
        if (firstRender.current)
        {
            firstRender.current = false;
            return;
        }
        if (!lastAddedAt) return;
        setBump(true);
        const t = setTimeout(() => setBump(false), 420);
        return () => clearTimeout(t);
    }, [lastAddedAt]);

    return (
        <button
            type="button"
            className={`${styles.cartButton} ${bump ? styles.bump : ''}`}
            onClick={cart.open}
            aria-label={count ? `Abrir carrito, ${count} ${count === 1 ? 'libro' : 'libros'}` : 'Abrir carrito'}
        >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M1.70833 1.70833L2.62417 1.685C2.82203 1.68001 3.0152 1.74561 3.16911 1.87005C3.32302 1.99449 3.42761 2.16965 3.46417 2.36417L5.70583 14.32C5.74161 14.5111 5.84307 14.6837 5.99267 14.8079C6.14227 14.932 6.33058 15 6.525 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.8025 4.16667H17.4983C17.6223 4.16642 17.7448 4.19384 17.8569 4.24694C17.9689 4.30004 18.0677 4.37748 18.1461 4.47362C18.2244 4.56975 18.2803 4.68215 18.3096 4.80262C18.339 4.9231 18.3411 5.04861 18.3158 5.17L17.4608 10.3583C17.3781 10.7346 17.1676 11.0705 16.8651 11.309C16.5626 11.5475 16.1868 11.6739 15.8017 11.6667H5.20833" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 18.3333C15.9205 18.3333 16.6667 17.5871 16.6667 16.6667C16.6667 15.7462 15.9205 15 15 15C14.0795 15 13.3333 15.7462 13.3333 16.6667C13.3333 17.5871 14.0795 18.3333 15 18.3333Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.66667 18.3333C7.58714 18.3333 8.33333 17.5871 8.33333 16.6667C8.33333 15.7462 7.58714 15 6.66667 15C5.74619 15 5 15.7462 5 16.6667C5 17.5871 5.74619 18.3333 6.66667 18.3333Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {count > 0 && (
                <span className={styles.badge} key={count}>{count}</span>
            )}
        </button>
    );
}
