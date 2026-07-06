(function () {
  const THEME_KEY = "egyptAcademyTheme";
  const SETTINGS_KEY = "egyptAcademySettings";

  function getSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; }
    catch { return {}; }
  }
  function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

  function applyTheme(theme) {
    if (theme === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  function applyMotionSetting(reduceMotion) {
    document.documentElement.style.setProperty(
      "--hotspot-animation", reduceMotion ? "none" : ""
    );
    document.querySelectorAll(".hotspot-marker").forEach(el => {
      el.style.animation = reduceMotion ? "none" : "";
    });
  }

  function applyAlwaysLabels(always) {
    document.querySelectorAll(".hotspot-label").forEach(el => {
      el.style.opacity = always ? "1" : "";
    });
  }

  const themeButtons = document.querySelectorAll(".theme-btn");
  const currentTheme = localStorage.getItem(THEME_KEY) || "default";
  themeButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.themeValue === currentTheme);
    btn.addEventListener("click", () => {
      themeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyTheme(btn.dataset.themeValue);
    });
  });

  const settings = getSettings();
  const alwaysLabelsBox = document.getElementById("setting-always-labels");
  const reduceMotionBox = document.getElementById("setting-reduce-motion");
  alwaysLabelsBox.checked = !!settings.alwaysLabels;
  reduceMotionBox.checked = !!settings.reduceMotion;
  applyAlwaysLabels(settings.alwaysLabels);
  applyMotionSetting(settings.reduceMotion);

  alwaysLabelsBox.addEventListener("change", () => {
    const s = getSettings();
    s.alwaysLabels = alwaysLabelsBox.checked;
    saveSettings(s);
    applyAlwaysLabels(s.alwaysLabels);
  });
  reduceMotionBox.addEventListener("change", () => {
    const s = getSettings();
    s.reduceMotion = reduceMotionBox.checked;
    saveSettings(s);
    applyMotionSetting(s.reduceMotion);
  });

  const feedback = document.getElementById("settings-feedback");

  document.getElementById("reset-progress-btn").addEventListener("click", () => {
    if (!confirm("Reset all lesson and quiz progress? This can't be undone.")) return;
    localStorage.removeItem("egyptAcademyProgress");
    feedback.textContent = "Progress reset.";
    if (window.EgyptAcademy && window.EgyptAcademy.refreshProgress) window.EgyptAcademy.refreshProgress();
  });

  document.getElementById("reset-settings-btn").addEventListener("click", () => {
    if (!confirm("Reset theme and preferences to defaults? This won't affect your progress or account.")) return;
    applyTheme("default");
    themeButtons.forEach(b => b.classList.toggle("active", b.dataset.themeValue === "default"));
    saveSettings({ alwaysLabels: false, reduceMotion: false });
    alwaysLabelsBox.checked = false;
    reduceMotionBox.checked = false;
    applyAlwaysLabels(false);
    applyMotionSetting(false);
    feedback.textContent = "Settings reset to defaults.";
  });

  document.getElementById("delete-account-btn").addEventListener("click", () => {
    if (!confirm("Delete your account? This removes your name, password, recovery code, and all progress. This cannot be undone.")) return;
    localStorage.removeItem("egyptAcademyAccount");
    localStorage.removeItem("egyptAcademyProgress");
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(THEME_KEY);
    localStorage.removeItem("egyptAcademyDevToolsRevealed");
    document.documentElement.removeAttribute("data-theme");
    location.reload();
  });

  window.currentAppTeardown = function () {};
})();
