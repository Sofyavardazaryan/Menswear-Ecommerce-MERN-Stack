import { formatPrice } from '../../utils/formatters.js';

/**
 * CartSummary
 *
 * Props:
 *   total    — number (display total only — server recalculates before charging)
 *   currency — string
 *   itemCount — number
 */
function CartSummary({ total, currency = 'AMD', itemCount }) {
  const shipping = total > 0 ? 'FREE' : '—';

  return (
    <div className="cart-summary">
      <div className="cart-summary__row">
        <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
        <span>{formatPrice(total, currency)}</span>
      </div>

      <div className="cart-summary__row">
        <span>Shipping</span>
        <span>{shipping}</span>
      </div>

      <div className="cart-summary__row cart-summary__row--total">
        <span>Total</span>
        <span>
          {formatPrice(total, currency)}
          <span className="cart-summary__currency">{currency}</span>
        </span>
      </div>

      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--color-gray-500)',
          marginTop: 'var(--space-3)',
        }}
      >
        Final total is confirmed at checkout after server validation.
      </p>
    </div>
  );
}

export default CartSummary;
