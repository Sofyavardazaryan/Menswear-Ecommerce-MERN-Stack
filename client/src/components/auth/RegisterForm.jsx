import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import FormField from '../ui/FormField.jsx';

function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const { register } = useAuth();
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!fields.name.trim()) errs.name = 'Name is required';
    if (!fields.email) errs.email = 'Email is required';
    if (fields.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (fields.password !== fields.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setErrors({});
    setServerError('');
    setLoading(true);

    try {
      await register({ name: fields.name, email: fields.email, password: fields.password });
      onSuccess?.();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      {serverError && (
        <div className="alert alert--error" style={{ marginBottom: 'var(--space-4)' }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-form__fields">
          <FormField label="Full Name" error={errors.name} required>
            <Input
              type="text"
              value={fields.name}
              onChange={set('name')}
              placeholder="Aram Petrosyan"
              autoComplete="name"
              error={errors.name}
            />
          </FormField>

          <FormField label="Email" error={errors.email} required>
            <Input
              type="email"
              value={fields.email}
              onChange={set('email')}
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
            />
          </FormField>

          <FormField label="Password" error={errors.password} required>
            <Input
              type="password"
              value={fields.password}
              onChange={set('password')}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              error={errors.password}
            />
          </FormField>

          <FormField label="Confirm Password" error={errors.confirm} required>
            <Input
              type="password"
              value={fields.confirm}
              onChange={set('confirm')}
              placeholder="Repeat password"
              autoComplete="new-password"
              error={errors.confirm}
            />
          </FormField>

          <Button type="submit" variant="primary" full loading={loading}>
            Create Account
          </Button>
        </div>
      </form>

      <p className="auth-form__switch">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin}>Sign in</button>
      </p>
    </div>
  );
}

export default RegisterForm;
