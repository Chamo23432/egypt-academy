(function () {
  const DEV_PASSWORD = "academy-dev-unlock";
  const UNLOCK_SESSION_KEY = "egyptAcademyDevToolsUnlocked";

  const lockedView = document.getElementById("devtools-locked-view");
  const unlockedView = document.getElementById("devtools-unlocked-view");
  const passwordInput = document.getElementById("devtools-password-input");
  const unlockBtn = document.getElementById("devtools-unlock-btn");
  const lockFeedback = document.getElementById("devtools-lock-feedback");
  const feedback = document.getElementById("devtools-feedback");

  function showUnlocked() {
    lockedView.style.display = "none";
    unlockedView.style.display = "block";
  }
  function showLocked() {
    lockedView.style.display = "block";
    unlockedView.style.display = "none";
    passwordInput.value = "";
  }

  // Unlock state persists only for this browser tab/session, not forever.
  if (sessionStorage.getItem(UNLOCK_SESSION_KEY) === "true") {
    showUnlocked();
  }

  function tryUnlock() {
    if (passwordInput.value === DEV_PASSWORD) {
      sessionStorage.setItem(UNLOCK_SESSION_KEY, "true");
      lockFeedback.textContent = "";
      showUnlocked();
    } else {
      lockFeedback.textContent = "Incorrect password.";
    }
  }
  unlockBtn.addEventListener("click", tryUnlock);
  passwordInput.addEventListener("keydown", e => { if (e.key === "Enter") tryUnlock(); });

  document.getElementById("dt-lock-btn").addEventListener("click", () => {
    sessionStorage.removeItem(UNLOCK_SESSION_KEY);
    showLocked();
  });

  /* ---------- Feature 1: complete all lessons ---------- */
  document.getElementById("dt-complete-lessons").addEventListener("click", () => {
    const ids = (window.EGYPT_ACADEMY_DATA && window.EGYPT_ACADEMY_DATA.allLessonIds) || [];
    ids.forEach(id => window.markLessonComplete && window.markLessonComplete(id));
    feedback.textContent = "All lessons marked complete.";
  });

  /* ---------- Feature 2: complete all quizzes ---------- */
  document.getElementById("dt-complete-quizzes").addEventListener("click", () => {
    const quizzes = (window.EGYPT_ACADEMY_DATA && window.EGYPT_ACADEMY_DATA.quizzes) || [];
    quizzes.forEach(q => window.markLessonComplete && window.markLessonComplete(q.id));
    feedback.textContent = "All quizzes marked complete.";
  });

  /* ---------- Feature 3: reset all progress ---------- */
  document.getElementById("dt-reset-progress").addEventListener("click", () => {
    localStorage.removeItem("egyptAcademyProgress");
    if (window.EgyptAcademy && window.EgyptAcademy.refreshProgress) window.EgyptAcademy.refreshProgress();
    feedback.textContent = "Progress reset.";
  });

  /* ---------- Feature 4: force-enable Cosmo ---------- */
  document.getElementById("dt-force-cosmo").addEventListener("click", () => {
    if (window.Cosmo) {
      window.Cosmo.updateSettings({ enabled: true });
      feedback.textContent = "Cosmo enabled.";
    } else {
      feedback.textContent = "Cosmo isn't loaded.";
    }
  });

  /* ---------- Feature 5: dump saved data ---------- */
  document.getElementById("dt-dump-data").addEventListener("click", () => {
    const dump = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      dump[key] = localStorage.getItem(key);
    }
    console.log("Egypt Academy localStorage dump:", dump);
    feedback.textContent = "Dumped to browser console (press F12 to view).";
  });

  window.currentAppTeardown = function () {};
})();
