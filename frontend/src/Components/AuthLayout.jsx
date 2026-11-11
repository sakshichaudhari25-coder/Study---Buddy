const features = [
  { icon: "checklist", title: "Task Management", description: "Organize your study tasks." },
  { icon: "chart", title: "Progress Tracking", description: "Monitor your productivity." },
  { icon: "bell", title: "Smart Reminders", description: "Stay on top of deadlines." },
  { icon: "trend", title: "Analytics", description: "Understand your study progress." },
];

export function AuthIcon({ name, className = "" }) {
  const paths = {
    checklist: (
      <>
        <path d="M9 6h11M9 12h11M9 18h11" />
        <path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5M4 19h17" />
        <path d="m7 15 4-4 3 2 5-6" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    trend: (
      <>
        <path d="m4 16 6-6 4 4 6-8" />
        <path d="M14 6h6v6" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18M10.6 6.2A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a15 15 0 0 1-3 3.5M6.2 6.3C3.5 8 2 12 2 12s3.5 6 10 6c1 0 2-.2 2.8-.5" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </>
    ),
    moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function AuthLayout({ children, theme, toggleTheme }) {
  return (
    <main className="auth-container">
      <button
        type="button"
        className="auth-theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        <AuthIcon name={theme === "dark" ? "sun" : "moon"} />
        <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
      </button>

      <aside className="auth-brand-panel" aria-label="About StudyBuddy">
        <div className="auth-brand-content">
          <div className="auth-brand" aria-label="StudyBuddy">
            <span className="auth-brand-mark"><AuthIcon name="checklist" /></span>
            <span>StudyBuddy</span>
          </div>

          <div className="auth-brand-copy">
            <p className="auth-eyebrow">YOUR STUDY SPACE</p>
            <h2>Plan Smarter.<br />Study Better.</h2>
            <p className="auth-brand-description">
              Your personal study companion to organize tasks, manage deadlines,
              and track your academic progress.
            </p>
          </div>

          <div className="auth-dashboard-visual" aria-label="Study dashboard illustration">
            <div className="auth-visual-glow" />
            <div className="auth-visual-card auth-visual-main">
              <div className="auth-visual-header">
                <span className="auth-visual-kicker">STUDY OVERVIEW</span>
                <span className="auth-visual-dots" aria-hidden="true">•••</span>
              </div>
              <div className="auth-visual-title">Your week, in focus</div>
              <div className="auth-visual-progress-row">
                <span>Weekly progress</span><strong>72%</strong>
              </div>
              <div className="auth-visual-progress"><span /></div>
              <div className="auth-visual-stats">
                <div><strong>12</strong><span>Tasks done</span></div>
                <div><strong>4</strong><span>Due soon</span></div>
                <div><strong>6.5h</strong><span>Focused</span></div>
              </div>
              <div className="auth-visual-task">
                <span className="auth-visual-check"><AuthIcon name="checklist" /></span>
                <span><strong>Review biology notes</strong><small>Today · 4:30 PM</small></span>
                <span className="auth-visual-task-status">NEXT</span>
              </div>
              <div className="auth-visual-task auth-visual-task-muted">
                <span className="auth-visual-check"><AuthIcon name="chart" /></span>
                <span><strong>Practice calculus</strong><small>Tomorrow · 10:00 AM</small></span>
                <span className="auth-visual-task-status">UP NEXT</span>
              </div>
            </div>
            <div className="auth-visual-float">
              <span className="auth-float-icon"><AuthIcon name="bell" /></span>
              <span><strong>Deadline reminder</strong><small>Essay due tomorrow</small></span>
            </div>
          </div>

          <ul className="auth-feature-list">
            {features.map((feature) => (
              <li key={feature.title}>
                <span className="auth-feature-icon"><AuthIcon name={feature.icon} /></span>
                <span><strong>{feature.title}</strong><small>{feature.description}</small></span>
              </li>
            ))}
          </ul>
        </div>
        <p className="auth-brand-footer">A little more focus, a lot more progress.</p>
      </aside>

      <section className="auth-form-panel" aria-label="Account access">
        {children}
      </section>
    </main>
  );
}

export default AuthLayout;
