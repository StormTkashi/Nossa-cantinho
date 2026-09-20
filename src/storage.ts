import { Item } from './types';

const STORAGE_KEY = 'para-ela-items';

const INITIAL_ITEMS: Item[] = [
  {
    id: '1',
    name: 'Perfume Floral Delicado',
    price: 320.00,
    status: 'falta',
    priority: 'Não tenho',
    image: '',
    url: '',
    bought: false,
  },
  {
    id: '2',
    name: 'Hidratante Corporal Reparador',
    price: 79.90,
    status: 'acabando',
    priority: 'Acabando',
    image: '',
    url: '',
    bought: false,
  },
  {
    id: '3',
    name: 'Vela Aromática Lavanda Suave',
    price: 54.00,
    status: 'falta',
    priority: 'Não tenho',
    image: '',
    url: '',
    bought: true,
  }
];

export function getStoredItems(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ITEMS;
  }
}

export function saveStoredItems(items: Item[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Erro ao salvar no localStorage:', err);
  }
}

