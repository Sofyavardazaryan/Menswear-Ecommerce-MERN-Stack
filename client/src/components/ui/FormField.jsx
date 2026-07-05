/**
 * FormField — label + input + error message wrapper.
 *
 * Props:
 *   label    — string
 *   error    — string (displayed below the input)
 *   required — boolean
 *   children — the input element
 */
function FormField({ label, error, required = false, children, className = '' }) {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className="form-field__label">
          {label}
          {required && <span aria-hidden="true" style={{ color: 'var(--color-error)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
      {error && <span className="form-field__error" role="alert">{error}</span>}
    </div>
  );
}

export default FormField;
