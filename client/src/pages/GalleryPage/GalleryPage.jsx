import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useGallery, useSaveSelection } from "../../hooks/useGallery";
import "./GalleryPage.styles.scss";

const arraysMatch = (a = [], b = []) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

const GalleryPage = () => {
  const { clientAccessToken } = useParams();
  const { data } = useGallery(clientAccessToken);
  const save = useSaveSelection(clientAccessToken);
  const [selected, setSelected] = useState([]);

  if (!data) {
    return <div className="gallery-page__loading">Loading...</div>;
  }

  const { project, images } = data;
  const isFinal = project.status === "FINAL_DELIVERED";
  const apiUrl = import.meta.env.VITE_API_URL || "";

  const persistedSelectedIds = useMemo(
    () => images.filter((img) => img.isSelected).map((img) => img._id),
    [images],
  );

  useEffect(() => {
    setSelected((prev) =>
      arraysMatch(prev, persistedSelectedIds) ? prev : persistedSelectedIds,
    );
  }, [persistedSelectedIds]);

  const imageCountLabel = `${images.length} image${images.length === 1 ? "" : "s"}`;

  const toggleSelection = (imageId) => {
    if (isFinal) return;

    setSelected((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId],
    );
  };

  const getImageSrc = (img) => {
    const filename = (isFinal ? img.storagePath : img.previewPath)
      ?.split("/")
      .pop();

    const assetType = isFinal ? "finals" : "previews";

    if (!filename) return "";

    return `${apiUrl}/api/assets/${assetType}/${project._id}/${filename}?token=${clientAccessToken}`;
  };

  const handleSaveSelection = () => {
    if (save.isPending || isFinal) return;
    save.mutate(selected);
  };

  return (
    <div className="gallery-page">
      <div className="gallery-page__container">
        <div className="gallery-page__hero">
          <div className="gallery-page__hero-content">
            <p className="gallery-page__eyebrow">
              {isFinal ? "Final Delivery" : "Client Gallery"}
            </p>

            <h1 className="gallery-page__title">{project.name}</h1>

            <p className="gallery-page__subtitle">
              {isFinal
                ? "Your final edited images are ready to view and download."
                : "Review the gallery and select your favorite images."}
            </p>
          </div>

          <div className="gallery-page__hero-meta">
            <div className="gallery-page__meta-card">
              <span className="gallery-page__meta-label">Status</span>
              <span className="gallery-page__meta-value">{project.status}</span>
            </div>

            <div className="gallery-page__meta-card">
              <span className="gallery-page__meta-label">Images</span>
              <span className="gallery-page__meta-value">
                {imageCountLabel}
              </span>
            </div>

            {!isFinal && (
              <div className="gallery-page__meta-card">
                <span className="gallery-page__meta-label">Selected</span>
                <span className="gallery-page__meta-value">
                  {selected.length}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="gallery-page__toolbar">
          <div className="gallery-page__toolbar-text">
            {isFinal ? (
              <p>Browse your final images below.</p>
            ) : (
              <p>
                Click any thumbnail to add or remove it from your selection.
              </p>
            )}
          </div>

          <div className="gallery-page__toolbar-actions">
            {!isFinal ? (
              <button
                type="button"
                className="gallery-page__primary-btn"
                onClick={handleSaveSelection}
                disabled={save.isPending}
              >
                {save.isPending
                  ? "Saving..."
                  : `Save Selection (${selected.length})`}
              </button>
            ) : (
              <a
                className="gallery-page__primary-btn gallery-page__primary-btn--link"
                href={`${apiUrl}/api/gallery/${clientAccessToken}/download/finals`}
              >
                Download All
              </a>
            )}
          </div>
        </div>

        {save.isSuccess && !isFinal && (
          <div className="gallery-page__save-feedback">
            Selection saved successfully.
          </div>
        )}

        {images.length ? (
          <div className="gallery-page__grid">
            {images.map((img, index) => {
              const isSelected = selected.includes(img._id);

              return (
                <button
                  key={img._id}
                  type="button"
                  className={`gallery-page__thumb ${
                    isSelected ? "gallery-page__thumb--active" : ""
                  }`}
                  onClick={() => toggleSelection(img._id)}
                  disabled={isFinal}
                  aria-pressed={isSelected}
                >
                  <div className="gallery-page__thumb-image-wrap">
                    <img
                      className="gallery-page__thumb-image"
                      src={getImageSrc(img)}
                      alt={`${project.name} ${index + 1}`}
                      loading="lazy"
                    />
                  </div>

                  {!isFinal && (
                    <div className="gallery-page__thumb-overlay">
                      <span className="gallery-page__thumb-badge">
                        {isSelected ? "Selected" : "Select"}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="gallery-page__empty">
            <h2>No images yet</h2>
            <p>This gallery does not have any images available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
