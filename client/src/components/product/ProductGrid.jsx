import ProductCard from './ProductCard.jsx';
import Loader from '../ui/Loader.jsx';

function ProductGrid({ products, loading }) {
  if (loading) {
    return <Loader page />;
  }

  if (!products || products.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--space-20) 0',
          color: 'var(--color-gray-400)',
        }}
      >
        No products found.
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
