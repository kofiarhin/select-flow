import { useState } from "react";
import { Link } from "react-router-dom";
import { useCreateProject, useProjects } from "../../hooks/useProjects";
import "./dashboardPage.styles.scss";

const DashboardPage = () => {
  const { data = [] } = useProjects();
  const createProject = useCreateProject();
  const [name, setName] = useState("");

  const handleCreateProject = () => {
    const trimmedName = name.trim();
    if (!trimmedName || createProject.isPending) return;

    createProject.mutate(
      { name: trimmedName },
      {
        onSuccess: () => setName(""),
      },
    );
  };

  const statusLabelMap = {
    AWAITING_SELECTION: "Awaiting Selection",
    SELECTION_RECEIVED: "Selection Received",
    EDITING: "Editing",
    FINAL_DELIVERED: "Final Delivered",
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__shell">
        <section className="dashboard-page__hero">
          <div className="dashboard-page__hero-content">
            <p className="dashboard-page__eyebrow">Project Dashboard</p>
            <h1 className="dashboard-page__title">Projects</h1>
            <p className="dashboard-page__subtitle">
              Create projects, track client selections, and manage the full
              proofing-to-delivery workflow from one place.
            </p>
          </div>

          <div className="dashboard-page__hero-stats">
            <div className="dashboard-page__stat-card">
              <span className="dashboard-page__stat-label">Total Projects</span>
              <span className="dashboard-page__stat-value">{data.length}</span>
            </div>

            <div className="dashboard-page__stat-card">
              <span className="dashboard-page__stat-label">
                Awaiting Selection
              </span>
              <span className="dashboard-page__stat-value">
                {
                  data.filter(
                    (project) => project.status === "AWAITING_SELECTION",
                  ).length
                }
              </span>
            </div>

            <div className="dashboard-page__stat-card">
              <span className="dashboard-page__stat-label">
                Final Delivered
              </span>
              <span className="dashboard-page__stat-value">
                {
                  data.filter((project) => project.status === "FINAL_DELIVERED")
                    .length
                }
              </span>
            </div>
          </div>
        </section>

        <section className="dashboard-page__create-card">
          <div className="dashboard-page__create-copy">
            <p className="dashboard-page__section-kicker">New Project</p>
            <h2 className="dashboard-page__section-title">
              Start a fresh client workflow
            </h2>
            <p className="dashboard-page__section-text">
              Create a project to upload originals, send the gallery link, track
              client selections, and deliver finals.
            </p>
          </div>

          <div className="dashboard-page__form">
            <div className="dashboard-page__field">
              <label htmlFor="project-name" className="dashboard-page__label">
                Project Name
              </label>
              <input
                id="project-name"
                className="dashboard-page__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>

            <button
              type="button"
              className="dashboard-page__button"
              onClick={handleCreateProject}
              disabled={!name.trim() || createProject.isPending}
            >
              {createProject.isPending ? "Creating..." : "Create Project"}
            </button>
          </div>
        </section>

        <section className="dashboard-page__projects-section">
          <div className="dashboard-page__projects-head">
            <div>
              <p className="dashboard-page__section-kicker">Workspace</p>
              <h2 className="dashboard-page__section-title">Your Projects</h2>
            </div>
            <span className="dashboard-page__projects-count">
              {data.length} project{data.length === 1 ? "" : "s"}
            </span>
          </div>

          {data.length ? (
            <div className="dashboard-page__grid">
              {data.map((project) => (
                <Link
                  className="dashboard-page__project-card"
                  key={project._id}
                  to={`/projects/${project._id}`}
                >
                  <div className="dashboard-page__project-top">
                    <span className="dashboard-page__project-badge">
                      {statusLabelMap[project.status] || project.status}
                    </span>
                  </div>

                  <div className="dashboard-page__project-body">
                    <h3 className="dashboard-page__project-title">
                      {project.name}
                    </h3>
                    <p className="dashboard-page__project-text">
                      Open this project to upload files, view client selections,
                      and manage final delivery.
                    </p>
                  </div>

                  <div className="dashboard-page__project-footer">
                    <span className="dashboard-page__project-link">
                      Open Project
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-page__empty">
              <h3 className="dashboard-page__empty-title">No projects yet</h3>
              <p className="dashboard-page__empty-text">
                Create your first project to start uploading originals and
                collecting client selections.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
