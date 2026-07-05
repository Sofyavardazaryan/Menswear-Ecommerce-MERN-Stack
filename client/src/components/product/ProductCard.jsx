import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import { formatPrice, getDiscountPercent } from '../../utils/formatters.js';

function ProductCard({ product }) {
  const navigate = useNavigate();

  const {
    name,
    slug,
    price,
    compareAtPrice,
    currency,
    images,
    inStock,
    featured,
  } = product;

  const discountLabel = getDiscountPercent(price, compareAtPrice);

  return (
    <article
      className="product-card"
      onClick={() => navigate(`/products/${slug}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/products/${slug}`)}
      aria-label={`View ${name}`}
    >
      <div className="product-card__image-wrap">
        <img
          className="product-card__image"
          src={images?.[0] || 'https://placehold.co/400x533/f3f4f6/9ca3af?text=No+Image'}
          alt={name}
          loading="lazy"
        />
        <div className="product-card__badges">
          {discountLabel && <Badge variant="sale">{discountLabel}</Badge>}
          {featured && !discountLabel && <Badge variant="new">Featured</Badge>}
          {!inStock && <Badge variant="out-of-stock">Out of Stock</Badge>}
        </div>
      </div>

      <p className="product-card__name">{name}</p>

      <div className="product-card__pricing">
        <span className="product-card__price">{formatPrice(price, currency)}</span>
        {compareAtPrice && (
          <span className="product-card__compare">{formatPrice(compareAtPrice, currency)}</span>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
