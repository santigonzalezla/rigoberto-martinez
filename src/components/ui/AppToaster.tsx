import {Toaster} from 'sonner';

/** Toaster único del sitio, con los colores de la marca. */
export default function AppToaster()
{
    return (
        <Toaster
            position="bottom-center"
            toastOptions={{
                style: {
                    fontFamily: 'Geist, sans-serif',
                    background: '#232321',
                    color: '#F4F1EC',
                    border: 'none',
                    borderRadius: '14px'
                }
            }}
        />
    );
}
