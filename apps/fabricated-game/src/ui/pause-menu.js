// Esc pause menu: Save and Exit, Video, Audio, Gameplay, Controls sections.
// Phase 1: shell only — sections exist, no functional settings yet.

const SECTIONS = ["Save and Exit", "Video", "Audio", "Gameplay", "Controls"];

export function createPauseMenu(uiRoot, { onResume } = {}) {
  const overlay = document.createElement("div");
  overlay.className = "pause-overlay";
  overlay.style.display = "none";

  const panel = document.createElement("div");
  panel.className = "pause-panel";

  const title = document.createElement("h2");
  title.textContent = "Paused";
  panel.appendChild(title);

  const nav = document.createElement("div");
  nav.className = "pause-nav";

  const content = document.createElement("div");
  content.className = "pause-content";
  content.textContent = "Select a section.";

  SECTIONS.forEach((label) => {
    const btn = document.createElement("button");
    btn.className = "pause-nav-btn";
    btn.textContent = label;
    btn.addEventListener("click", () => {
      content.textContent = `${label} — coming soon.`;
      nav.querySelectorAll(".pause-nav-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
    nav.appendChild(btn);
  });

  const resumeBtn = document.createElement("button");
  resumeBtn.className = "pause-resume-btn";
  resumeBtn.textContent = "Resume";
  resumeBtn.addEventListener("click", () => {
    if (onResume) onResume();
  });

  panel.appendChild(nav);
  panel.appendChild(content);
  panel.appendChild(resumeBtn);
  overlay.appendChild(panel);
  uiRoot.appendChild(overlay);

  return {
    show: () => { overlay.style.display = "flex"; },
    hide: () => { overlay.style.display = "none"; },
    isVisible: () => overlay.style.display !== "none",
  };
}
