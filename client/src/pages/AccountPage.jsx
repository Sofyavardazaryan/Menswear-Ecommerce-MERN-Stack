import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { getMyOrders } from '../services/orderService.js';
import { formatPrice, formatDate } from '../utils/formatters.js';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Input from '../components/ui/Input.jsx';
import FormField from '../components/ui/FormField.jsx';
import Loader from '../components/ui/Loader.jsx';

function AccountPage() {
  const { user, logout, updateProfile } = useAuth();
  const [tab, setTab] = useState('orders'); // 'orders' | 'profile'

  return (
    <PageWrapper>
      <h1 className="section-title">My Account</h1>

      <div className="account-layout">
        {/* Sidebar */}
        <nav className="account-sidebar">
          <p
            style={{
              fontWeight: 700,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-gray-500)',
              padding: 'var(--space-2) var(--space-4)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {user?.name}
          </p>
          {[
            { id: 'orders', label: 'My Orders' },
            { id: 'profile', label: 'Profile & Address' },
          ].map(({ id, label }) => (
            <button
              key={id}
              className={`account-sidebar__item${tab === id ? ' account-sidebar__item--active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
          <button className="account-sidebar__item" onClick={logout} style={{ color: 'var(--color-error)', marginTop: 'var(--space-4)' }}>
            Logout
          </button>
        </nav>

        {/* Content */}
        <div>
          {tab === 'orders' && <OrdersTab />}
          {tab === 'profile' && <ProfileTab user={user} updateProfile={updateProfile} />}
        </div>
      </div>
    </PageWrapper>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="alert alert--error">{error}</div>;
  if (orders.length === 0) {
    return (
      <div style={{ color: 'var(--color-gray-400)', padding: 'var(--space-8) 0' }}>
        No orders yet.
      </div>
    );
  }

  const statusVariant = (status) => {
    if (status === 'paid') return 'success';
    if (status === 'failed') return 'error';
    return 'new';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-card__header">
            <div>
              <p className="order-card__ref">{order.internalOrderId}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray-400)', marginTop: 2 }}>
                {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge variant={statusVariant(order.paymentStatus)}>
              {order.paymentStatus}
            </Badge>
          </div>

          <div className="order-card__items">
            {order.items.map((item, i) => (
              <div key={i} className="order-card__item">
                <span>{item.name} × {item.quantity} ({item.size})</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="order-card__total">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount, order.currency)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileTab({ user, updateProfile }) {
  const [fields, setFields] = useState({
    name: user?.name || '',
    address: {
      firstName: user?.address?.firstName || '',
      lastName: user?.address?.lastName || '',
      phone: user?.address?.phone || '',
      addressLine1: user?.address?.addressLine1 || '',
      city: user?.address?.city || '',
      country: user?.address?.country || 'Armenia',
    },
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await updateProfile(fields);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const setField = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));
  const setAddr = (key) => (e) =>
    setFields((f) => ({ ...f, address: { ...f.address, [key]: e.target.value } }));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 500 }}>
      {success && <div className="alert alert--success">Profile updated.</div>}
      {error && <div className="alert alert--error">{error}</div>}

      <FormField label="Full Name">
        <Input value={fields.name} onChange={setField('name')} />
      </FormField>

      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Saved Address
      </p>

      <div className="checkout-form__grid">
        <FormField label="First Name">
          <Input value={fields.address.firstName} onChange={setAddr('firstName')} />
        </FormField>
        <FormField label="Last Name">
          <Input value={fields.address.lastName} onChange={setAddr('lastName')} />
        </FormField>
      </div>

      <FormField label="Phone">
        <Input value={fields.address.phone} onChange={setAddr('phone')} placeholder="+374 XX XXXXXX" />
      </FormField>

      <FormField label="Address">
        <Input value={fields.address.addressLine1} onChange={setAddr('addressLine1')} />
      </FormField>

      <div className="checkout-form__grid">
        <FormField label="City">
          <Input value={fields.address.city} onChange={setAddr('city')} />
        </FormField>
        <FormField label="Country">
          <Input value={fields.address.country} onChange={setAddr('country')} />
        </FormField>
      </div>

      <Button type="submit" variant="primary" loading={saving}>
        Save Changes
      </Button>
    </form>
  );
}

export default AccountPage;
