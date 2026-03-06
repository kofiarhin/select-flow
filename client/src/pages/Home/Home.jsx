import { Link } from "react-router-dom";
import "./home.styles.scss";

const workflowSteps = [
  {
    number: "01",
    title: "Create Project",
    text: "Start a new client project, generate a secure gallery link, and keep every stage of delivery tied to one workspace.",
  },
  {
    number: "02",
    title: "Upload Originals",
    text: "Add the full unedited gallery once. SelectFlow keeps previews organized so clients can review images without confusion.",
  },
  {
    number: "03",
    title: "Client Selects Favorites",
    text: "Clients open their private link, review thumbnails, and save the exact images they want edited.",
  },
  {
    number: "04",
    title: "Download Selections",
    text: "Photographers instantly see saved selections inside the project and download only the chosen originals as a ZIP.",
  },
  {
    number: "05",
    title: "Upload Finals",
    text: "After editing, upload final images back into the same project so delivery stays clean and structured.",
  },
  {
    number: "06",
    title: "Client Downloads",
    text: "Clients revisit the same gallery link to view the delivered finals and download everything from one place.",
  },
];

const features = [
  {
    title: "Project-based workflow",
    text: "Every upload, selection, and delivery lives inside a single project timeline.",
  },
  {
    title: "Private client galleries",
    text: "Clients do not need accounts. Just send a secure link and let them select.",
  },
  {
    title: "Selection persistence",
    text: "Saved client picks stay attached to the project so nothing gets lost after refresh or revisit.",
  },
  {
    title: "Selected ZIP downloads",
    text: "Download only the chosen originals instead of sorting through an entire gallery manually.",
  },
  {
    title: "Final delivery portal",
    text: "Upload finals and let clients return to the same link to access edited images.",
  },
  {
    title: "Built for photographers",
    text: "Clean, dark, focused workspace designed around proofing and delivery, not generic file sharing.",
  },
];

const stats = [
  { value: "1", label: "Project workspace per shoot" },
  { value: "0", label: "Client accounts required" },
  { value: "100%", label: "Selection flow tied to project" },
];

const Home = () => {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Photographer Client Workflow</p>
          <h1 className="home-hero__title">
            Proof, select, edit, and deliver images in one clean flow.
          </h1>
          <p className="home-hero__text">
            SelectFlow gives photographers a focused project workspace for
            uploads, client selections, edited finals, and downloads without
            messy email threads or scattered folders.
          </p>

          <div className="home-hero__actions">
            <Link className="home-hero__primary-btn" to="/register">
              Get Started
            </Link>
            <Link className="home-hero__secondary-btn" to="/login">
              Login
            </Link>
          </div>

          <div className="home-hero__stats">
            {stats.map((item) => (
              <div className="home-hero__stat-card" key={item.label}>
                <span className="home-hero__stat-value">{item.value}</span>
                <span className="home-hero__stat-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="home-hero__visual">
          <div className="home-preview">
            <div className="home-preview__header">
              <span className="home-preview__dot" />
              <span className="home-preview__dot" />
              <span className="home-preview__dot" />
            </div>

            <div className="home-preview__body">
              <div className="home-preview__project-card">
                <p className="home-preview__label">Project</p>
                <h3 className="home-preview__project-title">
                  Birthday Session
                </h3>
                <div className="home-preview__project-meta">
                  <span>Originals: 124</span>
                  <span>Selected: 18</span>
                  <span>Status: SELECTION_RECEIVED</span>
                </div>
              </div>

              <div className="home-preview__grid">
                <div className="home-preview__thumb home-preview__thumb--large" />
                <div className="home-preview__thumb home-preview__thumb--selected" />
                <div className="home-preview__thumb" />
                <div className="home-preview__thumb" />
              </div>

              <div className="home-preview__footer">
                <div className="home-preview__footer-card">
                  <span className="home-preview__footer-label">
                    Client Link
                  </span>
                  <span className="home-preview__footer-value">
                    Secure gallery access
                  </span>
                </div>

                <div className="home-preview__footer-card">
                  <span className="home-preview__footer-label">Delivery</span>
                  <span className="home-preview__footer-value">
                    Finals ready to upload
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__head">
          <p className="home-section__eyebrow">Why SelectFlow</p>
          <h2 className="home-section__title">
            Built around the actual photographer client handoff.
          </h2>
          <p className="home-section__text">
            The product is designed around one job: keep the image selection and
            delivery process organized from first upload to final download.
          </p>
        </div>

        <div className="home-features">
          {features.map((feature) => (
            <article className="home-feature-card" key={feature.title}>
              <h3 className="home-feature-card__title">{feature.title}</h3>
              <p className="home-feature-card__text">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__head">
          <p className="home-section__eyebrow">Workflow</p>
          <h2 className="home-section__title">
            From project creation to final delivery.
          </h2>
        </div>

        <div className="home-workflow">
          {workflowSteps.map((step) => (
            <article className="home-workflow-card" key={step.number}>
              <span className="home-workflow-card__number">{step.number}</span>
              <h3 className="home-workflow-card__title">{step.title}</h3>
              <p className="home-workflow-card__text">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-cta">
          <div className="home-cta__content">
            <p className="home-cta__eyebrow">Ready to use it?</p>
            <h2 className="home-cta__title">
              Start managing image selection without the chaos.
            </h2>
            <p className="home-cta__text">
              Create a project, upload originals, send the gallery link, and let
              SelectFlow handle the rest of the workflow.
            </p>
          </div>

          <div className="home-cta__actions">
            <Link className="home-cta__primary-btn" to="/register">
              Create Account
            </Link>
            <Link className="home-cta__secondary-btn" to="/login">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
