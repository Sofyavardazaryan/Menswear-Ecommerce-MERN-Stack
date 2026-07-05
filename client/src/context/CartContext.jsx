import { createContext, useReducer, useEffect } from 'react';

export const CartContext = createContext(null);

const STORAGE_KEY = 'edgers_cart';

// ─── Action Types ─────────────────────────────────────────────────────────────
export const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QTY: 'UPDATE_QTY',
  CLEAR_CART: 'CLEAR_CART',
  HYDRATE: 'HYDRATE',
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.HYDRATE:
      return action.payload;

    case CART_ACTIONS.ADD_ITEM: {
      const { productId, name, price, imageUrl, size, quantity = 1 } = action.payload;
      const key = `${productId}_${size}`;
      const existingIndex = state.findIndex((i) => `${i.productId}_${i.size}` === key);

      if (existingIndex >= 0) {
        return state.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...state, { productId, name, price, imageUrl, size, quantity }];
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const { productId, size } = action.payload;
      return state.filter((i) => !(i.productId === productId && i.size === size));
    }

    case CART_ACTIONS.UPDATE_QTY: {
      const { productId, size, quantity } = action.payload;
      if (quantity <= 0) {
        return state.filter((i) => !(i.productId === productId && i.size === size));
      }
      return state.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      );
    }

    case CART_ACTIONS.CLEAR_CART:
      return [];

    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({ type: CART_ACTIONS.HYDRATE, payload: JSON.parse(saved) });
      }
    } catch {
      // Silently ignore corrupt storage
    }
  }, []);

  // Persist cart on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // ─── Derived values ──────────────────────────────────────────────────────────
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // Client-side total for display only — server recalculates before charging
  const displayTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Serialized cart for checkout API call
  const cartItemsPayload = items.map(({ productId, size, quantity }) => ({
    productId,
    size,
    quantity,
  }));

  // ─── Action creators ─────────────────────────────────────────────────────────
  const addItem = (itemData) => dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: itemData });
  const removeItem = (productId, size) =>
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { productId, size } });
  const updateQty = (productId, size, quantity) =>
    dispatch({ type: CART_ACTIONS.UPDATE_QTY, payload: { productId, size, quantity } });
  const clearCart = () => dispatch({ type: CART_ACTIONS.CLEAR_CART });

  const value = {
    items,
    itemCount,
    displayTotal,
    cartItemsPayload,
    addItem,
    removeItem,
    updateQty,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
