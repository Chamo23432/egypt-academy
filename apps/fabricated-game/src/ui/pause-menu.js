// Esc pause menu: Save and Exit, Video, Audio, Gameplay, Controls sections.
// Styled after the vanilla Minecraft pause screen: dark dimmed backdrop,
// stacked gray buttons with a beveled 3D look, centered title.

const SECTIONS = ["Save and Exit", "Video", "Audio", "Gameplay", "Controls"];

export function createPauseMenu(uiRoot, { onResume } = {}) {
  const overlay = document.createElement("div");
  overlay.className = "mc-pause-overlay";
  overlay.style.display = "none";

  const panel = document.createElement("div");
  panel.className = "mc-pause-panel";

  const title = document.createElement("div");
  title.className = "mc-pause-title";
  title.textContent = "Game Menu";
  panel.appendChild(title);

  const resumeBtn = document.createElement("button");
  resumeBtn.className = "mc-btn mc-btn-wide";
  resumeBtn.textContent = "Back to Game";
  resumeBtn.addEventListener("click", () => {
    if (onResume) onResume();
  });
  panel.appendChild(resumeBtn);

  const grid = document.createElement("div");
  grid.className = "mc-btn-grid";

  const content = document.createElement("div");
  content.className = "mc-pause-subtext";
  content.textContent = "";

  SECTIONS.forEach((label) => {
    const btn = document.createElement("button");
    btn.className = "mc-btn";
    btn.textContent = label;
    btn.addEventListener("click", () => {
      content.textContent = `${label} — coming soon.`;
    });
    grid.appendChild(btn);
  });

  panel.appendChild(grid);
  panel.appendChild(content);
  overlay.appendChild(panel);
  uiRoot.appendChild(overlay);

  return {
    show: () => { overlay.style.display = "flex"; },
    hide: () => { overlay.style.display = "none"; },
    isVisible: () => overlay.style.display !== "none",
  };
}
