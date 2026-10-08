import {Toaster} from 'sonner';

/**
 * Toaster único del sitio. `richColors` da el color según el tipo:
 * success en verde, error en rojo. Solo se fijan tipografía y radio para no pisar esos colores.
 */
export default function AppToaster()
{
    return (
        <Toaster
            position="top-right"
            richColors
            closeButton
            offset={{top: 88, right: 24}}
            mobileOffset={{top: 76, right: 12, left: 12}}
            toastOptions={{
                style: {
                    fontFamily: 'Geist, sans-serif',
                    borderRadius: '14px'
                }
            }}
        />
    );
}
