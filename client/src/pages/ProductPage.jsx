import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProducts, getProductBySlug } from '../services/productService.js';
import { useCart } from '../hooks/useCart.js';
import ProductImageGallery from '../components/product/ProductImageGallery.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import SizeSelector from '../components/product/SizeSelector.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Loader from '../components/ui/Loader.jsx';
import Select from '../components/ui/Select.jsx';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import Container from '../components/layout/Container.jsx';
import { formatPrice, getDiscountPercent } from '../utils/formatters.js';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'shirts', label: 'Shirts' },
  { value: 'pants', label: 'Pants' },
  { value: 'jackets', label: 'Jackets' },
  { value: 'suits', label: 'Suits' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'shoes', label: 'Shoes' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
];

// ─── Product Listing Page ─────────────────────────────────────────────────────
function ProductListingPage() {
  const [searchParams, setSearchParams] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      category: p.get('category') || '',
      sort: p.get('sort') || '-createdAt',
      search: p.get('search') || '',
    };
  });

  const [data, setData] = useState({ products: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts(searchParams)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  const set = (key) => (e) => setSearchParams((p) => ({ ...p, [key]: e.target.value }));

  return (
    <>
      <section className="page-hero" style={{ padding: 'var(--space-12) 0' }}>
        <Container>
          <h1 className="page-hero__title">The Collection</h1>
        </Container>
      </section>

      <PageWrapper>
        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            alignItems: 'center',
            marginBottom: 'var(--space-8)',
            flexWrap: 'wrap',
          }}
        >
          <Select
            options={CATEGORIES}
            value={searchParams.category}
            onChange={set('category')}
            style={{ maxWidth: 200 }}
          />
          <Select
            options={SORT_OPTIONS}
            value={searchParams.sort}
            onChange={set('sort')}
            style={{ maxWidth: 200 }}
          />
          <input
            className="input"
            style={{ maxWidth: 280 }}
            type="search"
            placeholder="Search products…"
            value={searchParams.search}
            onChange={set('search')}
          />
          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-400)', marginLeft: 'auto' }}>
            {data.total} products
          </p>
        </div>

        <ProductGrid products={data.products} loading={loading} />
      </PageWrapper>
    </>
  );
}

// ─── Single Product Detail Page ───────────────────────────────────────────────
function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    setSelectedSize(null);
    getProductBySlug(slug)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loader page />;

  if (error || !product) {
    return (
      <PageWrapper>
        <div className="result-page">
          <h2 className="result-page__title">Product Not Found</h2>
          <p className="result-page__message">{error}</p>
          <Button variant="outline" onClick={() => navigate('/products')}>Back to Shop</Button>
        </div>
      </PageWrapper>
    );
  }

  const { name, description, price, compareAtPrice, currency, images, sizes, stock, category, inStock } = product;
  const discountLabel = getDiscountPercent(price, compareAtPrice);

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError('Please select a size'); return; }
    setSizeError('');
    addItem({ productId: product._id, name, price, imageUrl: images[0] || '', size: selectedSize, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <PageWrapper>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-400)', marginBottom: 'var(--space-6)' }}>
        <Link to="/products" style={{ textDecoration: 'underline' }}>Shop</Link>
        {' / '}
        <span style={{ textTransform: 'capitalize' }}>{category}</span>
        {' / '}
        {name}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'start' }}>
        <ProductImageGallery images={images} name={name} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', lineHeight: 1.2 }}>
            {name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatPrice(price, currency)}</span>
            {compareAtPrice && (
              <span style={{ fontSize: '1.125rem', color: 'var(--color-gray-400)', textDecoration: 'line-through' }}>
                {formatPrice(compareAtPrice, currency)}
              </span>
            )}
            {discountLabel && <Badge variant="sale">{discountLabel}</Badge>}
          </div>

          {!inStock && <Badge variant="out-of-stock">Out of Stock</Badge>}

          <p style={{ color: 'var(--color-gray-600)', lineHeight: 1.7 }}>{description}</p>

          <div>
            <SizeSelector sizes={sizes} stock={stock} selected={selectedSize} onChange={(s) => { setSelectedSize(s); setSizeError(''); }} />
            {sizeError && <p style={{ color: 'var(--color-error)', fontSize: '0.8125rem', marginTop: 4 }}>{sizeError}</p>}
          </div>

          <Button variant={added ? 'gold' : 'primary'} size="lg" full onClick={handleAddToCart} disabled={!inStock}>
            {added ? '✓ Added to Bag' : inStock ? 'Add to Bag' : 'Out of Stock'}
          </Button>

          <div style={{ borderTop: '1px solid var(--color-gray-200)', paddingTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {['Free delivery in Yerevan', 'Secure payment — ArCa · Idram · Telcell', '14-day returns'].map((line) => (
              <p key={line} style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', display: 'flex', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--color-success)' }}>✓</span> {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageWrapper>
  );
}

// ─── Router-aware export ──────────────────────────────────────────────────────
// This file exports the correct component based on whether :slug is in the URL.
// App.jsx registers two routes pointing to this file — see App.jsx.
export { ProductListingPage, ProductDetailPage };

// Default export for backward compat
export default ProductListingPage;
