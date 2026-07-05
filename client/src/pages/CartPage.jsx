import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import CartItem from '../components/cart/CartItem.jsx';
import CartSummary from '../components/cart/CartSummary.jsx';
import Button from '../components/ui/Button.jsx';
import PageWrapper from '../components/layout/PageWrapper.jsx';

function CartPage() {
  const { items, itemCount, displayTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className="result-page">
          <span style={{ fontSize: '3rem' }}>🛍️</span>
          <h2 className="result-page__title">Your bag is empty</h2>
          <p className="result-page__message">Add some items to get started.</p>
          <Link to="/products">
            <Button variant="primary">Shop Now</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h1 className="section-title">Shopping Bag ({itemCount})</h1>

      <div className="checkout-layout">
        {/* Items */}
        <div>
          {items.map((item) => (
            <CartItem key={`${item.productId}_${item.size}`} item={item} />
          ))}
          <button
            onClick={clearCart}
            style={{
              marginTop: 'var(--space-4)',
              fontSize: '0.8125rem',
              color: 'var(--color-gray-400)',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Clear bag
          </button>
        </div>

        {/* Summary + CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <CartSummary total={displayTotal} itemCount={itemCount} />
          <Button variant="gold" size="lg" full onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </Button>
          <Link to="/products">
            <Button variant="ghost" size="sm" full>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}

export default CartPage;
