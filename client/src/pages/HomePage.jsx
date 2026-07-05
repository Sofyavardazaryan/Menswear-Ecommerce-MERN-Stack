import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/productService.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Button from '../components/ui/Button.jsx';
import Container from '../components/layout/Container.jsx';

const CATEGORY_LINKS = [
  { label: 'Shirts', value: 'shirts' },
  { label: 'Pants', value: 'pants' },
  { label: 'Blazers', value: 'jackets' },
  { label: 'Suits', value: 'suits' },
  { label: 'Accessories', value: 'accessories' },
];

function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ featured: 'true', limit: 4 })
      .then((data) => setFeatured(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <Container>
          <h1 className="page-hero__title">
            Dress with <span>Edge.</span>
          </h1>
          <p className="page-hero__subtitle">
            Premium men's clothing crafted for the modern Armenian gentleman.
          </p>
          <div style={{ marginTop: 'var(--space-8)', display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <Link to="/products">
              <Button variant="gold" size="lg">Shop Now</Button>
            </Link>
            <Link to="/products?featured=true">
              <Button variant="outline" size="lg" style={{ color: 'white', borderColor: 'white' }}>
                Featured
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Category Strip */}
      <section style={{ borderBottom: '1px solid var(--color-gray-200)', background: 'var(--color-off-white)' }}>
        <Container>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-6)',
              padding: 'var(--space-4) 0',
              overflowX: 'auto',
            }}
          >
            {CATEGORY_LINKS.map((cat) => (
              <Link
                key={cat.value}
                to={`/products?category=${cat.value}`}
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-gray-600)',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Products */}
      <section style={{ padding: 'var(--space-16) 0' }}>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Featured Pieces</h2>
            <Link to="/products">
              <Button variant="ghost" size="sm">View All →</Button>
            </Link>
          </div>
          <ProductGrid products={featured} loading={loading} />
        </Container>
      </section>

      {/* Brand Strip */}
      <section
        style={{
          background: 'var(--color-navy)',
          padding: 'var(--space-16) 0',
          textAlign: 'center',
          color: 'var(--color-white)',
        }}
      >
        <Container>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.25rem, 3vw, 2rem)',
              color: 'var(--color-gray-300)',
              maxWidth: 700,
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            "Style is a way to say who you are without having to speak."
          </p>
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-gold)', fontWeight: 600 }}>
            Edgers Men's Wear — Yerevan
          </p>
        </Container>
      </section>
    </>
  );
}

export default HomePage;
