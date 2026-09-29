import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {lockScroll} from '../../scripts/scrollLock';
import styles from './MobileMenu.module.css';

const links = [
    {href: '#libros', label: 'Libros'},
    {href: '#sobre-el-autor', label: 'Sobre el autor'},
    {href: '#contacto', label: 'Contacto'}
];

export default function MobileMenu()
{
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() =>
    {
        setMounted(true);
    }, []);

    useEffect(() =>
    {
        if (!isOpen) return;
        lockScroll(true);
        document.documentElement.classList.add('menuOpen');
        const onKey = (e: KeyboardEvent) =>
        {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () =>
        {
            window.removeEventListener('keydown', onKey);
            document.documentElement.classList.remove('menuOpen');
            lockScroll(false);
        };
    }, [isOpen]);

    const portal = mounted
        ? createPortal(
            <div className={`${styles.root} ${isOpen ? styles.open : ''}`} aria-hidden={!isOpen}>
                <div className={styles.overlay} onClick={() => setIsOpen(false)}/>
                <nav className={styles.sheet} aria-label="Menú principal" inert={!isOpen}>
                    {links.map(({href, label}, i) => (
                        <a
                            key={href}
                            href={href}
                            className={styles.link}
                            style={{transitionDelay: isOpen ? `${80 + i * 50}ms` : '0ms'}}
                            onClick={() => setIsOpen(false)}
                        >
                            <span className={styles.index}>0{i + 1}</span>
                            {label}
                        </a>
                    ))}
                    <a href="#libros" className={`btnPrimary ${styles.cta}`} onClick={() => setIsOpen(false)}>
                        Comprar libros
                    </a>
                </nav>
            </div>,
            document.body
        )
        : null;

    return (
        <>
            <button
                type="button"
                className={`${styles.burger} ${isOpen ? styles.burgerOpen : ''}`}
                onClick={() => setIsOpen((v) => !v)}
                aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isOpen}
            >
                <span/>
                <span/>
            </button>
            {portal}
        </>
    );
}
