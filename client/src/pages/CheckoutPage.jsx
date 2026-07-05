import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { useAuth } from '../hooks/useAuth.js';
import { initiateCheckout } from '../services/paymentService.js';
import CheckoutForm from '../components/checkout/CheckoutForm.jsx';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector.jsx';
import CartSummary from '../components/cart/CartSummary.jsx';
import Button from '../components/ui/Button.jsx';
import PageWrapper from '../components/layout/PageWrapper.jsx';

const INITIAL_SHIPPING = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  country: 'Armenia',
};

function validateShipping(info) {
  const required = ['firstName', 'lastName', 'email', 'phone', 'addressLine1', 'city', 'country'];
  const errs = {};
  required.forEach((f) => {
    if (!info[f]?.trim()) errs[f] = 'This field is required';
  });
  if (info.email && !/\S+@\S+\.\S+/.test(info.email)) errs.email = 'Invalid email address';
  return errs;
}

function CheckoutPage() {
  const { cartItemsPayload, displayTotal, itemCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    ...INITIAL_SHIPPING,
    email: user?.address?.email || user?.email || '',
    firstName: user?.address?.firstName || '',
    lastName: user?.address?.lastName || '',
    phone: user?.address?.phone || '',
    addressLine1: user?.address?.addressLine1 || '',
    city: user?.address?.city || '',
    country: user?.address?.country || 'Armenia',
  });

  const [shippingErrors, setShippingErrors] = useState({});
  const [paymentProvider, setPaymentProvider] = useState(null);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFieldChange = (key, value) => {
    setShippingInfo((prev) => ({ ...prev, [key]: value }));
    if (shippingErrors[key]) {
      setShippingErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validateShipping(shippingInfo);
    if (Object.keys(errs).length) {
      setShippingErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!paymentProvider) {
      setServerError('Please select a payment method.');
      return;
    }

    if (itemCount === 0) {
      setServerError('Your cart is empty.');
      return;
    }

    setServerError('');
    setLoading(true);

    try {
      const { paymentUrl } = await initiateCheckout({
        cartItems: cartItemsPayload,
        shippingInfo,
        paymentProvider,
      });

      // Clear cart before redirect — order is now pending on the server
      clearCart();

      // Redirect to payment provider
      window.location.href = paymentUrl;
    } catch (err) {
      setServerError(err.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  if (itemCount === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <PageWrapper>
      <h1 className="section-title">Checkout</h1>

      {serverError && (
        <div className="alert alert--error" style={{ marginBottom: 'var(--space-6)' }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="checkout-layout">
          {/* Left column — shipping + payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <CheckoutForm
              values={shippingInfo}
              errors={shippingErrors}
              onChange={handleFieldChange}
            />

            <PaymentMethodSelector
              selected={paymentProvider}
              onChange={setPaymentProvider}
            />
          </div>

          {/* Right column — order summary + submit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <CartSummary total={displayTotal} itemCount={itemCount} />

            <div
              style={{
                background: 'var(--color-gray-100)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                fontSize: '0.8125rem',
                color: 'var(--color-gray-500)',
                lineHeight: 1.6,
              }}
            >
              Your order total will be verified on our server before you are charged.
              Price tampering is not possible.
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              full
              loading={loading}
              disabled={!paymentProvider}
            >
              {paymentProvider
                ? `Pay with ${paymentProvider.charAt(0).toUpperCase() + paymentProvider.slice(1)}`
                : 'Select a Payment Method'}
            </Button>

            <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', textAlign: 'center' }}>
              By placing your order you agree to our terms and conditions.
            </p>
          </div>
        </div>
      </form>
    </PageWrapper>
  );
}

export default CheckoutPage;
