import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart.js';
import CartItem from './CartItem.jsx';
import CartSummary from './CartSummary.jsx';
import Button from '../ui/Button.jsx';

function CartDrawer({ isOpen, onClose }) {
  const { items, itemCount, displayTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div className="cart-overlay" onClick={onClose} aria-hidden="true" />

      <aside className="cart-drawer" aria-label="Shopping bag">
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">Your Bag</h2>
          <button className="cart-drawer__close" onClick={onClose} aria-label="Close bag">
            ✕
          </button>
        </div>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <span style={{ fontSize: '2.5rem' }}>🛍️</span>
              <p>Your bag is empty.</p>
              <Button variant="outline" size="sm" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <CartItem key={`${item.productId}_${item.size}`} item={item} />
              ))}
              {items.length > 0 && (
                <button
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--color-gray-400)',
                    textDecoration: 'underline',
                    marginTop: 'var(--space-4)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={clearCart}
                >
                  Clear bag
                </button>
              )}
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <CartSummary total={displayTotal} itemCount={itemCount} />
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Button variant="gold" size="lg" full onClick={handleCheckout}>
                Checkout
              </Button>
              <Button variant="ghost" size="sm" full onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
