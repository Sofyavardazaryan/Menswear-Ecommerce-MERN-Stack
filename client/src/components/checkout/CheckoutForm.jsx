import Input from '../ui/Input.jsx';
import FormField from '../ui/FormField.jsx';
import Select from '../ui/Select.jsx';

const COUNTRIES = [
  { value: 'Armenia', label: 'Armenia' },
  { value: 'Russia', label: 'Russia' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Other', label: 'Other' },
];

/**
 * CheckoutForm — shipping information inputs.
 *
 * Props:
 *   values   — shippingInfo object
 *   errors   — field-level errors
 *   onChange — (field: string, value: string) => void
 */
function CheckoutForm({ values, errors, onChange }) {
  const field = (key) => (e) => onChange(key, e.target.value);

  return (
    <div className="checkout-form">
      <p className="checkout-form__section-title">Contact Information</p>

      <div className="checkout-form__grid">
        <FormField label="First Name" error={errors?.firstName} required>
          <Input
            value={values.firstName}
            onChange={field('firstName')}
            placeholder="Aram"
            autoComplete="given-name"
            error={errors?.firstName}
          />
        </FormField>

        <FormField label="Last Name" error={errors?.lastName} required>
          <Input
            value={values.lastName}
            onChange={field('lastName')}
            placeholder="Petrosyan"
            autoComplete="family-name"
            error={errors?.lastName}
          />
        </FormField>
      </div>

      <FormField label="Email" error={errors?.email} required>
        <Input
          type="email"
          value={values.email}
          onChange={field('email')}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors?.email}
        />
      </FormField>

      <FormField label="Phone" error={errors?.phone} required>
        <Input
          type="tel"
          value={values.phone}
          onChange={field('phone')}
          placeholder="+374 XX XXXXXX"
          autoComplete="tel"
          error={errors?.phone}
        />
      </FormField>

      <p className="checkout-form__section-title">Shipping Address</p>

      <FormField label="Address Line 1" error={errors?.addressLine1} required>
        <Input
          value={values.addressLine1}
          onChange={field('addressLine1')}
          placeholder="Street address, building, apt. no."
          autoComplete="address-line1"
          error={errors?.addressLine1}
        />
      </FormField>

      <FormField label="Address Line 2 (optional)" error={errors?.addressLine2}>
        <Input
          value={values.addressLine2}
          onChange={field('addressLine2')}
          placeholder="Floor, entrance, etc."
          autoComplete="address-line2"
        />
      </FormField>

      <div className="checkout-form__grid">
        <FormField label="City" error={errors?.city} required>
          <Input
            value={values.city}
            onChange={field('city')}
            placeholder="Yerevan"
            autoComplete="address-level2"
            error={errors?.city}
          />
        </FormField>

        <FormField label="Country" error={errors?.country} required>
          <Select
            options={COUNTRIES}
            value={values.country}
            onChange={field('country')}
          />
        </FormField>
      </div>
    </div>
  );
}

export default CheckoutForm;
