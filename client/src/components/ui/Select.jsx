/**
 * Select — native <select> with consistent styling.
 *
 * Props:
 *   options — [{ value, label }]
 *   All native <select> props are forwarded.
 */
function Select({ options = [], placeholder, className = '', ...props }) {
  return (
    <select className={`select ${className}`} {...props}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
