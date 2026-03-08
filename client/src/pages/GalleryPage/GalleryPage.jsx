import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ImageLightbox from "../../components/ImageLightbox/ImageLightbox";
import {
  useGallery,
  useSaveSelection,
  useSubmitSelection,
} from "../../hooks/useGallery";
import "./GalleryPage.styles.scss";

const arraysMatch = (a = [], b = []) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

const GalleryPage = () => {
  const { clientAccessToken } = useParams();
  const { data, isLoading, isError, error } = useGallery(clientAccessToken);
  const save = useSaveSelection(clientAccessToken);
  const submitSelection = useSubmitSelection(clientAccessToken);
  const [selected, setSelected] = useState([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [sortMode, setSortMode] = useState("newest");

  const project = data?.project ?? null;
  const images = data?.images ?? [];
  const isFinal = project?.status === "FINAL_DELIVERED";
  const isSelectionLocked =
    isFinal || Boolean(project?.selectionLocked || project?.selectionSubmittedAt);
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
    if (isSelectionLocked) return;

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

  const visibleImages = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = images.filter((img) => {
      const isSelected = selected.includes(img._id);
      const filename = (img.originalFilename || "").toLowerCase();

      const filterMatch =
        filterMode === "selected"
          ? isSelected
          : filterMode === "unselected"
            ? !isSelected
            : true;

      const searchMatch =
        !normalizedSearch || filename.includes(normalizedSearch);

      return filterMatch && searchMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortMode === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }

      if (sortMode === "filename-asc") {
        return (a.originalFilename || "").localeCompare(b.originalFilename || "", undefined, {
          sensitivity: "base",
        });
      }

      if (sortMode === "filename-desc") {
        return (b.originalFilename || "").localeCompare(a.originalFilename || "", undefined, {
          sensitivity: "base",
        });
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return sorted;
  }, [images, selected, filterMode, searchTerm, sortMode]);

  const lightboxImages = useMemo(
    () =>
      visibleImages
        .map((img, index) => ({
          id: img._id,
          src: getImageSrc(img),
          alt: `${project?.name || "Gallery"} ${index + 1}`,
          label: img.originalFilename || `Image ${index + 1}`,
          downloadUrl: isFinal ? getImageSrc(img) : null,
        }))
        .filter((img) => Boolean(img.src)),
    [visibleImages, project, isFinal],
  );

  const handleOpenPreview = (imageId) => {
    const index = lightboxImages.findIndex((img) => img.id === imageId);
    if (index < 0) return;
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleSaveSelection = () => {
    if (save.isPending || isSelectionLocked) return;
    save.mutate(selected);
  };

  const handleSubmitSelection = async () => {
    if (submitSelection.isPending || isSelectionLocked) return;

    const confirmed = window.confirm(
      "Submit your final selection? You will not be able to edit selections unless the photographer reopens your gallery.",
    );

    if (!confirmed) return;

    submitSelection.mutate();
  };

  const selectableVisibleIds = visibleImages.map((img) => img._id);
  const canBulkAct = !isSelectionLocked && selectableVisibleIds.length > 0;

  const selectVisible = () => {
    if (!canBulkAct) return;
    setSelected((prev) => Array.from(new Set([...prev, ...selectableVisibleIds])));
  };

  const clearVisible = () => {
    if (!canBulkAct) return;
    const visibleIdSet = new Set(selectableVisibleIds);
    setSelected((prev) => prev.filter((id) => !visibleIdSet.has(id)));
  };

  const selectAll = () => {
    if (isSelectionLocked || !images.length) return;
    setSelected(images.map((img) => img._id));
  };

  const clearAll = () => {
    if (isSelectionLocked || !selected.length) return;
    setSelected([]);
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
            ) : isSelectionLocked ? (
              <p>Your final selection has been submitted. This gallery is read-only.</p>
            ) : (
              <p>
                Click an image to preview. Use Select to add/remove images, then Save
                draft or Submit final selection.
              </p>
            )}
          </div>

          <div className="gallery-page__toolbar-actions">
            {!isFinal ? (
              <>
                <button
                  type="button"
                  className="gallery-page__secondary-btn"
                  onClick={handleSaveSelection}
                  disabled={save.isPending || isSelectionLocked}
                >
                  {save.isPending ? "Saving..." : `Save Selection (${selected.length})`}
                </button>
                <button
                  type="button"
                  className="gallery-page__primary-btn"
                  onClick={handleSubmitSelection}
                  disabled={submitSelection.isPending || isSelectionLocked}
                >
                  {submitSelection.isPending
                    ? "Submitting..."
                    : "Submit Final Selection"}
                </button>
              </>
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

        {!isFinal && (
          <div className="gallery-page__controls">
            <input
              type="search"
              className="gallery-page__search"
              placeholder="Search by filename"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search images by filename"
            />
            <select
              className="gallery-page__select"
              value={filterMode}
              onChange={(event) => setFilterMode(event.target.value)}
              aria-label="Filter images"
            >
              <option value="all">All</option>
              <option value="selected">Selected</option>
              <option value="unselected">Unselected</option>
            </select>
            <select
              className="gallery-page__select"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
              aria-label="Sort images"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="filename-asc">Filename A-Z</option>
              <option value="filename-desc">Filename Z-A</option>
            </select>
          </div>
        )}

        {!isFinal && (
          <div className="gallery-page__bulk-actions">
            <button type="button" onClick={selectVisible} disabled={!canBulkAct}>
              Select Visible
            </button>
            <button type="button" onClick={clearVisible} disabled={!canBulkAct}>
              Clear Visible
            </button>
            <button
              type="button"
              onClick={selectAll}
              disabled={isSelectionLocked || !images.length}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={isSelectionLocked || !selected.length}
            >
              Clear All
            </button>
          </div>
        )}

        {save.isSuccess && !isFinal && !isSelectionLocked && (
          <div className="gallery-page__save-feedback">
            Selection draft saved successfully.
          </div>
        )}

        {submitSelection.isSuccess && !isFinal && (
          <div className="gallery-page__save-feedback">
            Final selection submitted successfully. Gallery is now locked.
          </div>
        )}

        {visibleImages.length ? (
          <div className="gallery-page__grid">
            {visibleImages.map((img, index) => {
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
                        disabled={isSelectionLocked}
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
            <h2>No images found</h2>
            <p>
              {images.length
                ? "Try changing your search, filter, or sort settings."
                : "This gallery does not have any images available right now."}
            </p>
          </div>
        )}
      </div>

      <ImageLightbox
        isOpen={isLightboxOpen}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        onClose={() => setIsLightboxOpen(false)}
        renderActions={(activeImage) => {
          if (isFinal) {
            if (!activeImage.downloadUrl) return null;
            return (
              <a
                className="gallery-page__lightbox-download"
                href={activeImage.downloadUrl}
                download
              >
                Download
              </a>
            );
          }

          const isSelected = selected.includes(activeImage.id);

          return (
            <button
              type="button"
              className={`gallery-page__lightbox-select ${
                isSelected ? "gallery-page__lightbox-select--active" : ""
              }`}
              onClick={() => toggleSelection(activeImage.id)}
              aria-pressed={isSelected}
              disabled={isSelectionLocked}
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
