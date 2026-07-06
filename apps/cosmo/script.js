(function () {
  const enabledToggle = document.getElementById("cosmo-enabled-toggle");
  const themeGrid = document.getElementById("cosmo-theme-grid");
  const sizeSlider = document.getElementById("cosmo-size-slider");
  const sillySliderRow = document.getElementById("silly-slider-row");
  const sillySlider = document.getElementById("cosmo-silly-slider");
  const soundsToggle = document.getElementById("cosmo-sounds-toggle");
  const quizHelpToggle = document.getElementById("cosmo-quizhelp-toggle");
  const frameSlot = document.getElementById("cosmo-frame-slot");
  const feedback = document.getElementById("cosmo-feedback");
  const saveBtn = document.getElementById("cosmo-save-btn");

  const cosmo = window.Cosmo;
  let localSettings = cosmo ? cosmo.getSettings() : {
    enabled: false, theme: "classic", size: 56, sillyLevel: 50,
    soundsEnabled: true, quizHelpEnabled: true
  };

  // Live preview sprite inside the frame — separate DOM node from the real
  // floating Cosmo so it can keep animating even while the real one is
  // tucked away/hidden.
  const previewSprite = document.createElement("div");
  previewSprite.className = "cosmo-sprite cosmo-preview-sprite";
  previewSprite.style.position = "static";
  previewSprite.style.transform = "none";
  previewSprite.innerHTML = cosmo ? cosmo.spriteInnerHtml() : "";
  frameSlot.insertBefore(previewSprite, frameSlot.firstChild);

  function applyPreviewTheme(themeKey) {
    const t = (cosmo ? cosmo.THEMES : {})[themeKey];
    if (!t) return;
    previewSprite.style.setProperty("--cosmo-body", t.bodyColor);
    previewSprite.style.setProperty("--cosmo-accent", t.accentColor);
    previewSprite.dataset.mood = t.mood;
    sillySliderRow.style.display = t.mood === "silly" ? "block" : "none";
    applyPreviewSilly();
  }

  function applyPreviewSize() {
    const size = Number(sizeSlider.value);
    previewSprite.style.width = size + "px";
    previewSprite.style.height = size + "px";
  }

  function applyPreviewSilly() {
    const level = Number(sillySlider.value);
    previewSprite.style.setProperty("--cosmo-silly-speed", (2.2 - (level / 100) * 1.4) + "s");
    previewSprite.style.setProperty("--cosmo-silly-tilt", (4 + (level / 100) * 10) + "deg");
  }

  function renderThemeGrid() {
    themeGrid.innerHTML = "";
    const themes = cosmo ? cosmo.THEMES : {};
    Object.entries(themes).forEach(([key, t]) => {
      const btn = document.createElement("button");
      btn.className = "cosmo-theme-btn" + (localSettings.theme === key ? " active" : "");
      btn.innerHTML = `<span class="cosmo-theme-swatch" style="background:${t.bodyColor}"></span>${t.label}`;
      btn.addEventListener("click", () => {
        localSettings.theme = key;
        document.querySelectorAll(".cosmo-theme-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        applyPreviewTheme(key);
      });
      themeGrid.appendChild(btn);
    });
  }

  renderThemeGrid();
  sizeSlider.value = localSettings.size;
  sillySlider.value = localSettings.sillyLevel;
  applyPreviewTheme(localSettings.theme);
  applyPreviewSize();
  enabledToggle.checked = !!localSettings.enabled;
  soundsToggle.checked = !!localSettings.soundsEnabled;
  quizHelpToggle.checked = !!localSettings.quizHelpEnabled;
  previewSprite.style.opacity = localSettings.enabled ? "1" : "0.35";

  enabledToggle.addEventListener("change", () => {
    localSettings.enabled = enabledToggle.checked;
    previewSprite.style.opacity = localSettings.enabled ? "1" : "0.35";
  });
  sizeSlider.addEventListener("input", applyPreviewSize);
  sillySlider.addEventListener("input", applyPreviewSilly);

  saveBtn.addEventListener("click", () => {
    localSettings.enabled = enabledToggle.checked;
    localSettings.size = Number(sizeSlider.value);
    localSettings.sillyLevel = Number(sillySlider.value);
    localSettings.soundsEnabled = soundsToggle.checked;
    localSettings.quizHelpEnabled = quizHelpToggle.checked;
    if (cosmo) cosmo.updateSettings(localSettings);
    feedback.textContent = "Saved.";
  });

  const resetBtn = document.getElementById("cosmo-reset-btn");
  const COSMO_DEFAULTS = { enabled: false, theme: "classic", size: 56, sillyLevel: 50, soundsEnabled: true, quizHelpEnabled: true };
  resetBtn.addEventListener("click", () => {
    if (!confirm("Reset Cosmo to default settings?")) return;
    localSettings = Object.assign({}, COSMO_DEFAULTS);
    renderThemeGrid();
    sizeSlider.value = localSettings.size;
    sillySlider.value = localSettings.sillyLevel;
    applyPreviewTheme(localSettings.theme);
    applyPreviewSize();
    enabledToggle.checked = localSettings.enabled;
    soundsToggle.checked = localSettings.soundsEnabled;
    quizHelpToggle.checked = localSettings.quizHelpEnabled;
    previewSprite.style.opacity = localSettings.enabled ? "1" : "0.35";
    if (cosmo) cosmo.updateSettings(localSettings);
    feedback.textContent = "Reset to defaults.";
  });

  window.currentAppTeardown = function () {};
})();
