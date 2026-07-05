/**
 * Badge — small label chip.
 *
 * Props:
 *   variant — 'sale' | 'new' | 'out-of-stock' | 'success' | 'error'
 */
function Badge({ children, variant = 'new' }) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}

export default Badge;
