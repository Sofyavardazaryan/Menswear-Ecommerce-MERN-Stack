import { useCart } from '../../hooks/useCart.js';
import { formatPrice } from '../../utils/formatters.js';

function CartItem({ item }) {
  const { removeItem, updateQty } = useCart();
  const { productId, name, price, imageUrl, size, quantity } = item;

  return (
    <div className="cart-item">
      <img
        className="cart-item__image"
        src={imageUrl || 'https://placehold.co/80x100/f3f4f6/9ca3af?text=?'}
        alt={name}
        loading="lazy"
      />

      <div className="cart-item__details">
        <p className="cart-item__name">{name}</p>
        <p className="cart-item__meta">Size: {size}</p>
        <p className="cart-item__meta">{formatPrice(price)} each</p>

        <div className="cart-item__bottom">
          <span className="cart-item__price">{formatPrice(price * quantity)}</span>

          <div className="cart-item__qty">
            <button
              className="cart-item__qty-btn"
              onClick={() => updateQty(productId, size, quantity - 1)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="cart-item__qty-value">{quantity}</span>
            <button
              className="cart-item__qty-btn"
              onClick={() => updateQty(productId, size, quantity + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <button
          className="cart-item__remove"
          onClick={() => removeItem(productId, size)}
          aria-label={`Remove ${name} (size ${size}) from cart`}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default CartItem;
