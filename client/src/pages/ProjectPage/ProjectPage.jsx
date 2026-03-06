import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProject, useUploadProjectFiles } from "../../hooks/useProjects";
import api from "../../services/api";
import "./projectPage.styles.scss";

const ProjectPage = () => {
  const { id } = useParams();
  const { data } = useProject(id);
  const uploadOriginals = useUploadProjectFiles(id, "originals");
  const uploadFinals = useUploadProjectFiles(id, "finals");
  const [isDownloading, setIsDownloading] = useState(false);

  if (!data) {
    return <div className="project-page__loading">Loading...</div>;
  }

  const { project, images, selectedOriginals = [], selectedCount = 0 } = data;

  const originals = images.filter((img) => img.phase === "ORIGINAL");
  const finals = images.filter((img) => img.phase === "FINAL");

  const upload = async (e, mutation) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || mutation.isPending) return;

    await mutation.mutateAsync(files);
    e.target.value = "";
  };

  const API_URL = import.meta.env.VITE_API_URL || "";
  const galleryUrl = `${window.location.origin}/gallery/${project.clientAccessToken}`;

  const getOriginalSrc = (img) => {
    const previewFile = img.previewPath?.split("/").pop();
    const storageFile = img.storagePath?.split("/").pop();

    if (previewFile) {
      return `${API_URL}/api/assets/previews/${project._id}/${previewFile}?token=${project.clientAccessToken}`;
    }

    if (storageFile) {
      return `${API_URL}/api/assets/originals/${project._id}/${storageFile}?token=${project.clientAccessToken}`;
    }

    return "";
  };

  const getFinalSrc = (img) => {
    const storageFile = img.storagePath?.split("/").pop();

    if (!storageFile) return "";

    return `${API_URL}/api/assets/finals/${project._id}/${storageFile}?token=${project.clientAccessToken}`;
  };

  const handleDownloadSelected = async () => {
    if (!selectedCount || isDownloading) return;

    try {
      setIsDownloading(true);

      const response = await api.get(`/api/projects/${id}/download/selected`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${project.name}-selected.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download selected failed:", error);
      alert("Unable to download selected files.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="project-page">
      <div className="project-page__shell">
        <section className="project-page__hero">
          <div className="project-page__hero-main">
            <p className="project-page__eyebrow">Project Workspace</p>
            <h1 className="project-page__title">{project.name}</h1>

            <div className="project-page__meta-list">
              <div className="project-page__meta-item">
                <span className="project-page__meta-label">Status</span>
                <span className="project-page__meta-value project-page__meta-value--status">
                  {project.status}
                </span>
              </div>

              <div className="project-page__meta-item">
                <span className="project-page__meta-label">
                  Client Selections
                </span>
                <span className="project-page__meta-value">
                  {selectedCount}
                </span>
              </div>

              <div className="project-page__meta-item">
                <span className="project-page__meta-label">Originals</span>
                <span className="project-page__meta-value">
                  {originals.length}
                </span>
              </div>

              <div className="project-page__meta-item">
                <span className="project-page__meta-label">Finals</span>
                <span className="project-page__meta-value">
                  {finals.length}
                </span>
              </div>
            </div>
          </div>

          <div className="project-page__hero-side">
            <div className="project-page__link-card">
              <span className="project-page__link-label">Client Link</span>
              <a
                className="project-page__link"
                href={galleryUrl}
                target="_blank"
                rel="noreferrer"
              >
                {galleryUrl}
              </a>
            </div>

            <button
              type="button"
              className={`project-page__download-btn ${
                !selectedCount ? "project-page__download-btn--disabled" : ""
              }`}
              disabled={!selectedCount || isDownloading}
              onClick={handleDownloadSelected}
            >
              {isDownloading
                ? "Preparing Download..."
                : "Download Selected ZIP"}
            </button>
          </div>
        </section>

        <section className="project-page__upload-row">
          <label className="project-page__upload-card">
            <span className="project-page__upload-title">Upload Originals</span>
            <span className="project-page__upload-text">
              Add the full unedited gallery for this project.
            </span>
            <input
              type="file"
              multiple
              onChange={(e) => upload(e, uploadOriginals)}
            />
          </label>

          <label className="project-page__upload-card">
            <span className="project-page__upload-title">Upload Finals</span>
            <span className="project-page__upload-text">
              Upload the edited images to deliver to the client.
            </span>
            <input
              type="file"
              multiple
              onChange={(e) => upload(e, uploadFinals)}
            />
          </label>
        </section>

        <section className="project-page__section">
          <div className="project-page__section-head">
            <div>
              <p className="project-page__section-kicker">Priority</p>
              <h2>Selected By Client</h2>
            </div>
            <span>{selectedOriginals.length} image(s)</span>
          </div>

          {selectedOriginals.length ? (
            <div className="project-page__grid">
              {selectedOriginals.map((img) => (
                <div
                  className="project-page__thumb-card project-page__thumb-card--selected"
                  key={img._id}
                >
                  <img
                    className="project-page__thumb"
                    src={getOriginalSrc(img)}
                    alt={img.originalFilename || "Selected original upload"}
                    loading="lazy"
                  />
                  <div className="project-page__thumb-overlay">
                    <span className="project-page__selection-badge">
                      Selected
                    </span>
                    <p className="project-page__thumb-name">
                      {img.originalFilename || "Original image"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="project-page__empty">
              No client selections saved yet.
            </p>
          )}
        </section>

        <section className="project-page__section">
          <div className="project-page__section-head">
            <div>
              <p className="project-page__section-kicker">Library</p>
              <h2>Originals</h2>
            </div>
            <span>{originals.length} image(s)</span>
          </div>

          {originals.length ? (
            <div className="project-page__grid">
              {originals.map((img) => (
                <div className="project-page__thumb-card" key={img._id}>
                  <img
                    className="project-page__thumb"
                    src={getOriginalSrc(img)}
                    alt={img.originalFilename || "Original upload"}
                    loading="lazy"
                  />
                  <div className="project-page__thumb-overlay">
                    {img.isSelected && (
                      <span className="project-page__selection-badge">
                        Selected
                      </span>
                    )}
                    <p className="project-page__thumb-name">
                      {img.originalFilename || "Original image"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="project-page__empty">
              No original images uploaded yet.
            </p>
          )}
        </section>

        <section className="project-page__section">
          <div className="project-page__section-head">
            <div>
              <p className="project-page__section-kicker">Delivery</p>
              <h2>Finals</h2>
            </div>
            <span>{finals.length} image(s)</span>
          </div>

          {finals.length ? (
            <div className="project-page__grid">
              {finals.map((img) => (
                <div className="project-page__thumb-card" key={img._id}>
                  <img
                    className="project-page__thumb"
                    src={getFinalSrc(img)}
                    alt={img.originalFilename || "Final upload"}
                    loading="lazy"
                  />
                  <div className="project-page__thumb-overlay">
                    <p className="project-page__thumb-name">
                      {img.originalFilename || "Final image"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="project-page__empty">No final images uploaded yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProjectPage;
