import {useSyncExternalStore} from 'react';

/** Versión serializable del libro, lista para pasar como prop a una isla. */
export interface CatalogBook
{
    id: string;
    title: string;
    meta: string;
    synopsis: string;
    price: number;
    cover: string;
}

export interface CartItem
{
    id: string;
    qty: number;
}

interface State
{
    items: CartItem[];
    isOpen: boolean;
    previewId: string | null;
    lastAddedAt: number;
}

const STORAGE_KEY = 'rm_cart';

// Todas las islas importan este módulo desde el mismo chunk, así que el estado es único.
let state: State = {items: [], isOpen: false, previewId: null, lastAddedAt: 0};
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate()
{
    if (hydrated || typeof window === 'undefined') return;
    hydrated = true;
    try
    {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
        if (Array.isArray(saved))
        {
            state = {
                ...state,
                // eBooks: una licencia por título, así que siempre qty = 1
                items: saved
                    .filter((i): i is CartItem => typeof i?.id === 'string')
                    .map((i) => ({id: i.id, qty: 1}))
            };
        }
    }
    catch
    {
        // Storage bloqueado o corrupto: seguimos con carrito vacío.
    }

    window.addEventListener('storage', (e) =>
    {
        if (e.key !== STORAGE_KEY) return;
        hydrated = false;
        hydrate();
        emit();
    });
}

function emit()
{
    listeners.forEach((l) => l());
}

function setState(patch: Partial<State>)
{
    state = {...state, ...patch};
    if (patch.items)
    {
        try
        {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
        }
        catch
        {
            // Sin persistencia; el carrito sigue funcionando en memoria.
        }
    }
    emit();
}

function subscribe(listener: () => void)
{
    hydrate();
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const serverState: State = {items: [], isOpen: false, previewId: null, lastAddedAt: 0};

export function useCart()
{
    return useSyncExternalStore(subscribe, () => state, () => serverState);
}

export const cart = {
    add(id: string)
    {
        if (state.items.some((i) => i.id === id)) return;
        setState({items: [...state.items, {id, qty: 1}], lastAddedAt: Date.now()});
    },
    remove(id: string)
    {
        setState({items: state.items.filter((i) => i.id !== id)});
    },
    clear()
    {
        setState({items: []});
    },
    open()
    {
        setState({isOpen: true, previewId: null});
    },
    close()
    {
        setState({isOpen: false});
    },
    preview(id: string | null)
    {
        setState({previewId: id});
    }
};

export const countItems = (items: CartItem[]) => items.length;

export const isInCart = (items: CartItem[], id: string) => items.some((i) => i.id === id);
