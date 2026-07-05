import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPaymentStatus } from '../../services/paymentService.js';
import Loader from '../ui/Loader.jsx';
import Button from '../ui/Button.jsx';

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 24; // 60 seconds total
const TERMINAL_STATUSES = ['paid', 'failed'];

/**
 * PaymentRedirectHandler
 *
 * Rendered at /payment/result after user returns from a payment provider.
 * Polls /api/payment/status/:orderId until the payment is confirmed or failed.
 *
 * URL params: ?orderId=<mongoId>&failed=1 (optional flag for immediate failure)
 */
function PaymentRedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const immediatelyFailed = searchParams.get('failed') === '1';

  const [status, setStatus] = useState('polling'); // 'polling' | 'paid' | 'failed' | 'timeout' | 'error'
  const [message, setMessage] = useState('');
  const pollCount = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      setMessage('No order ID found. Please contact support.');
      return;
    }

    if (immediatelyFailed) {
      setStatus('failed');
      setMessage('Your payment was not completed.');
      return;
    }

    const poll = async () => {
      pollCount.current += 1;

      try {
        const data = await getPaymentStatus(orderId);

        if (TERMINAL_STATUSES.includes(data.paymentStatus)) {
          setStatus(data.paymentStatus);
          if (data.paymentStatus === 'paid') {
            navigate(`/order/success?orderId=${orderId}`, { replace: true });
          }
          return;
        }

        if (pollCount.current >= MAX_POLLS) {
          setStatus('timeout');
          setMessage('Payment verification is taking longer than expected. Please check your orders or contact support.');
          return;
        }

        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Failed to verify payment status.');
      }
    };

    timerRef.current = setTimeout(poll, 1000); // slight initial delay

    return () => clearTimeout(timerRef.current);
  }, [orderId, immediatelyFailed, navigate]);

  if (status === 'polling') {
    return (
      <div className="result-page">
        <Loader size="lg" />
        <h2 className="result-page__title">Verifying Payment…</h2>
        <p className="result-page__message">
          Please wait while we confirm your payment. Do not close this page.
        </p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="result-page">
        <div className="result-page__icon result-page__icon--error">✕</div>
        <h2 className="result-page__title">Payment Failed</h2>
        <p className="result-page__message">
          {message || 'Your payment could not be processed. Please try again.'}
        </p>
        <Button variant="primary" onClick={() => navigate('/checkout')}>
          Try Again
        </Button>
      </div>
    );
  }

  if (status === 'timeout' || status === 'error') {
    return (
      <div className="result-page">
        <div className="result-page__icon result-page__icon--error">⚠</div>
        <h2 className="result-page__title">Verification Pending</h2>
        <p className="result-page__message">{message}</p>
        <Button variant="outline" onClick={() => navigate('/account')}>
          Check My Orders
        </Button>
      </div>
    );
  }

  return null;
}

export default PaymentRedirectHandler;
