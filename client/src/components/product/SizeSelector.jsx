/**
 * SizeSelector
 *
 * Props:
 *   sizes       — string[]  (e.g. ['S','M','L','XL'])
 *   stock       — [{ size, quantity }]
 *   selected    — string | null
 *   onChange    — (size: string) => void
 */
function SizeSelector({ sizes = [], stock = [], selected, onChange }) {
  const getQty = (size) => stock.find((s) => s.size === size)?.quantity ?? 0;

  if (sizes.length === 0) return null;

  return (
    <div className="size-selector">
      <span className="size-selector__label">
        Size{selected ? `: ${selected}` : ''}
      </span>
      <div className="size-selector__grid" role="group" aria-label="Select a size">
        {sizes.map((size) => {
          const qty = getQty(size);
          const isAvailable = qty > 0;
          const isSelected = selected === size;

          return (
            <button
              key={size}
              className={`size-selector__btn${isSelected ? ' size-selector__btn--selected' : ''}`}
              disabled={!isAvailable}
              onClick={() => onChange(size)}
              aria-pressed={isSelected}
              aria-label={`Size ${size}${!isAvailable ? ' — out of stock' : ''}`}
              title={!isAvailable ? 'Out of stock' : `Size ${size}`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SizeSelector;
