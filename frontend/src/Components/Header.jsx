
import { useEffect, useState } from "react";

function Header({ theme, toggleTheme, onProfileClick }) {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    function handleScroll() {
      const sections = [
        "overview",
        "analytics",
        "calendar",
        "upcoming",
        "add-task",
        "assignments",
      ];

      let currentSection = "overview";

      sections.forEach((section) => {
        const element = document.getElementById(section);

        if (element && element.getBoundingClientRect().top <= 150) {
          currentSection = section;
        }
      });

      setActiveSection(currentSection);
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "calendar", label: "Calendar" },
    { id: "upcoming", label: "Upcoming" },
    { id: "add-task", label: "Add Task" },
    { id: "assignments", label: "My Assignments" },
  ];

  return (
    <header className="navbar">
      <a href="#overview" className="navbar-logo">
        StudyBuddy
      </a>

      <nav className="navbar-links">
        {links.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={activeSection === link.id ? "active" : ""}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="navbar-actions">
        <button
          type="button"
          className="profile-nav-button"
          onClick={onProfileClick}
        >
          👤 Profile
        </button>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          type="button"
        >
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
    </header>
  );
}

export default Header;
