import { useEffect, useMemo, useState } from "react";
import "./imageLightbox.styles.scss";

const getSafeIndex = (index, length) => {
  if (!length) return 0;
  if (index < 0) return 0;
  if (index > length - 1) return length - 1;
  return index;
};

const ImageLightbox = ({
  isOpen,
  images = [],
  initialIndex = 0,
  onClose,
  renderActions,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const totalImages = images.length;

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(getSafeIndex(initialIndex, totalImages));
  }, [isOpen, initialIndex, totalImages]);

  const activeImage = useMemo(() => {
    if (!totalImages) return null;
    return images[getSafeIndex(activeIndex, totalImages)] ?? null;
  }, [activeIndex, images, totalImages]);

  const canNavigate = totalImages > 1;

  const goToPrevious = () => {
    if (!canNavigate) return;
    setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const goToNext = () => {
    if (!canNavigate) return;
    setActiveIndex((prev) => (prev + 1) % totalImages);
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }

      if (event.key === "ArrowLeft" && canNavigate) {
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages);
      }

      if (event.key === "ArrowRight" && canNavigate) {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % totalImages);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, canNavigate, totalImages]);

  if (!isOpen || !activeImage) return null;

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={onClose}
    >
      <div
        className="image-lightbox__content"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="image-lightbox__close"
          onClick={onClose}
          aria-label="Close preview"
        >
          ×
        </button>

        {canNavigate && (
          <button
            type="button"
            className="image-lightbox__nav image-lightbox__nav--prev"
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            ‹
          </button>
        )}

        <div className="image-lightbox__stage">
          <img
            className="image-lightbox__image"
            src={activeImage.src}
            alt={activeImage.alt || activeImage.label || "Preview image"}
          />
        </div>

        {canNavigate && (
          <button
            type="button"
            className="image-lightbox__nav image-lightbox__nav--next"
            onClick={goToNext}
            aria-label="Next image"
          >
            ›
          </button>
        )}

        <div className="image-lightbox__footer">
          <div className="image-lightbox__meta">
            <span className="image-lightbox__counter">
              {activeIndex + 1} / {totalImages}
            </span>
            <span className="image-lightbox__label">
              {activeImage.label || activeImage.alt || "Untitled image"}
            </span>
          </div>
          {renderActions ? (
            <div className="image-lightbox__actions">
              {renderActions(activeImage, activeIndex)}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ImageLightbox;
