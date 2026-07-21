/* ============================================
   COSMO — floating desktop buddy
   Lives at document level, independent of view switching.
   Exposes window.Cosmo with: enterFrame(), exitFrame(),
   watchQuiz(container), stopWatchingQuiz()
   ============================================ */

const Cosmo = (() => {
  const SETTINGS_KEY = "cosmoSettings";

  // Each theme = a color + a fixed mood/personality (not swappable by users).
  // "mood" drives which face/animation set is used.
  const THEMES = {
    classic: {
      label: "Classic",
      bodyColor: "#f0c14b",
      accentColor: "#0d1b2a",
      mood: "happy",
      idleLines: [
        "Did you know cats were sacred in ancient Egypt?",
        "Papyrus was made from a reed that grew right on the Nile!",
        "I love exploring pyramids with you.",
        "Fun fact: the pharaohs wore fake beards, even the queens!"
      ]
    },
    sunset: {
      label: "Sunset",
      bodyColor: "#e8853d",
      accentColor: "#3a1a0d",
      mood: "silly",
      idleLines: [
        "Hehe, the desert sand tickles my feet.",
        "Ra sails across the sky in his sun-boat — wheee!",
        "I bet I could out-run a scarab beetle. Maybe.",
        "Golden hour, giggle hour, same thing really."
      ]
    },
    nile: {
      label: "Nile",
      bodyColor: "#3fa9a0",
      accentColor: "#062824",
      mood: "sad",
      idleLines: [
        "The river's calm today... kind of like how I feel. A little blue.",
        "Lotus flowers only bloom at dawn. I miss dawn already.",
        "Slow and steady, like the Nile's current. Sigh.",
        "Water always finds its way, even when it's hard."
      ]
    },
    crimson: {
      label: "Crimson",
      bodyColor: "#c1440e",
      accentColor: "#2a0a02",
      mood: "angry",
      idleLines: [
        "Let's GO already! Time to conquer this lesson!",
        "I've got energy to spare. Use it or lose it!",
        "Come ON, I know you've got this. Hurry up!",
        "Ugh. Fine. I'll wait. But hurry."
      ]
    },
    moonlight: {
      label: "Moonlight",
      bodyColor: "#8f9fc7",
      accentColor: "#141a2e",
      mood: "chill",
      idleLines: [
        "The stars over Giza are unbelievable at night.",
        "Thoth watches over scribes and scholars like you.",
        "No rush. We've got time.",
        "I like the quiet hours best."
      ]
    }
  };

  let settings = loadSettings();
  let root, sprite, bubble;
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let posX = mouseX, posY = mouseY;
  let following = true;
  let inFrame = false;
  let idleTimer = null;
  let quizWatcher = null;

  function loadSettings() {
    try {
      return Object.assign({
        enabled: false,
        theme: "classic",
        size: 56,          // px, base sprite size
        sillyLevel: 50,     // 0-100, only used by sunset theme
        soundsEnabled: true,
        quizHelpEnabled: true
      }, JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {});
    } catch {
      return { enabled: false, theme: "classic", size: 56, sillyLevel: 50, soundsEnabled: true, quizHelpEnabled: true };
    }
  }
  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function currentTheme() {
    return THEMES[settings.theme] || THEMES.classic;
  }

  /* ---------- DOM construction ---------- */
  function spriteInnerHtml() {
    return `
      <svg viewBox="0 0 100 100" class="cosmo-svg">
        <ellipse class="cosmo-shadow" cx="50" cy="92" rx="22" ry="5"></ellipse>
        <g class="cosmo-bob">
          <circle class="cosmo-body" cx="50" cy="55" r="30"></circle>
          <g class="cosmo-face">
            <path class="cosmo-brow cosmo-brow-l" d="M 33 42 Q 38 40 44 42" fill="none" stroke-width="2.4" stroke-linecap="round"></path>
            <path class="cosmo-brow cosmo-brow-r" d="M 56 42 Q 62 40 67 42" fill="none" stroke-width="2.4" stroke-linecap="round"></path>
            <circle class="cosmo-eye cosmo-eye-l" cx="40" cy="50" r="4.5"></circle>
            <circle class="cosmo-eye cosmo-eye-r" cx="60" cy="50" r="4.5"></circle>
            <path class="cosmo-blush cosmo-blush-l" cx="30" cy="58"></path>
            <path class="cosmo-mouth" d="M 42 63 Q 50 70 58 63" fill="none" stroke-width="3" stroke-linecap="round"></path>
          </g>
          <path class="cosmo-arm cosmo-arm-l" d="M 25 58 Q 15 65 18 75" fill="none" stroke-width="6" stroke-linecap="round"></path>
          <path class="cosmo-arm cosmo-arm-r" d="M 75 58 Q 85 65 82 75" fill="none" stroke-width="6" stroke-linecap="round"></path>
        </g>
      </svg>
    `;
  }

  function buildDom() {
    root = document.getElementById("cosmo-root");
    root.innerHTML = `
      <div id="cosmo-sprite" class="cosmo-sprite">${spriteInnerHtml()}</div>
      <div id="cosmo-bubble" class="cosmo-bubble" style="display:none;"></div>
    `;
    sprite = document.getElementById("cosmo-sprite");
    bubble = document.getElementById("cosmo-bubble");
    applyThemeVisuals();
  }

  function applyThemeVisuals() {
    if (!sprite) return;
    const t = currentTheme();
    sprite.style.setProperty("--cosmo-body", t.bodyColor);
    sprite.style.setProperty("--cosmo-accent", t.accentColor);
    sprite.dataset.mood = t.mood;
    sprite.style.width = settings.size + "px";
    sprite.style.height = settings.size + "px";
    if (t.mood === "silly") {
      const level = Math.max(0, Math.min(100, settings.sillyLevel));
      sprite.style.setProperty("--cosmo-silly-speed", (2.2 - (level / 100) * 1.4) + "s");
      sprite.style.setProperty("--cosmo-silly-tilt", (4 + (level / 100) * 10) + "deg");
    }
    sprite.style.display = settings.enabled ? "block" : "none";
    if (inFrame) sprite.style.visibility = "hidden";
  }

  /* ---------- Movement loop ---------- */
  function tick() {
    if (settings.enabled && following && !inFrame) {
      const offset = settings.size / 2;
      const targetX = mouseX + offset;
      const targetY = mouseY + offset;
      posX += (targetX - posX) * 0.12;
      posY += (targetY - posY) * 0.12;
      sprite.style.transform = `translate(${posX}px, ${posY}px)`;
    }
    requestAnimationFrame(tick);
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    resetIdleTimer();
  }

  /* ---------- Speech bubble ---------- */
  function say(text, duration = 3200) {
    if (!bubble) return;
    bubble.textContent = text;
    bubble.style.display = "block";
    bubble.style.left = posX + settings.size + 4 + "px";
    bubble.style.top = Math.max(posY - 20, 10) + "px";
    clearTimeout(say._t);
    say._t = setTimeout(() => { bubble.style.display = "none"; }, duration);
  }

  function ask(text, onYes, onNo) {
    if (!bubble) return;
    bubble.innerHTML = `
      <div>${text}</div>
      <div class="cosmo-bubble-actions">
        <button class="cosmo-bubble-btn cosmo-yes">Yes</button>
        <button class="cosmo-bubble-btn cosmo-no">No</button>
      </div>
    `;
    bubble.style.display = "block";
    bubble.style.left = posX + settings.size + 4 + "px";
    bubble.style.top = Math.max(posY - 20, 10) + "px";
    bubble.querySelector(".cosmo-yes").onclick = () => { bubble.style.display = "none"; onYes && onYes(); };
    bubble.querySelector(".cosmo-no").onclick = () => { bubble.style.display = "none"; onNo && onNo(); };
  }

  /* ---------- Idle chatter ---------- */
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(maybeSayIdleLine, 18000 + Math.random() * 14000);
  }
  function maybeSayIdleLine() {
    if (!settings.enabled || !settings.soundsEnabled) { resetIdleTimer(); return; }
    if (Math.random() < 0.6) {
      const lines = currentTheme().idleLines;
      say(lines[Math.floor(Math.random() * lines.length)]);
    }
    resetIdleTimer();
  }

  /* ---------- Quiz help (10s -> hint, 10s -> offer solve) ---------- */
  function watchQuiz(container) {
    stopWatchingQuiz();
    if (!settings.enabled || !settings.quizHelpEnabled || !container) return;
    const buttons = container.querySelectorAll(".quiz-btn");
    if (!buttons.length) return;

    const timers = [];
    function clearTimers() { timers.forEach(clearTimeout); timers.length = 0; }

    function offerHint() {
      ask("Been thinking a bit — want a hint?", () => {
        const correctBtn = container.querySelector('.quiz-btn[data-correct="true"]');
        const others = [...buttons].filter(b => b !== correctBtn);
        const ruledOut = others[Math.floor(Math.random() * others.length)];
        say(`I don't think it's "${ruledOut.textContent}" — try narrowing it down!`, 4000);
        timers.push(setTimeout(offerSolve, 10000));
      }, () => {
        timers.push(setTimeout(offerSolve, 10000));
      });
    }

    function offerSolve() {
      ask("Still stuck — want me to solve it?", () => {
        solveQuiz();
      }, () => {});
    }

    function solveQuiz() {
      const correctBtn = container.querySelector('.quiz-btn[data-correct="true"]');
      if (!correctBtn) return;
      following = false;
      const rect = correctBtn.getBoundingClientRect();
      const half = settings.size / 2;
      const targetX = rect.left + rect.width / 2 - half;
      const targetY = rect.top + rect.height / 2 - half;
      animateTo(targetX, targetY, () => {
        sprite.classList.add("cosmo-pressing");
        say("There you go!", 2000);
        setTimeout(() => {
          correctBtn.click();
          sprite.classList.remove("cosmo-pressing");
          following = true;
        }, 500);
      });
    }

    timers.push(setTimeout(offerHint, 10000));

    quizWatcher = { clearTimers };
    buttons.forEach(b => b.addEventListener("click", () => clearTimers(), { once: true }));
  }

  function stopWatchingQuiz() {
    if (quizWatcher) { quizWatcher.clearTimers(); quizWatcher = null; }
    if (bubble) bubble.style.display = "none";
  }

  function animateTo(x, y, onDone) {
    const startX = posX, startY = posY;
    const dx = x - startX, dy = y - startY;
    const duration = 700;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      posX = startX + dx * eased;
      posY = startY + dy * eased;
      sprite.style.transform = `translate(${posX}px, ${posY}px)`;
      if (t < 1) requestAnimationFrame(step);
      else onDone && onDone();
    }
    requestAnimationFrame(step);
  }

  /* ---------- Frame enter/exit (settings app) ---------- */
  function enterFrame() {
    inFrame = true;
    following = false;
    if (bubble) bubble.style.display = "none";
    if (sprite) sprite.style.visibility = "hidden";
  }
  function exitFrame() {
    inFrame = false;
    following = true;
    sprite.classList.remove("cosmo-in-frame");
    if (sprite && settings.enabled) sprite.style.visibility = "visible";
  }
  function setVisible(visible) {
    if (bubble && !visible) bubble.style.display = "none";
    if (sprite) sprite.style.visibility = visible && settings.enabled ? "visible" : "hidden";
  }

  /* ---------- Settings API used by apps/cosmo ---------- */
  function getSettings() { return Object.assign({}, settings); }
  function updateSettings(partial) {
    settings = Object.assign(settings, partial);
    saveSettings();
    applyThemeVisuals();
    if (!settings.enabled) {
      following = false;
      if (bubble) bubble.style.display = "none";
      stopWatchingQuiz();
    } else if (!inFrame) {
      following = true;
    }
  }

  function init() {
    buildDom();
    document.addEventListener("mousemove", onMouseMove);
    resetIdleTimer();
    requestAnimationFrame(tick);
  }

  document.addEventListener("DOMContentLoaded", init);

  function reactTo(kind, detail) {
    if (!settings.enabled) return;
    const lines = {
      themeChanged: {
        dark: "Ooh, going dark mode? Nice and moody.",
        light: "Bright and airy — I like it!",
        default: "Back to the classic look, I see."
      },
      ambientOn: ["Mmm, cozy. I like this lighting.", "Now this feels warm and nice."],
      ambientOff: ["Back to normal lighting, got it."],
      quizCorrect: ["Nice one!", "That's right!", "You got it!"],
      quizWrong: ["Aw, close one.", "Not quite — you'll get the next one."],
      lessonComplete: ["Lesson done! Nice work.", "Another one finished — great job!"],
      allComplete: ["Wow, you finished everything! I'm so proud of you."]
    };
    let text;
    if (kind === "themeChanged") {
      text = lines.themeChanged[detail] || lines.themeChanged.default;
    } else {
      const arr = lines[kind];
      if (!arr) return;
      text = Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr;
    }
    say(text, 3000);
  }

  return {
    say, ask, watchQuiz, stopWatchingQuiz,
    enterFrame, exitFrame, setVisible,
    getSettings, updateSettings,
    spriteInnerHtml,
    reactTo,
    THEMES
  };
})();

window.Cosmo = Cosmo;
