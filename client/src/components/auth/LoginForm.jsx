import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import FormField from '../ui/FormField.jsx';

function LoginForm({ onSuccess, onSwitchToRegister }) {
  const { login } = useAuth();
  const [fields, setFields] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!fields.email) errs.email = 'Email is required';
    if (!fields.password) errs.password = 'Password is required';
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
      await login(fields);
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
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password}
            />
          </FormField>

          <Button type="submit" variant="primary" full loading={loading}>
            Sign In
          </Button>
        </div>
      </form>

      <p className="auth-form__switch">
        Don't have an account?{' '}
        <button onClick={onSwitchToRegister}>Create one</button>
      </p>
    </div>
  );
}

export default LoginForm;
