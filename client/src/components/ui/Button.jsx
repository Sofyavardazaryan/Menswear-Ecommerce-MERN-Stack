/**
 * Button
 *
 * Props:
 *   variant — 'primary' | 'gold' | 'outline' | 'ghost' | 'danger'
 *   size    — 'sm' | 'md' | 'lg'
 *   full    — boolean, makes button full-width
 *   loading — boolean, shows spinner and disables button
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    full ? 'btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <>
          <span
            style={{
              width: 14,
              height: 14,
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
              flexShrink: 0,
            }}
          />
          Processing…
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
