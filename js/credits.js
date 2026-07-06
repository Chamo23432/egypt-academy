/* ============================================
   CREDITS — unlock detection + full-screen credits/certificate experience
   ============================================ */

const Credits = (() => {
  const UNLOCK_KEY = "egyptAcademyCreditsUnlocked";
  let audioEl = null;
  let scrollAnimFrame = null;

  function allLessonsComplete() {
    try {
      const progress = JSON.parse(localStorage.getItem("egyptAcademyProgress")) || {};
      const data = window.EGYPT_ACADEMY_DATA || {};
      const ids = data.allLessonIds || [];
      if (!ids.length) return false;
      return ids.every(id => progress[id]);
    } catch {
      return false;
    }
  }

  function checkUnlock() {
    const navItem = document.getElementById("credits-nav-item");
    if (!navItem) return;
    const alreadyUnlocked = localStorage.getItem(UNLOCK_KEY) === "true";
    const mobileMoreCredits = document.getElementById("mobile-more-credits");

    if (allLessonsComplete()) {
      if (navItem.style.display === "none") {
        navItem.style.display = "list-item";
        if (!alreadyUnlocked) {
          navItem.classList.add("credits-revealing");
          setTimeout(() => navItem.classList.remove("credits-revealing"), 800);
        }
        localStorage.setItem(UNLOCK_KEY, "true");
      }
      if (mobileMoreCredits) mobileMoreCredits.style.display = "block";
    }
  }

  const CREDITS_SECTIONS = [
    { title: null, isTitleBlock: true },
    { title: "Version", lines: ["Egypt Academy v1.0"] },
    { title: "Developed By", lines: ["Egypt Academy Team"] },
    { title: "Project Description", lines: [
      "An interactive learning platform for exploring ancient Egyptian history through lessons, quizzes, and guided discovery."
    ]},
    { title: "Core Components", lines: [
      "Cosmo — an on-screen learning companion",
      "Kiwo — a built-in conversational assistant"
    ]},
    { title: "Artificial Intelligence", lines: ["Claude, by Anthropic — used in the design and development process"] },
    { title: "Technologies Used", lines: [
      "HTML5, CSS3, and JavaScript",
      "Web Speech API",
      "LocalStorage for persistence"
    ]},
    { title: "Features", lines: [
      "Interactive wallpaper lessons",
      "Timed quizzes with scoring",
      "Cosmo, a customizable companion",
      "Kiwo, an online/offline assistant",
      "Light, dark, and default themes",
      "Account recovery system"
    ]},
    { title: "Educational Content", lines: [
      "Lessons covering the Giza pyramids, the Nile, and daily life in ancient Egypt"
    ]},
    { title: "Music Credits", lines: [
      "\u201cEchoes of Possibility\u201d — free ambient music for content creators"
    ]},
    { title: "Fonts", lines: ["Cinzel", "Frank Ruhl Libre", "Inter"] },
    { title: "Icons", lines: ["Custom iconography designed for Egypt Academy"] },
    { title: "Open Source Libraries", lines: ["No third-party runtime libraries — built with vanilla JavaScript"] },
    { title: "Special Thanks", lines: [
      "Everyone who tested and gave feedback on Egypt Academy",
      "You, for completing every lesson"
    ]},
    { title: "Copyright", lines: [
      "\u00a9 " + new Date().getFullYear() + " Egypt Academy. All rights reserved."
    ]}
  ];

  function buildCreditsHtml() {
    return CREDITS_SECTIONS.map(sec => {
      if (sec.isTitleBlock) {
        return `
          <div class="credits-section credits-title-block">
            <h1>Egypt Academy</h1>
            <p>Credits</p>
          </div>
        `;
      }
      const lines = sec.lines.map(l => `<p>${l}</p>`).join("");
      return `
        <div class="credits-section">
          <h2>${sec.title}</h2>
          ${lines}
        </div>
      `;
    }).join("");
  }

  function getStudentName() {
    try {
      const acc = JSON.parse(localStorage.getItem("egyptAcademyAccount"));
      return (acc && acc.name) ? acc.name : "Student";
    } catch {
      return "Student";
    }
  }

  function formatDate() {
    const d = new Date();
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }

  function buildCertificateHtml() {
    const name = getStudentName();
    const date = formatDate();
    return `
      <div class="certificate-card" id="certificate-card">
        <div class="certificate-ankh">&#9765;</div>
        <p class="certificate-heading">Egypt Academy</p>
        <p class="certificate-label">Certificate of Completion</p>
        <div class="certificate-name">${name}</div>
        <p class="certificate-body">
          has successfully completed every lesson in Egypt Academy,
          demonstrating dedication to learning the history of ancient Egypt.
        </p>
        <div class="certificate-meta">
          <span>Completed: ${date}</span>
          <span>Egypt Academy v1.0</span>
        </div>
        <div class="certificate-actions">
          <button class="certificate-btn certificate-btn-primary" id="certificate-download-btn">Download as PNG</button>
          <button class="certificate-btn" id="certificate-print-btn">Print</button>
          <button class="certificate-btn" id="certificate-close-btn">Back to Home</button>
        </div>
      </div>
    `;
  }

  function stopMusic(fadeOutSeconds) {
    if (!audioEl) return;
    if (!fadeOutSeconds) {
      audioEl.pause();
      audioEl.currentTime = 0;
      return;
    }
    const startVolume = audioEl.volume;
    const steps = 20;
    const stepTime = (fadeOutSeconds * 1000) / steps;
    let i = 0;
    const fadeInterval = setInterval(() => {
      i++;
      audioEl.volume = Math.max(0, startVolume * (1 - i / steps));
      if (i >= steps) {
        clearInterval(fadeInterval);
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    }, stepTime);
  }

  function startScrolling(trackEl, viewportEl, onComplete) {
    const viewportHeight = viewportEl.clientHeight;
    const trackHeight = trackEl.scrollHeight;
    const totalDistance = viewportHeight + trackHeight;
    // Comfortable reading speed: roughly 40px per second.
    const durationMs = (totalDistance / 40) * 1000;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const y = viewportHeight - progress * totalDistance;
      trackEl.style.transform = `translateY(${y}px)`;
      if (progress < 1) {
        scrollAnimFrame = requestAnimationFrame(step);
      } else {
        onComplete();
      }
    }
    scrollAnimFrame = requestAnimationFrame(step);
  }

  function render(hostEl) {
    hostEl.innerHTML = `
      <div class="credits-root" id="credits-root">
        <div class="credits-scroll-viewport" id="credits-viewport">
          <div class="credits-scroll-track" id="credits-track">
            ${buildCreditsHtml()}
          </div>
        </div>
        <div class="certificate-wrap" id="certificate-wrap"></div>
        <div class="credits-fade-overlay" id="credits-fade-overlay"></div>
        <audio id="credits-audio" src="assets/audio/credits-music.m4a" preload="auto"></audio>
      </div>
    `;

    const root = document.getElementById("credits-root");
    const viewport = document.getElementById("credits-viewport");
    const track = document.getElementById("credits-track");
    const fadeOverlay = document.getElementById("credits-fade-overlay");
    const certificateWrap = document.getElementById("certificate-wrap");
    audioEl = document.getElementById("credits-audio");

    // Fade in the whole screen
    requestAnimationFrame(() => root.classList.add("credits-visible"));

    // Start music immediately, once, no loop
    audioEl.loop = false;
    audioEl.volume = 0.7;
    audioEl.play().catch(() => {
      // Autoplay may be blocked until a user gesture; music will simply
      // not play automatically in that case, everything else still works.
    });

    startScrolling(track, viewport, () => {
      // Hold the final screen briefly, then fade to black
      setTimeout(() => {
        fadeOverlay.classList.add("credits-fade-active");
        setTimeout(() => {
          // Pause briefly on black, then fade back in showing the certificate.
          // Hide the scrolling credits entirely first so none of that text
          // can show through behind/around the certificate card.
          viewport.style.display = "none";
          certificateWrap.innerHTML = buildCertificateHtml();
          setTimeout(() => {
            fadeOverlay.classList.remove("credits-fade-active");
            certificateWrap.classList.add("certificate-visible");
            wireCertificateButtons();
          }, 600);
        }, 3000);
      }, 1800);
    });
  }

  function wireCertificateButtons() {
    document.getElementById("certificate-download-btn").addEventListener("click", downloadCertificatePng);
    document.getElementById("certificate-print-btn").addEventListener("click", () => window.print());
    document.getElementById("certificate-close-btn").addEventListener("click", closeCredits);
  }

  function downloadCertificatePng() {
    const card = document.getElementById("certificate-card");
    if (!card) return;
    // Lightweight canvas-based export without external libraries: render
    // the certificate's text content onto a canvas matching its layout.
    const width = 900, height = 560;
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0d1b2a";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#f0c14b";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    ctx.strokeStyle = "rgba(240,193,75,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(34, 34, width - 68, height - 68);

    ctx.textAlign = "center";
    ctx.fillStyle = "#f0c14b";
    ctx.font = "28px Georgia";
    ctx.fillText("Egypt Academy", width / 2, 110);

    ctx.font = "16px Georgia";
    ctx.fillStyle = "#cdd9e0";
    ctx.fillText("CERTIFICATE OF COMPLETION", width / 2, 150);

    ctx.font = "italic 40px Georgia";
    ctx.fillStyle = "#f7f1e1";
    ctx.fillText(getStudentName(), width / 2, 240);

    ctx.font = "16px Georgia";
    ctx.fillStyle = "#cdd9e0";
    wrapText(ctx,
      "has successfully completed every lesson in Egypt Academy, demonstrating",
      width / 2, 300, width - 160, 24);
    ctx.fillText("dedication to learning the history of ancient Egypt.", width / 2, 348);

    ctx.font = "13px Georgia";
    ctx.fillStyle = "#a8a8a8";
    ctx.fillText(`Completed: ${formatDate()}`, width / 2 - 150, 460);
    ctx.fillText("Egypt Academy v1.0", width / 2 + 150, 460);

    const link = document.createElement("a");
    link.download = "egypt-academy-certificate.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    ctx.fillText(text, x, y);
  }

  function closeCredits() {
    const root = document.getElementById("credits-root");
    const certificateWrap = document.getElementById("certificate-wrap");
    if (certificateWrap) certificateWrap.classList.remove("certificate-visible");
    stopMusic(1);
    if (root) root.classList.remove("credits-visible");
    if (scrollAnimFrame) cancelAnimationFrame(scrollAnimFrame);
    setTimeout(() => {
      if (window.EgyptAcademy) window.EgyptAcademy.openScene; // no-op guard
      const dashBtn = document.querySelector('.nav-links button[data-view="view-dashboard"]');
      if (dashBtn) dashBtn.click();
    }, 850);
  }

  function teardown() {
    stopMusic(0);
    if (scrollAnimFrame) cancelAnimationFrame(scrollAnimFrame);
  }

  return { checkUnlock, render, teardown };
})();

window.Credits = Credits;
