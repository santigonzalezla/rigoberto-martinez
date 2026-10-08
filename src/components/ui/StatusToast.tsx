import {useEffect} from 'react';
import {toast} from 'sonner';
import AppToaster from './AppToaster';

interface Props
{
    type: 'success' | 'error';
    message: string;
    description?: string;
}

/** Muestra un aviso al cargar una página renderizada en el servidor (p. ej. después de un POST). */
export default function StatusToast({type, message, description}: Props)
{
    useEffect(() =>
    {
        // Espera un frame para que el Toaster esté montado
        const raf = requestAnimationFrame(() => toast[type](message, {description, duration: 6000}));
        return () => cancelAnimationFrame(raf);
    }, []);

    return <AppToaster/>;
}
