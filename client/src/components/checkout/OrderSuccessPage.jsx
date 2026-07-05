import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getOrderById } from '../../services/orderService.js';
import { formatPrice, formatDate } from '../../utils/formatters.js';
import Button from '../ui/Button.jsx';
import Loader from '../ui/Loader.jsx';
import Badge from '../ui/Badge.jsx';

function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    getOrderById(orderId)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Loader page />;

  if (error || !order) {
    return (
      <div className="result-page">
        <div className="result-page__icon result-page__icon--error">!</div>
        <h2 className="result-page__title">Order Not Found</h2>
        <p className="result-page__message">{error || 'We could not load your order details.'}</p>
        <Link to="/account"><Button variant="outline">View My Orders</Button></Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: 'var(--space-12) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-success-light)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto var(--space-4)',
          }}
        >
          ✓
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            color: 'var(--color-navy)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Order Confirmed!
        </h1>
        <p style={{ color: 'var(--color-gray-500)' }}>
          Thank you for shopping with Edgers Men's Wear.
          A confirmation email has been sent to{' '}
          <strong>{order.shippingInfo?.email}</strong>.
        </p>
      </div>

      {/* Order Meta */}
      <div className="cart-summary">
        <div className="cart-summary__row">
          <span>Order Reference</span>
          <span style={{ fontWeight: 600, letterSpacing: '0.04em' }}>{order.internalOrderId}</span>
        </div>
        <div className="cart-summary__row">
          <span>Date</span>
          <span>{formatDate(order.paidAt || order.createdAt)}</span>
        </div>
        <div className="cart-summary__row">
          <span>Payment Status</span>
          <Badge variant="success">{order.paymentStatus}</Badge>
        </div>
        <div className="cart-summary__row">
          <span>Payment Method</span>
          <span style={{ textTransform: 'capitalize' }}>{order.paymentProvider}</span>
        </div>
        <div className="cart-summary__row cart-summary__row--total">
          <span>Total Paid</span>
          <span>{formatPrice(order.totalAmount, order.currency)}</span>
        </div>
      </div>

      {/* Items */}
      <div>
        <h3
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-gray-500)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Items Ordered
        </h3>
        {order.items.map((item, i) => (
          <div key={i} className="cart-item" style={{ borderBottom: '1px solid var(--color-gray-100)', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <img
              className="cart-item__image"
              src={item.imageUrl || 'https://placehold.co/80x100/f3f4f6/9ca3af?text=?'}
              alt={item.name}
              style={{ width: 60, height: 76 }}
            />
            <div>
              <p style={{ fontWeight: 500 }}>{item.name}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
                Size: {item.size} × {item.quantity}
              </p>
              <p style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shipping */}
      <div>
        <h3
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-gray-500)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Shipping To
        </h3>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-gray-700)' }}>
          {order.shippingInfo?.firstName} {order.shippingInfo?.lastName}<br />
          {order.shippingInfo?.addressLine1}{order.shippingInfo?.addressLine2 ? `, ${order.shippingInfo.addressLine2}` : ''}<br />
          {order.shippingInfo?.city}, {order.shippingInfo?.country}<br />
          {order.shippingInfo?.phone}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Link to="/products" style={{ flex: 1 }}>
          <Button variant="outline" full>Continue Shopping</Button>
        </Link>
        <Link to="/account" style={{ flex: 1 }}>
          <Button variant="primary" full>My Orders</Button>
        </Link>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
