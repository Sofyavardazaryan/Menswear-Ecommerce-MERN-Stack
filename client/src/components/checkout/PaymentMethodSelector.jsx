const PAYMENT_METHODS = [
  {
    id: 'arca',
    name: 'ArCa / Bank Card',
    desc: 'Visa, Mastercard, ArCa via local bank vPOS',
    logo: null,
    logoText: '💳',
  },
  {
    id: 'idram',
    name: 'Idram',
    desc: 'Pay with your Idram e-wallet',
    logo: null,
    logoText: '🟡',
  },
  {
    id: 'telcell',
    name: 'Telcell Wallet',
    desc: 'Pay with Telcell mobile wallet',
    logo: null,
    logoText: '📱',
  },
];

/**
 * PaymentMethodSelector
 *
 * Props:
 *   selected  — 'arca' | 'idram' | 'telcell' | null
 *   onChange  — (id: string) => void
 */
function PaymentMethodSelector({ selected, onChange }) {
  return (
    <div>
      <p
        style={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-gray-500)',
          paddingBottom: 'var(--space-3)',
          borderBottom: '1px solid var(--color-gray-200)',
          marginBottom: 'var(--space-4)',
        }}
      >
        Payment Method
      </p>

      <div className="payment-methods" role="radiogroup" aria-label="Select payment method">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selected === method.id;
          return (
            <div
              key={method.id}
              className={`payment-method${isSelected ? ' payment-method--selected' : ''}`}
              onClick={() => onChange(method.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onChange(method.id)}
            >
              <div className="payment-method__radio" />

              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{method.logoText}</span>

              <div className="payment-method__info">
                <p className="payment-method__name">{method.name}</p>
                <p className="payment-method__desc">{method.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PaymentMethodSelector;
