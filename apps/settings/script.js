(function () {
  const THEME_KEY = "egyptAcademyTheme";
  const SETTINGS_KEY = "egyptAcademySettings";
  const AMBIENT_KEY = "egyptAcademyAmbientLighting";

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

  /* ---------- Ambient Lighting ---------- */
  function playAmbientTransition(turningOn) {
    const overlay = document.createElement("div");
    overlay.className = "ambient-transition-overlay";
    overlay.innerHTML = `
      <div class="ambient-transition-spinner"></div>
      <div class="ambient-transition-progress"><div class="ambient-transition-bar" id="ambient-progress-bar"></div></div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("ambient-transition-active"));

    const bar = overlay.querySelector("#ambient-progress-bar");
    const durationMs = 5000;
    const start = performance.now();
    function tick(now) {
      const pct = Math.min(100, ((now - start) / durationMs) * 100);
      bar.style.width = pct + "%";
      if (pct < 100) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    setTimeout(() => {
      if (turningOn) document.documentElement.setAttribute("data-ambient", "true");
      else document.documentElement.removeAttribute("data-ambient");
      overlay.classList.remove("ambient-transition-active");
      setTimeout(() => overlay.remove(), 600);
    }, durationMs);
  }

  function applyAmbientImmediate(on) {
    // Used on page load — no need for the 5s transition every time the
    // app opens, only when the user actively flips the toggle.
    if (on) document.documentElement.setAttribute("data-ambient", "true");
    else document.documentElement.removeAttribute("data-ambient");
  }

  /* ---------- Account (merged from the old Profile app) ---------- */
  function initAccountSection() {
    const AUTH = window.EgyptAuth;
    if (!AUTH) return;
    const acc = AUTH.getAccount();
    const nameInput = document.getElementById("profile-name");
    const passInput = document.getElementById("profile-pass");
    const passConfirm = document.getElementById("profile-pass-confirm");
    const profileFeedback = document.getElementById("profile-feedback");
    if (!nameInput) return;
    nameInput.value = acc ? acc.name : "";

    document.getElementById("profile-save").addEventListener("click", () => {
      const newName = nameInput.value.trim();
      if (newName) AUTH.updateName(newName);

      const pass = passInput.value;
      const confirmPass = passConfirm.value;
      if (pass || confirmPass) {
        if (pass.length < 4) { profileFeedback.textContent = "Password must be at least 4 characters."; return; }
        if (pass !== confirmPass) { profileFeedback.textContent = "Passwords don't match."; return; }
        AUTH.setPassword(pass);
      }
      profileFeedback.textContent = "Saved.";
      passInput.value = "";
      passConfirm.value = "";
      if (window.EgyptAcademy && window.EgyptAcademy.refreshProgress) window.EgyptAcademy.refreshProgress();
    });
  }
  initAccountSection();

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

  const ambientBox = document.getElementById("setting-ambient-lighting");
  ambientBox.checked = localStorage.getItem(AMBIENT_KEY) === "true";
  ambientBox.addEventListener("change", () => {
    const turningOn = ambientBox.checked;
    localStorage.setItem(AMBIENT_KEY, turningOn ? "true" : "false");
    playAmbientTransition(turningOn);
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
    ambientBox.checked = false;
    localStorage.setItem(AMBIENT_KEY, "false");
    applyAmbientImmediate(false);
    feedback.textContent = "Settings reset to defaults.";
  });

  document.getElementById("delete-account-btn").addEventListener("click", () => {
    if (!confirm("Delete your account? This removes your name, password, recovery code, and all progress. This cannot be undone.")) return;
    localStorage.removeItem("egyptAcademyAccount");
    localStorage.removeItem("egyptAcademyProgress");
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(THEME_KEY);
    localStorage.removeItem("egyptAcademyDevToolsRevealed");
    localStorage.removeItem("egyptAcademyCreditsUnlocked");
    localStorage.removeItem("kiwoConversations");
    localStorage.removeItem("cosmoSettings");
    localStorage.removeItem(AMBIENT_KEY);
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-ambient");
    location.reload();
  });

  window.currentAppTeardown = function () {};
})();
