import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ImageLightbox from "../../components/ImageLightbox/ImageLightbox";
import { useGallery, useSaveSelection } from "../../hooks/useGallery";
import "./GalleryPage.styles.scss";

const arraysMatch = (a = [], b = []) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

const GalleryPage = () => {
  const { clientAccessToken } = useParams();
  const { data, isLoading, isError, error } = useGallery(clientAccessToken);
  const save = useSaveSelection(clientAccessToken);
  const [selected, setSelected] = useState([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const project = data?.project ?? null;
  const images = data?.images ?? [];
  const isFinal = project?.status === "FINAL_DELIVERED";
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
    if (!project) return "";

    const filename = (isFinal ? img.storagePath : img.previewPath)
      ?.split("/")
      .pop();

    const assetType = isFinal ? "finals" : "previews";

    if (!filename) return "";

    return `${apiUrl}/api/assets/${assetType}/${project._id}/${filename}?token=${clientAccessToken}`;
  };

  const lightboxImages = useMemo(
    () =>
      images
        .map((img, index) => ({
          id: img._id,
          src: getImageSrc(img),
          alt: `${project?.name || "Gallery"} ${index + 1}`,
          label: img.originalFilename || `Image ${index + 1}`,
        }))
        .filter((img) => Boolean(img.src)),
    [images, project, isFinal, apiUrl, clientAccessToken],
  );

  const handleOpenPreview = (imageId) => {
    const index = lightboxImages.findIndex((img) => img.id === imageId);
    if (index < 0) return;
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleSaveSelection = () => {
    if (save.isPending || isFinal) return;
    save.mutate(selected);
  };

  if (isLoading) {
    return <div className="gallery-page__loading">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="gallery-page__empty">
        <h2>Unable to load gallery</h2>
        <p>{error?.response?.data?.message || "Something went wrong."}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="gallery-page__empty">
        <h2>Gallery not found</h2>
        <p>This gallery is unavailable or the access link is invalid.</p>
      </div>
    );
  }

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
              <span className="gallery-page__meta-value">{imageCountLabel}</span>
            </div>

            {!isFinal && (
              <div className="gallery-page__meta-card">
                <span className="gallery-page__meta-label">Selected</span>
                <span className="gallery-page__meta-value">{selected.length}</span>
              </div>
            )}
          </div>
        </div>

        <div className="gallery-page__toolbar">
          <div className="gallery-page__toolbar-text">
            {isFinal ? (
              <p>Browse your final images below. Click any image to preview.</p>
            ) : (
              <p>
                Click an image to preview. Use the Select button to add or remove
                it from your selection.
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
                <article
                  key={img._id}
                  className={`gallery-page__thumb ${
                    isSelected ? "gallery-page__thumb--active" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="gallery-page__thumb-image-wrap"
                    onClick={() => handleOpenPreview(img._id)}
                    aria-label={`Preview ${img.originalFilename || `image ${index + 1}`}`}
                  >
                    <img
                      className="gallery-page__thumb-image"
                      src={getImageSrc(img)}
                      alt={`${project.name} ${index + 1}`}
                      loading="lazy"
                    />
                  </button>

                  {!isFinal && (
                    <div className="gallery-page__thumb-actions">
                      <button
                        type="button"
                        className={`gallery-page__select-btn ${
                          isSelected ? "gallery-page__select-btn--active" : ""
                        }`}
                        onClick={() => toggleSelection(img._id)}
                        aria-pressed={isSelected}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </div>
                  )}
                </article>
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

      <ImageLightbox
        isOpen={isLightboxOpen}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        onClose={() => setIsLightboxOpen(false)}
        renderActions={(activeImage) => {
          if (isFinal) return null;

          const isSelected = selected.includes(activeImage.id);

          return (
            <button
              type="button"
              className={`gallery-page__lightbox-select ${
                isSelected ? "gallery-page__lightbox-select--active" : ""
              }`}
              onClick={() => toggleSelection(activeImage.id)}
              aria-pressed={isSelected}
            >
              {isSelected ? "Selected" : "Select"}
            </button>
          );
        }}
      />
    </div>
  );
};

export default GalleryPage;
