import { useState, useCallback } from 'react';
import type { Shop, ShopService, CartItem } from '../types';

export function useCart() {
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((shop: Shop, service: ShopService) => {
    // If selecting a service from a different shop, reset cart to new shop
    if (activeShop && activeShop.id !== shop.id) {
      if (!window.confirm(`Your cart has items from ${activeShop.name}. Start a new cart from ${shop.name}?`)) {
        return;
      }
      setActiveShop(shop);
      setItems([{ service, quantity: 1 }]);
      return;
    }

    if (!activeShop) {
      setActiveShop(shop);
    }

    setItems(prevItems => {
      const existing = prevItems.find(item => item.service.id === service.id);
      if (existing) {
        return prevItems.map(item =>
          item.service.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { service, quantity: 1 }];
    });
  }, [activeShop]);

  const updateQuantity = useCallback((serviceId: string, quantity: number) => {
    setItems(prevItems => {
      if (quantity <= 0) {
        const next = prevItems.filter(item => item.service.id !== serviceId);
        if (next.length === 0) {
          setActiveShop(null);
        }
        return next;
      }
      return prevItems.map(item =>
        item.service.id === serviceId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeItem = useCallback((serviceId: string) => {
    setItems(prevItems => {
      const next = prevItems.filter(item => item.service.id !== serviceId);
      if (next.length === 0) {
        setActiveShop(null);
      }
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setActiveShop(null);
  }, []);

  const getItemQuantity = useCallback((serviceId: string): number => {
    const found = items.find(item => item.service.id === serviceId);
    return found ? found.quantity : 0;
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    activeShop,
    items,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
  };
}
