import { CartItem } from '../types';

const CART_STORAGE_KEY = 'northbros_garage_cart';
const ORDERS_STORAGE_KEY = 'northbros_customer_orders';
const CUSTOMER_DETAILS_KEY = 'northbros_customer_details';

export interface StoredCustomerDetails {
  customerName: string;
  customerEmail: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * Retrieves draft or saved customer checkout details from localStorage.
 */
export function getStoredCustomerDetails(): Partial<StoredCustomerDetails> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CUSTOMER_DETAILS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.error('Failed to parse customer details from localStorage:', err);
    return {};
  }
}

/**
 * Saves customer checkout details to localStorage so they survive page refresh/reloads.
 */
export function saveStoredCustomerDetails(details: Partial<StoredCustomerDetails>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredCustomerDetails();
    const updated = { ...existing, ...details };
    localStorage.setItem(CUSTOMER_DETAILS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save customer details to localStorage:', err);
  }
}

/**
 * Clears stored customer checkout details from localStorage.
 */
export function clearStoredCustomerDetails(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOMER_DETAILS_KEY);
  } catch (err) {
    console.error('Failed to clear customer details from localStorage:', err);
  }
}

/**
 * Loads the stored cart items from localStorage.
 * Always returns an array (empty if not found or corrupted).
 */
export function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Validate that each item has a product and quantity
      return parsed.filter(item => item && item.product && typeof item.quantity === 'number' && item.quantity > 0);
    }
    return [];
  } catch (err) {
    console.error('Failed to parse cart from localStorage:', err);
    return [];
  }
}

/**
 * Saves the shopping cart items to localStorage.
 */
export function saveStoredCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    if (!cart || cart.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
}

/**
 * Clears the stored cart from localStorage.
 */
export function clearStoredCart(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear cart in localStorage:', err);
  }
}

/**
 * Retrieves the list of order IDs created on this browser / device.
 */
export function getStoredOrderIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse order IDs from localStorage:', err);
    return [];
  }
}

/**
 * Adds an order ID to the persistent device order list so buying history is never lost on refresh.
 */
export function addStoredOrderId(orderId: string): void {
  if (typeof window === 'undefined' || !orderId) return;
  try {
    const existing = getStoredOrderIds();
    if (!existing.includes(orderId)) {
      const updated = [orderId, ...existing].slice(0, 50); // Keep last 50 orders
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Failed to save order ID to localStorage:', err);
  }
}

/**
 * Merges two cart item lists, summing quantities for duplicate product IDs.
 */
export function mergeCartItems(cartA: CartItem[], cartB: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();

  for (const item of cartA) {
    if (item && item.product && item.product.id) {
      map.set(item.product.id, { ...item });
    }
  }

  for (const item of cartB) {
    if (item && item.product && item.product.id) {
      if (map.has(item.product.id)) {
        const existing = map.get(item.product.id)!;
        map.set(item.product.id, {
          ...existing,
          quantity: Math.max(existing.quantity, item.quantity)
        });
      } else {
        map.set(item.product.id, { ...item });
      }
    }
  }

  return Array.from(map.values());
}
