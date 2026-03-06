import { useParams } from "react-router-dom";
import api from "../../services/api";
import { useProject } from "../../hooks/useProjects";
import "./ProjectPage.styles.scss";

const ProjectPage = () => {
  const { id } = useParams();
  const { data } = useProject(id);

  if (!data) {
    return <div className="project-page__loading">Loading...</div>;
  }

  const { project, images } = data;

  const originals = images.filter((img) => img.phase === "ORIGINAL");
  const finals = images.filter((img) => img.phase === "FINAL");

  const upload = async (e, route) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    await api.post(`/api/projects/${id}/upload/${route}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    window.location.reload();
  };

  const API_URL = import.meta.env.VITE_API_URL || "";

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

  return (
    <div className="project-page">
      <div className="project-page__header">
        <div>
          <h1 className="project-page__title">{project.name}</h1>
          <p className="project-page__status">
            Status: <span>{project.status}</span>
          </p>
          <p className="project-page__client-link">
            Client link:{" "}
            <a
              href={`${window.location.origin}/gallery/${project.clientAccessToken}`}
              target="_blank"
              rel="noreferrer"
            >
              {`${window.location.origin}/gallery/${project.clientAccessToken}`}
            </a>
          </p>
        </div>

        <a
          className="project-page__download-btn"
          href={`${API_URL}/api/projects/${id}/download/selected`}
          target="_blank"
          rel="noreferrer"
        >
          Download Selected ZIP
        </a>
      </div>

      <div className="project-page__upload-row">
        <label className="project-page__upload-card">
          <span className="project-page__upload-label">Upload Originals</span>
          <input
            type="file"
            multiple
            onChange={(e) => upload(e, "originals")}
          />
        </label>

        <label className="project-page__upload-card">
          <span className="project-page__upload-label">Upload Finals</span>
          <input type="file" multiple onChange={(e) => upload(e, "finals")} />
        </label>
      </div>

      <section className="project-page__section">
        <div className="project-page__section-head">
          <h2>Originals</h2>
          <span>{originals.length} image(s)</span>
        </div>

        {originals.length ? (
          <div className="project-page__grid">
            {originals.map((img) => (
              <div className="project-page__thumb-card" key={img._id}>
                <img
                  className="project-page__thumb"
                  src={getOriginalSrc(img)}
                  alt={img.originalName || "Original upload"}
                  loading="lazy"
                />
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
          <h2>Finals</h2>
          <span>{finals.length} image(s)</span>
        </div>

        {finals.length ? (
          <div className="project-page__grid">
            {finals.map((img) => (
              <div className="project-page__thumb-card" key={img._id}>
                <img
                  className="project-page__thumb"
                  src={getFinalSrc(img)}
                  alt={img.originalName || "Final upload"}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="project-page__empty">No final images uploaded yet.</p>
        )}
      </section>
    </div>
  );
};

export default ProjectPage;
