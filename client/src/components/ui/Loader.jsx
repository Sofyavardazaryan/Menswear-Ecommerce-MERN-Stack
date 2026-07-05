/**
 * Loader — spinning indicator.
 *
 * Props:
 *   size  — 'sm' | 'md' | 'lg'
 *   page  — boolean, adds min-height for page-level loading states
 */
function Loader({ size = 'md', page = false }) {
  const classes = ['loader', `loader--${size}`, page ? 'loader--page' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} role="status" aria-label="Loading">
      <span className="loader__spinner" />
    </div>
  );
}

export default Loader;
