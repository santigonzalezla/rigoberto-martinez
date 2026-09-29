import {useState} from 'react';
import {actions} from 'astro:actions';
import {toast} from 'sonner';
import styles from './ContactForm.module.css';

export default function ContactForm()
{
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>)
    {
        e.preventDefault();
        const form = e.currentTarget;
        setLoading(true);

        const {error} = await actions.contact(new FormData(form));

        if (error)
        {
            toast.error('No pudimos enviar tu mensaje. Intenta de nuevo en unos minutos.');
        }
        else
        {
            toast.success('Mensaje enviado. Te respondo personalmente en menos de 48 horas.');
            form.reset();
        }

        setLoading(false);
    }

    return (
        <form className={styles.formCard} onSubmit={handleSubmit} data-form-card>
            <label className={styles.field}>
                <span className={styles.label}>Nombre</span>
                <input className={styles.input} type="text" name="nombre" autoComplete="name" required/>
            </label>
            <label className={styles.field}>
                <span className={styles.label}>Correo</span>
                <input className={styles.input} type="email" name="email" autoComplete="email" required/>
            </label>
            <label className={styles.field}>
                <span className={styles.label}>Mensaje</span>
                <textarea className={`${styles.input} ${styles.textarea}`} name="mensaje" required/>
            </label>
            <label className={styles.consent}>
                <input type="checkbox" name="autorizacionDatos" required/>
                <span>Autorizo el tratamiento de mis datos personales para responder este mensaje (Ley 1581 de 2012).</span>
            </label>
            <button type="submit" className={`btnPrimary ${styles.submit}`} disabled={loading}>
                {loading ? 'Enviando…' : 'Enviar mensaje'}
            </button>
        </form>
    );
}
