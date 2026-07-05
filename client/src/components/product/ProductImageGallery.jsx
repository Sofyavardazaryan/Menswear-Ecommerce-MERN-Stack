import { useState } from 'react';

function ProductImageGallery({ images = [], name }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const fallback = 'https://placehold.co/600x800/f3f4f6/9ca3af?text=No+Image';
  const displayImages = images.length > 0 ? images : [fallback];

  return (
    <div className="image-gallery">
      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="image-gallery__thumbs">
          {displayImages.map((src, idx) => (
            <img
              key={idx}
              className={`image-gallery__thumb${idx === activeIdx ? ' image-gallery__thumb--active' : ''}`}
              src={src}
              alt={`${name} — view ${idx + 1}`}
              onClick={() => setActiveIdx(idx)}
              loading="lazy"
            />
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="image-gallery__main">
        <img
          src={displayImages[activeIdx]}
          alt={name}
          key={activeIdx}
          style={{ animation: 'fadeIn 0.2s ease' }}
        />
      </div>
    </div>
  );
}

export default ProductImageGallery;
