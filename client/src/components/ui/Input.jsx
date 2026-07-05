/**
 * Input — controlled text input with error state support.
 *
 * Props:
 *   error   — string | boolean, shows error styling
 *   All native <input> props are forwarded.
 */
function Input({ error, className = '', ...props }) {
  const classes = ['input', error ? 'input--error' : '', className].filter(Boolean).join(' ');
  return <input className={classes} {...props} />;
}

export default Input;
