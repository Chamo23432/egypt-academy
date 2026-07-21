/* ============================================
   EGYPT ACADEMY — app.js
   ============================================ */

const EgyptAcademy = (() => {
  const DATA = window.EGYPT_ACADEMY_DATA;
  const AUTH = window.EgyptAuth;
  const STORAGE_KEY = "egyptAcademyProgress";

  let currentLoadedApp = null;
  let pendingRecoveryFile = null; // parsed JSON waiting to be verified

  /* ---------- Progress tracking ---------- */
  function getProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }
  function markComplete(appId) {
    const progress = getProgress();
    progress[appId] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    renderDashboardProgress();
    if (window.Credits) window.Credits.checkUnlock();
    if (window.Cosmo) {
      const allIds = [...(DATA.allLessonIds || []), ...((DATA.quizzes || []).map(q => q.id))];
      const nowComplete = allIds.every(id => progress[id]);
      window.Cosmo.reactTo(nowComplete ? "allComplete" : "lessonComplete");
    }
  }
  window.markLessonComplete = markComplete;

  /* ---------- View switching (inside main app) ---------- */
  function showView(viewId) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    const el = document.getElementById(viewId);
    if (el) el.classList.add("active");
    document.querySelectorAll(".nav-links button").forEach(b => {
      b.classList.toggle("active", b.dataset.view === viewId);
    });
    document.querySelectorAll(".mobile-navbar-btn[data-view]").forEach(b => {
      b.classList.toggle("active", b.dataset.view === viewId);
    });
    window.scrollTo(0, 0);

    if (viewId !== "view-cosmo" && window.Cosmo) window.Cosmo.exitFrame();

    if (viewId === "view-cosmo") loadContentApp("cosmo", "cosmo-content", () => {
      if (window.Cosmo) window.Cosmo.enterFrame();
    });
    if (viewId === "view-settings") loadContentApp("settings", "settings-content");
    if (viewId === "view-devtools") loadContentApp("devtools", "devtools-content");
    if (viewId === "view-kiwo") loadContentApp("kiwo", "kiwo-content");
    const topbar = document.querySelector(".topbar");
    const mobileNotch = document.querySelector(".mobile-notch");
    const mobileNavbar = document.querySelector(".mobile-navbar");
    const isCredits = viewId === "view-credits";
    if (topbar) topbar.style.display = isCredits ? "none" : "flex";
    if (mobileNotch) mobileNotch.style.display = isCredits ? "none" : "";
    if (mobileNavbar) mobileNavbar.style.display = isCredits ? "none" : "";

    if (viewId === "view-credits" && window.Credits) {
      window.Credits.render(document.getElementById("credits-content"));
    } else if (window.Credits) {
      window.Credits.teardown();
    }
  }

  /* ---------- AUTH FLOW ---------- */
  const SETUP_STEP_ORDER = ["intro", "name", "password", "recovery", "theme", "cosmo", "tour-choice", "tour", "finish"];
  const SETUP_SCREEN_IDS = {
    intro: "setup-intro", name: "setup-name", password: "setup-password",
    recovery: "setup-recovery", theme: "setup-theme", cosmo: "setup-cosmo",
    "tour-choice": "setup-tour-choice", tour: "setup-tour", finish: "setup-finish"
  };
  let setupMusicEl = null;

  function showAuthScreen(id) {
    document.querySelectorAll("#auth-flow .auth-view").forEach(v => v.style.display = "none");
    const el = document.getElementById(id);
    if (el) el.style.display = "flex";
  }

  function showSetupStep(stepKey) {
    const wizard = document.getElementById("setup-wizard");
    if (wizard.style.display === "none") wizard.style.display = "flex";
    document.querySelectorAll(".setup-step-dot").forEach(dot => {
      dot.classList.toggle("active", dot.dataset.step === stepKey);
    });
    SETUP_STEP_ORDER.forEach(key => {
      const screen = document.getElementById(SETUP_SCREEN_IDS[key]);
      if (key === stepKey) {
        screen.classList.remove("setup-screen-leaving");
        screen.classList.add("setup-screen-active");
      } else {
        screen.classList.remove("setup-screen-active");
      }
    });
  }

  function playSetupMusic() {
    setupMusicEl = document.getElementById("setup-music");
    if (!setupMusicEl) return;
    setupMusicEl.volume = 0.6;
    setupMusicEl.play().catch(() => {
      // Autoplay can be blocked until a user gesture (e.g. clicking
      // "Begin Setup"); it will start on that first interaction instead.
    });
  }

  function stopSetupMusic() {
    if (!setupMusicEl) return;
    setupMusicEl.pause();
    setupMusicEl.currentTime = 0;
  }

  function unlockApp() {
    stopSetupMusic();
    const wizard = document.getElementById("setup-wizard");
    if (wizard) wizard.style.display = "none";
    document.getElementById("auth-flow").style.display = "none";
    document.getElementById("main-app").style.display = "block";
    initMainApp();
  }

  function initAuth() {
    if (!AUTH.accountExists()) {
      showSetupStep("intro");
      playSetupMusic();
    } else if (AUTH.hasPassword()) {
      const acc = AUTH.getAccount();
      document.getElementById("login-subtitle").textContent = `Enter your password, ${acc.name}`;
      showAuthScreen("auth-login");
    } else {
      unlockApp();
    }
  }

  document.getElementById("setup-intro-next-btn").addEventListener("click", () => {
    playSetupMusic(); // also covers the case where autoplay was blocked earlier
    showSetupStep("name");
  });

  // Step 1 -> 2
  document.getElementById("create-next-btn").addEventListener("click", () => {
    const name = document.getElementById("create-name-input").value.trim();
    const errorEl = document.getElementById("create-error");
    if (!name) { errorEl.textContent = "Please enter your name."; return; }
    errorEl.textContent = "";
    AUTH.createAccount(name);
    showSetupStep("password");
  });

  // Step 2 -> 3 (save password) or -> unlock (skip)
  document.getElementById("password-save-btn").addEventListener("click", () => {
    const pass = document.getElementById("password-input").value;
    const confirm = document.getElementById("password-confirm-input").value;
    const errorEl = document.getElementById("password-error");
    if (!pass || pass.length < 4) { errorEl.textContent = "Password must be at least 4 characters."; return; }
    if (pass !== confirm) { errorEl.textContent = "Passwords don't match."; return; }
    errorEl.textContent = "";
    const code = AUTH.setPassword(pass);
    document.getElementById("recovery-code-text").textContent = code;
    showSetupStep("recovery");
  });
  document.getElementById("password-skip-btn").addEventListener("click", () => showSetupStep("theme"));

  document.getElementById("recovery-continue-btn").addEventListener("click", () => showSetupStep("theme"));
  document.getElementById("recovery-copy-btn").addEventListener("click", () => {
    copyToClipboard(document.getElementById("recovery-code-text").textContent, "recovery-copy-feedback");
  });

  /* ---------- Step 4: theme ---------- */
  let setupSelectedTheme = "default";
  document.querySelectorAll(".setup-theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".setup-theme-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setupSelectedTheme = btn.dataset.themeValue;
      if (setupSelectedTheme === "default") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", setupSelectedTheme);
      }
    });
  });
  document.getElementById("setup-theme-next-btn").addEventListener("click", () => {
    localStorage.setItem("egyptAcademyTheme", setupSelectedTheme);
    showSetupStep("cosmo");
  });

  /* ---------- Step 5: cosmo ---------- */
  document.getElementById("setup-cosmo-next-btn").addEventListener("click", () => {
    const enable = document.getElementById("setup-cosmo-toggle").checked;
    if (window.Cosmo) window.Cosmo.updateSettings({ enabled: enable });
    else {
      // Cosmo module may not be loaded yet in some edge cases; persist
      // directly so the setting still takes effect once it initializes.
      try {
        const existing = JSON.parse(localStorage.getItem("cosmoSettings")) || {};
        existing.enabled = enable;
        localStorage.setItem("cosmoSettings", JSON.stringify(existing));
      } catch (e) {}
    }
    const acc = AUTH.getAccount();
    const titleEl = document.getElementById("setup-finish-title");
    if (titleEl && acc) titleEl.textContent = `You're all set, ${acc.name}!`;
    showSetupStep("tour-choice");
  });

  /* ---------- Step 6: welcome tour (optional) ---------- */
  const TOUR_SLIDES = [
    {
      title: "Welcome to Egypt Academy",
      body: "This quick tour will walk you through the main features so you know exactly where everything is.",
      preview: () => `<div class="tour-demo-ankh">&#9765;</div>`
    },
    {
      title: "Your Dashboard",
      body: "The Dashboard is home base — your two wallpaper scenes and your overall progress live here.",
      preview: () => `
        <div class="tour-demo-dashboard">
          <div class="tour-demo-card"></div>
          <div class="tour-demo-card"></div>
        </div>`
    },
    {
      title: "Interactive wallpapers",
      body: "Click a glowing hotspot on the Giza Plateau or Nile scene to open a short lesson about that spot.",
      preview: () => `<div class="tour-demo-hotspot"><svg viewBox="0 0 24 24"><path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"/></svg></div>`
    },
    {
      title: "Quizzes and hints",
      body: "Each lesson has a matching quiz. If you're stuck, Cosmo can offer a hint after a few seconds.",
      preview: () => `
        <div class="tour-demo-quiz">
          <span class="tour-demo-quiz-q">Who built the Great Pyramid?</span>
          <div class="tour-demo-quiz-opts">
            <span class="tour-demo-quiz-opt">Ramesses</span>
            <span class="tour-demo-quiz-opt tour-quiz-highlight">Khufu</span>
            <span class="tour-demo-quiz-opt">Cleopatra</span>
          </div>
        </div>`
    },
    {
      title: "Cosmo, your companion",
      body: "Cosmo can float around your screen and cheer you on. Customize his look, size, and behavior anytime in the Cosmo app.",
      preview: () => {
        const inner = window.Cosmo ? window.Cosmo.spriteInnerHtml() : "";
        return `<div class="cosmo-sprite tour-demo-cosmo-sprite" data-mood="happy">${inner}</div>`;
      }
    },
    {
      title: "Chatting with Kiwo",
      body: "Tap Kiwo's icon in the top bar to open a full chat — ask questions, upload files, and revisit past conversations.",
      preview: () => `
        <div class="tour-demo-chat">
          <span class="tour-demo-bubble tour-bubble-user">Tell me about the pyramids</span>
          <span class="tour-demo-bubble tour-bubble-assistant">The Giza pyramids were built around 2560-2510 BCE...</span>
        </div>`
    },
    {
      title: "Talking to Kiwo",
      body: "Hold Kiwo's icon down and swipe downward to open voice mode — he starts listening right away and replies out loud.",
      preview: () => `
        <div class="tour-demo-mic-wrap">
          <div class="tour-demo-mic tour-mic-swipe"></div>
          <span class="tour-demo-arrow">hold, then swipe down &#8595;</span>
        </div>`
    },
    {
      title: "Themes anytime",
      body: "Switch between Default, Dark, and Light whenever you like from the Settings app — no need to redo setup.",
      preview: () => `
        <div class="tour-demo-theme-swatches">
          <span class="tour-demo-swatch tour-swatch-active" style="background:linear-gradient(135deg,#0d1b2a,#d4a017)"></span>
          <span class="tour-demo-swatch" style="background:linear-gradient(135deg,#05090d,#f0c14b)"></span>
          <span class="tour-demo-swatch" style="background:linear-gradient(135deg,#f3e6c8,#a9720c)"></span>
        </div>`
    }
  ];
  let tourIndex = 0;

  function renderTourSlide() {
    const slide = TOUR_SLIDES[tourIndex];
    document.getElementById("tour-slide-label").textContent = `Tour ${tourIndex + 1} of ${TOUR_SLIDES.length}`;
    document.getElementById("tour-slide-title").textContent = slide.title;
    document.getElementById("tour-slide-body").textContent = slide.body;
    document.getElementById("tour-preview").innerHTML = slide.preview();
    document.getElementById("tour-back-btn").style.visibility = tourIndex === 0 ? "hidden" : "visible";
    document.getElementById("tour-next-btn").textContent = tourIndex === TOUR_SLIDES.length - 1 ? "Finish tour" : "Next";
  }

  document.getElementById("setup-tour-start-btn").addEventListener("click", () => {
    tourIndex = 0;
    renderTourSlide();
    showSetupStep("tour");
  });
  document.getElementById("setup-tour-skip-btn").addEventListener("click", () => showSetupStep("finish"));
  document.getElementById("tour-exit-btn").addEventListener("click", () => showSetupStep("finish"));

  document.getElementById("tour-back-btn").addEventListener("click", () => {
    if (tourIndex > 0) { tourIndex--; renderTourSlide(); }
  });
  document.getElementById("tour-next-btn").addEventListener("click", () => {
    if (tourIndex < TOUR_SLIDES.length - 1) {
      tourIndex++;
      renderTourSlide();
    } else {
      showSetupStep("finish");
    }
  });

  /* ---------- Step 7: finish ---------- */
  document.getElementById("setup-finish-btn").addEventListener("click", unlockApp);

  // Login
  document.getElementById("login-btn").addEventListener("click", () => {
    const pass = document.getElementById("login-password-input").value;
    const errorEl = document.getElementById("login-error");
    if (AUTH.checkPassword(pass)) {
      errorEl.textContent = "";
      unlockApp();
    } else {
      errorEl.textContent = "Incorrect password.";
    }
  });
  document.getElementById("login-password-input").addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("login-btn").click();
  });

  // Forgot password flow
  document.getElementById("forgot-password-btn").addEventListener("click", () => {
    showAuthScreen("auth-forgot");
  });
  document.getElementById("back-to-login-btn").addEventListener("click", () => {
    showAuthScreen("auth-login");
  });

  const dropZone = document.getElementById("recovery-drop-zone");
  const fileInput = document.getElementById("recovery-file-input");
  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("dragover"); });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files[0]) handleRecoveryFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) handleRecoveryFile(fileInput.files[0]);
  });

  function handleRecoveryFile(file) {
    const errorEl = document.getElementById("forgot-error");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (AUTH.verifyRecoveryFile(data)) {
          pendingRecoveryFile = data;
          errorEl.textContent = "";
          errorEl.style.color = "var(--gold-400)";
          errorEl.textContent = "File verified — set your new password below.";
          document.getElementById("forgot-reset-section").style.display = "block";
        } else {
          errorEl.style.color = "";
          errorEl.textContent = "This file doesn't match your student name and recovery code.";
          document.getElementById("forgot-reset-section").style.display = "none";
        }
      } catch {
        errorEl.textContent = "Invalid recovery file.";
      }
    };
    reader.readAsText(file);
  }

  document.getElementById("reset-password-btn").addEventListener("click", () => {
    const pass = document.getElementById("new-password-input").value;
    const confirm = document.getElementById("new-password-confirm-input").value;
    const errorEl = document.getElementById("forgot-error");
    if (!pendingRecoveryFile) { errorEl.textContent = "Please verify a recovery file first."; return; }
    if (!pass || pass.length < 4) { errorEl.textContent = "Password must be at least 4 characters."; return; }
    if (pass !== confirm) { errorEl.textContent = "Passwords don't match."; return; }
    const code = AUTH.resetPasswordAfterRecovery(pass);
    errorEl.style.color = "var(--gold-400)";
    document.getElementById("recovery-code-text-standalone").textContent = code;
    pendingRecoveryFile = null;
    showAuthScreen("auth-recovery-standalone");
  });
  document.getElementById("recovery-standalone-continue-btn").addEventListener("click", unlockApp);
  document.getElementById("recovery-copy-standalone-btn").addEventListener("click", () => {
    copyToClipboard(document.getElementById("recovery-code-text-standalone").textContent, "recovery-copy-standalone-feedback");
  });

  function copyToClipboard(text, feedbackElId) {
    const feedbackEl = document.getElementById(feedbackElId);
    const done = () => { if (feedbackEl) { feedbackEl.textContent = "Copied!"; setTimeout(() => feedbackEl.textContent = "", 2000); } };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    ta.remove();
  }

  /* ---------- Profile app hook ---------- */
  /* ---------- Dashboard ---------- */
  function renderDashboardGreeting() {
    const acc = AUTH.getAccount();
    const el = document.getElementById("dashboard-greeting");
    if (el && acc) el.textContent = `Welcome, ${acc.name}`;
  }

  function renderDashboard() {
    const grid = document.getElementById("wallpaper-grid");
    grid.innerHTML = "";
    Object.values(DATA.wallpapers).forEach(wp => {
      const card = document.createElement("div");
      card.className = "wallpaper-card glass-panel";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Open ${wp.title} lesson map`);
      card.innerHTML = `
        <img src="${wp.image}" alt="${wp.title}" />
        <div class="overlay-gradient"></div>
        <div class="card-label">${wp.title} &rarr;</div>
      `;
      const open = () => openScene(wp.id);
      card.addEventListener("click", open);
      card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      grid.appendChild(card);
    });
    renderDashboardProgress();
    renderDashboardGreeting();
  }

  function renderDashboardProgress() {
    const list = document.getElementById("progress-list");
    if (!list) return;
    const progress = getProgress();
    const allIds = [...DATA.allLessonIds];
    const total = allIds.length;
    const done = allIds.filter(id => progress[id]).length;
    const names = {
      "pyramid-khufu": "Khufu", "pyramid-khafre": "Khafre", "pyramid-menkaure": "Menkaure",
      "nile-river": "The Nile's Flow", "nile-lotus": "Blue Lotus", "nile-crocodile": "Nile Crocodile"
    };
    list.innerHTML = `
      <div class="progress-row">
        <span>Overall</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(done/total)*100}%"></div></div>
        <span>${done}/${total}</span>
      </div>
    ` + allIds.map(id => `
      <div class="progress-row">
        <span>${names[id] || id}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${progress[id] ? 100 : 0}%"></div></div>
        <span>${progress[id] ? "Done" : "—"}</span>
      </div>
    `).join("");
  }

  /* ---------- Quizzes grid ---------- */
  function renderQuizzes() {
    const grid = document.getElementById("quiz-grid");
    grid.innerHTML = "";
    DATA.quizzes.forEach(q => {
      const card = document.createElement("div");
      card.className = "wallpaper-card glass-panel";
      card.style.minHeight = "120px";
      card.style.background = "var(--glass-bg-light)";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.innerHTML = `<div class="card-label" style="position:static;padding:1.2rem;">${q.label} &rarr;</div>`;
      const open = () => openLesson(q.appId, q.label);
      card.addEventListener("click", open);
      card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      grid.appendChild(card);
    });
  }

  /* ---------- Scene ---------- */
  function openScene(wallpaperId) {
    const wp = DATA.wallpapers[wallpaperId];
    if (!wp) return;
    const sceneView = document.getElementById("view-scene");
    sceneView.innerHTML = `
      <div class="scene-view">
        <img class="scene-bg" src="${wp.image}" alt="${wp.title}" />
        <div class="scene-dim"></div>
        <button class="scene-back-btn" id="scene-back">&larr; Dashboard</button>
        <div class="scene-title glass-panel glass-panel--light">
          <h2 style="margin:0;font-size:1.1rem;">${wp.title}</h2>
          <p style="margin:0.25rem 0 0;font-size:0.85rem;color:var(--text-300);">Click a highlighted point to begin a lesson</p>
        </div>
        ${wp.hotspots.map((spot, i) => hotspotHtml(spot, i)).join("")}
      </div>
    `;
    sceneView.querySelectorAll(".hotspot").forEach(el => {
      el.addEventListener("click", () => openLesson(el.dataset.appId, el.dataset.label));
    });
    document.getElementById("scene-back").addEventListener("click", () => showView("view-dashboard"));
    showView("view-scene");
  }

  function hotspotHtml(spot, index) {
    return `
      <button class="hotspot" style="left:${spot.x}%; top:${spot.y}%; --hotspot-index:${index};" data-app-id="${spot.appId}" data-label="${spot.label}" aria-label="Start lesson: ${spot.label}">
        <span class="hotspot-marker">
          <svg viewBox="0 0 24 24"><path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"/></svg>
        </span>
        <span class="hotspot-label">${spot.label}</span>
      </button>
    `;
  }

  /* ---------- Lesson app loader (fullscreen host, e.g. from a scene or quiz grid) ---------- */
  async function openLesson(appId, label) {
    const host = document.getElementById("view-lesson");
    host.innerHTML = `
      <div class="scene-view" style="height:auto;min-height:100vh;background:var(--night-900);">
        <button class="scene-back-btn" id="lesson-back">&larr; Back</button>
        <div class="lesson-host">
          <div class="glass-panel" id="lesson-content"><p style="color:var(--text-300)">Loading "${label}"&hellip;</p></div>
        </div>
      </div>
    `;
    document.getElementById("lesson-back").addEventListener("click", () => {
      cleanupLoadedApp();
      showView(appId.startsWith("quiz-") ? "view-quizzes" : "view-scene");
    });
    showView("view-lesson");
    await loadApp(appId, "lesson-content");
  }

  /* ---------- Content app loader (used for tab-hosted apps like hieroglyphs/profile) ---------- */
  const loadedContentApps = {};
  async function loadContentApp(appId, targetElId, afterLoadHook) {
    await loadApp(appId, targetElId);
    loadedContentApps[targetElId] = appId;
    if (afterLoadHook) afterLoadHook();
  }

  function cleanupLoadedApp() {
    if (currentLoadedApp) {
      currentLoadedApp.css?.remove();
      currentLoadedApp.js?.remove();
      currentLoadedApp = null;
    }
    if (window.currentAppTeardown) {
      try { window.currentAppTeardown(); } catch (e) {}
      window.currentAppTeardown = null;
    }
  }

  async function loadApp(appId, targetElId) {
    cleanupLoadedApp();
    const base = `apps/${appId}/`;
    const contentEl = document.getElementById(targetElId);
    try {
      const res = await fetch(base + "index.html");
      if (!res.ok) throw new Error(`Missing apps/${appId}/index.html`);
      contentEl.innerHTML = await res.text();

      // Note: per-app CSS used to be injected here via a <link> tag, but
      // that caused a visible flash of unstyled buttons/inputs before the
      // fetch resolved. All app styles now live in the main styles.css
      // (loaded once, up front), so nothing needs injecting here anymore.

      const script = document.createElement("script");
      script.src = base + "script.js";
      script.dataset.appAsset = appId;
      document.body.appendChild(script);

      currentLoadedApp = { css: null, js: script };
    } catch (err) {
      contentEl.innerHTML = `
        <p style="color:var(--carnelian-500)">
          Couldn't load this (${err.message}). If you opened this file directly
          (file://), serve the folder with a local server instead — fetch
          requires http:// to work.
        </p>
      `;
      console.error(err);
    }
  }

  /* ---------- Search bar ---------- */
  const DEV_TRIGGER = "egyptacademy-dev";
  const DEVTOOLS_UNLOCKED_KEY = "egyptAcademyDevToolsRevealed";

  function initSearch() {
    bindSearchInput("app-search-input", "search-results", "search-processing", ".center-search-box");
    bindSearchInput("mobile-search-input", "mobile-search-results", "mobile-search-processing", ".mobile-search-sheet");

    const centerSearchOverlay = document.getElementById("center-search-overlay");
    initNotifications();
    const sidebarSearchIcon = document.getElementById("sidebar-search-icon");
    if (sidebarSearchIcon && centerSearchOverlay) {
      sidebarSearchIcon.addEventListener("click", () => {
        centerSearchOverlay.classList.add("open");
        setTimeout(() => document.getElementById("app-search-input").focus(), 50);
      });
      centerSearchOverlay.addEventListener("click", (e) => {
        if (e.target === centerSearchOverlay) centerSearchOverlay.classList.remove("open");
      });
    }
  }

  function initNotifications() {
    const bell = document.getElementById("top-userbar-bell");
    const panel = document.getElementById("notif-panel");
    const list = document.getElementById("notif-panel-list");
    const dot = document.getElementById("notif-dot");
    const clearBtn = document.getElementById("notif-clear-btn");
    if (!bell || !panel || !list) return;

    let notifications = [
      { title: "Welcome to Egypt Academy!", time: "Just now" },
      { title: "You completed the Khufu lesson.", time: "Today" },
      { title: "New quiz available: The Nile River.", time: "Yesterday" }
    ];

    function render() {
      if (notifications.length === 0) {
        list.innerHTML = `<div class="notif-empty">No notifications</div>`;
        dot.style.display = "none";
        return;
      }
      dot.style.display = "block";
      list.innerHTML = notifications.map(n => `
        <div class="notif-item">
          <span class="notif-item-title">${n.title}</span>
          <span class="notif-item-time">${n.time}</span>
        </div>
      `).join("");
    }

    bell.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (panel.classList.contains("open") && !panel.contains(e.target) && e.target !== bell) {
        panel.classList.remove("open");
      }
    });
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        notifications = [];
        render();
      });
    }
    render();
  }

  function bindSearchInput(inputId, resultsId, processingId, closeOnClickOutsideSelector) {
    const input = document.getElementById(inputId);
    const resultsEl = document.getElementById(resultsId);
    const processingEl = document.getElementById(processingId);
    const devNavItem = document.getElementById("devtools-nav-item");
    if (!input) return;

    // If dev tools were already revealed in a previous session, keep them visible
    if (localStorage.getItem(DEVTOOLS_UNLOCKED_KEY) === "true") {
      devNavItem.style.display = "list-item";
      const moreDev = document.getElementById("mobile-more-devtools");
      if (moreDev) moreDev.style.display = "block";
    }

    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();

      if (query === DEV_TRIGGER) {
        resultsEl.style.display = "none";
        processingEl.style.display = "block";
        setTimeout(() => {
          processingEl.style.display = "none";
          devNavItem.style.display = "list-item";
          const moreDev = document.getElementById("mobile-more-devtools");
          if (moreDev) moreDev.style.display = "block";
          localStorage.setItem(DEVTOOLS_UNLOCKED_KEY, "true");
          input.value = "";
        }, 1200);
        return;
      }
      processingEl.style.display = "none";

      if (!query) { resultsEl.style.display = "none"; return; }

      const matches = (DATA.searchIndex || []).filter(item =>
        item.label.toLowerCase().includes(query)
      ).slice(0, 8);

      if (!matches.length) {
        resultsEl.innerHTML = `<p class="search-no-results">No matches for "${input.value}"</p>`;
        resultsEl.style.display = "block";
        return;
      }

      resultsEl.innerHTML = matches.map((m, i) =>
        `<button class="search-result-item" data-index="${i}">${m.label}<span class="search-result-tag">${m.type}</span></button>`
      ).join("");
      resultsEl.style.display = "block";

      resultsEl.querySelectorAll(".search-result-item").forEach((btn, i) => {
        btn.addEventListener("click", () => {
          resultsEl.style.display = "none";
          input.value = "";
          const item = matches[i];
          if (item.type === "view") showView(item.target);
          else if (item.type === "scene") openScene(item.target);
          else if (item.type === "lesson" || item.type === "quiz") openLesson(item.target, item.label);
          const searchSheet = document.getElementById("mobile-search-sheet");
          if (searchSheet) searchSheet.classList.remove("mobile-search-open");
        });
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(closeOnClickOutsideSelector)) resultsEl.style.display = "none";
    });
  }


  function initMainApp() {
    renderDashboard();
    renderQuizzes();
    document.querySelectorAll(".nav-links button[data-view]").forEach(btn => {
      btn.addEventListener("click", () => showView(btn.dataset.view));
    });
    initSearch();
    initMobileNav();
    if (window.Kiwo) {
      window.Kiwo.init(["kiwo-launcher-btn", "mobile-notch-kiwo-btn"], () => showView("view-kiwo"));
    }
    if (window.Credits) window.Credits.checkUnlock();
    showView("view-dashboard");
  }

  function initMobileNav() {
    // Bottom navbar buttons
    document.querySelectorAll(".mobile-navbar-btn[data-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        showView(btn.dataset.view);
        document.querySelectorAll(".mobile-navbar-btn[data-view]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // "More" bottom sheet
    const moreBtn = document.getElementById("mobile-more-btn");
    const moreSheet = document.getElementById("mobile-more-sheet");
    const moreBackdrop = document.getElementById("mobile-more-backdrop");
    const moreCancel = document.getElementById("mobile-more-cancel");

    function openMoreSheet() {
      moreSheet.classList.add("mobile-more-open");
      moreBackdrop.classList.add("mobile-more-open");
    }
    function closeMoreSheet() {
      moreSheet.classList.remove("mobile-more-open");
      moreBackdrop.classList.remove("mobile-more-open");
    }
    if (moreBtn) moreBtn.addEventListener("click", openMoreSheet);
    if (moreCancel) moreCancel.addEventListener("click", closeMoreSheet);
    if (moreBackdrop) moreBackdrop.addEventListener("click", closeMoreSheet);

    document.querySelectorAll(".mobile-more-item[data-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        showView(btn.dataset.view);
        closeMoreSheet();
        document.querySelectorAll(".mobile-navbar-btn[data-view]").forEach(b => b.classList.remove("active"));
      });
    });

    // Reflect Dev-Tools/Credits reveal state into the More sheet too
    const devVisible = document.getElementById("devtools-nav-item").style.display !== "none";
    const creditsVisible = document.getElementById("credits-nav-item").style.display !== "none";
    document.getElementById("mobile-more-devtools").style.display = devVisible ? "block" : "none";
    document.getElementById("mobile-more-credits").style.display = creditsVisible ? "block" : "none";

    // Mobile search sheet (opened from the More sheet for simplicity, keeps notch minimal)
    const searchSheet = document.getElementById("mobile-search-sheet");
    const searchClose = document.getElementById("mobile-search-close");
    const moreSearchBtn = document.getElementById("mobile-more-search");
    if (moreSearchBtn) {
      moreSearchBtn.addEventListener("click", () => {
        closeMoreSheet();
        searchSheet.classList.add("mobile-search-open");
        setTimeout(() => document.getElementById("mobile-search-input").focus(), 350);
      });
    }
    if (searchClose) {
      searchClose.addEventListener("click", () => searchSheet.classList.remove("mobile-search-open"));
    }
  }

  function init() {
    initAuth();
  }

  return { init, openScene, openLesson, markComplete, refreshProgress: renderDashboardProgress };
})();

document.addEventListener("DOMContentLoaded", EgyptAcademy.init);
window.EgyptAcademy = EgyptAcademy;
