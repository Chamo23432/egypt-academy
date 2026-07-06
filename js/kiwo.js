/* ============================================
   KIWO — launcher button gesture handling + voice overlay
   Tap = open Kiwo app. Hold + swipe down = voice overlay.
   ============================================ */

const Kiwo = (() => {
  let overlayEl, backdropEl, panelEl, orbEl, stateEl, transcriptEl, modePillEl;
  let recognition = null;
  let recognitionActive = false;

  function isOnline() {
    return navigator.onLine;
  }

  function modeLabel() {
    return isOnline() ? "Online" : "Offline";
  }

  /* ---------- Voice overlay open/close ---------- */
  function openVoiceOverlay() {
    overlayEl.style.display = "block";
    requestAnimationFrame(() => overlayEl.classList.add("kiwo-visible"));
    modePillEl.textContent = modeLabel();
    modePillEl.className = "kiwo-voice-mode-pill " + (isOnline() ? "kiwo-online" : "kiwo-offline");
    setState("listening", "Listening…");
    transcriptEl.textContent = "";
    primeVoices();
    startRecognition();
  }

  function closeVoiceOverlay() {
    overlayEl.classList.remove("kiwo-visible");
    stopRecognition();
    setTimeout(() => { overlayEl.style.display = "none"; }, 400);
  }

  function setState(kind, label) {
    orbEl.className = "kiwo-voice-orb kiwo-" + kind;
    stateEl.textContent = label;
  }

  /* ---------- Speech recognition (best-effort; requires browser support + mic) ---------- */
  function isSecureContextForMic() {
    // SpeechRecognition is blocked by browsers on plain http:// origins
    // except localhost/127.0.0.1. If the app is served from a LAN IP over
    // http://, the mic silently never starts — this catches that case so we
    // can tell the user instead of failing silently.
    if (window.isSecureContext) return true;
    const host = location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "";
  }

  function startRecognition() {
    if (!isSecureContextForMic()) {
      transcriptEl.textContent = "Microphone access needs https:// or localhost. Open this app via http://localhost instead of a network IP.";
      setState("thinking", "Mic unavailable");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      transcriptEl.textContent = "Voice input isn't supported in this browser.";
      setState("thinking", "Unavailable");
      return;
    }
    try {
      recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (e) => {
        let finalText = "";
        let interimText = "";
        for (let i = 0; i < e.results.length; i++) {
          const chunk = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalText += chunk;
          else interimText += chunk;
        }
        transcriptEl.textContent = (finalText + " " + interimText).trim();
        if (finalText.trim()) {
          respondToSpeech(finalText.trim());
        }
      };
      recognition.onspeechstart = () => setState("listening", "Listening…");
      recognition.onerror = (e) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          transcriptEl.textContent = "Microphone permission was denied. Allow mic access for this site and try again.";
        } else if (e.error === "no-speech") {
          transcriptEl.textContent = "Didn't catch that — try again.";
        } else {
          transcriptEl.textContent = "Mic error: " + e.error;
        }
        setState("listening", "Listening…");
      };
      recognition.onend = () => {
        // Some browsers stop recognition after a pause; restart automatically
        // while the overlay is still open so it keeps listening continuously.
        if (recognitionActive && overlayEl.classList.contains("kiwo-visible")) {
          try { recognition.start(); } catch (err) {}
        }
      };
      recognition.start();
      recognitionActive = true;
    } catch (err) {
      transcriptEl.textContent = "Voice input isn't available right now.";
    }
  }

  function voiceOfflineRespond(text) {
    const t = text.toLowerCase();
    if (t.includes("progress")) {
      return window.KiwoBrain ? window.KiwoBrain.getProgressSummary() : "I can't check your progress right now.";
    }
    if (t.includes("pyramid")) {
      return "The Giza pyramids were built for Khufu, Khafre, and Menkaure around 2560 to 2510 BCE.";
    }
    if (t.includes("nile")) {
      return "The Nile flows north into the Mediterranean Sea and its floods gave Egypt its rich black farmland.";
    }
    if (t.includes("cosmo")) {
      return "Cosmo is your desktop buddy! Turn him on and pick his theme from the Cosmo app.";
    }
    if (t.includes("hello") || t.includes("hi") || t.includes("hey")) {
      return "Hey! I'm offline right now. Ask me about your progress, the pyramids, the Nile, or Cosmo.";
    }
    return "I'm offline right now, so voice replies are limited. Ask about your progress, the pyramids, the Nile, or Cosmo.";
  }

  let voicesReady = false;
  let cachedVoices = [];

  function primeVoices() {
    if (!("speechSynthesis" in window)) return;
    cachedVoices = window.speechSynthesis.getVoices();
    if (cachedVoices.length) voicesReady = true;
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      voicesReady = cachedVoices.length > 0;
    };
  }

  function speak(text, onDone) {
    if (!("speechSynthesis" in window)) { onDone && onDone(); return; }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.0;
      utter.pitch = 1.05;
      if (cachedVoices.length) {
        const englishVoice = cachedVoices.find(v => v.lang && v.lang.startsWith("en"));
        if (englishVoice) utter.voice = englishVoice;
      }
      let finished = false;
      const finish = () => { if (!finished) { finished = true; onDone && onDone(); } };
      utter.onend = finish;
      utter.onerror = finish;
      // Chrome sometimes silently pauses the synthesis queue; nudging
      // resume() right after speak() works around that known quirk.
      window.speechSynthesis.speak(utter);
      window.speechSynthesis.resume();
      // Safety net: if neither onend nor onerror fires within a generous
      // window (can happen if the browser drops the utterance silently),
      // move on anyway so the overlay doesn't get stuck.
      const maxWaitMs = Math.max(2500, text.length * 90);
      setTimeout(finish, maxWaitMs);
    } catch (err) {
      onDone && onDone();
    }
  }

  function respondToSpeech(text) {
    // Pause listening while Kiwo thinks/speaks so he doesn't hear himself.
    recognitionActive = false;
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
    }
    setState("thinking", "Thinking…");
    setTimeout(() => {
      setState("speaking", "Responding…");
      const online = isOnline();
      const reply = window.KiwoBrain
        ? window.KiwoBrain.respond(text, online, voiceOfflineRespond)
        : "I heard you, but I don't have a response ready.";
      transcriptEl.textContent = reply;
      speak(reply, () => {
        if (overlayEl.classList.contains("kiwo-visible")) {
          setState("listening", "Listening…");
          transcriptEl.textContent = "";
          try { recognition && recognition.start(); recognitionActive = true; } catch (e) {}
        }
      });
    }, 500);
  }

  function stopRecognition() {
    recognitionActive = false;
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
    }
  }

  /* ---------- Gesture handling on the launcher button (Pointer Events only) ---------- */
  function attachGestures(btn, onTap) {
    let holdTimer = null;
    let startY = null;
    let startX = null;
    let holding = false;
    let swipeTriggered = false;
    let activePointerId = null;
    const HOLD_MS = 350;
    const SWIPE_THRESHOLD = 40;

    // Belt-and-suspenders: never allow native drag/selection on this button.
    btn.setAttribute("draggable", "false");
    btn.addEventListener("dragstart", (e) => e.preventDefault());
    btn.addEventListener("selectstart", (e) => e.preventDefault());
    const img = btn.querySelector("img");
    if (img) {
      img.setAttribute("draggable", "false");
      img.addEventListener("dragstart", (e) => e.preventDefault());
    }

    function reset() {
      clearTimeout(holdTimer);
      holding = false;
      swipeTriggered = false;
      startY = null;
      startX = null;
      activePointerId = null;
      btn.classList.remove("kiwo-holding");
    }

    function onPointerDown(e) {
      e.preventDefault();
      activePointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      holdTimer = setTimeout(() => {
        holding = true;
        btn.classList.add("kiwo-holding");
      }, HOLD_MS);
    }

    function onPointerMove(e) {
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      if (!holding || swipeTriggered || startY === null) return;
      e.preventDefault();
      const dy = e.clientY - startY;
      const dx = Math.abs(e.clientX - startX);
      if (dy > SWIPE_THRESHOLD && dx < 60) {
        swipeTriggered = true;
        openVoiceOverlay();
        reset();
      }
    }

    function onPointerUp(e) {
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      e.preventDefault();
      const wasHolding = holding;
      const wasSwipe = swipeTriggered;
      clearTimeout(holdTimer);
      btn.classList.remove("kiwo-holding");
      try { btn.releasePointerCapture(e.pointerId); } catch (err) {}
      if (!wasHolding && !wasSwipe) {
        onTap();
      }
      holding = false;
      swipeTriggered = false;
      startY = null;
      startX = null;
      activePointerId = null;
    }

    function onPointerCancel() {
      reset();
    }

    btn.addEventListener("pointerdown", onPointerDown);
    btn.addEventListener("pointermove", onPointerMove);
    btn.addEventListener("pointerup", onPointerUp);
    btn.addEventListener("pointercancel", onPointerCancel);
    btn.addEventListener("pointerleave", (e) => {
      // Only cancel on leave if we're not actively holding (avoids breaking
      // the swipe gesture when the pointer briefly crosses the button edge).
      if (!holding) reset();
    });
  }

  function init(launcherBtnIds, onTap) {
    overlayEl = document.getElementById("kiwo-voice-overlay");
    backdropEl = document.getElementById("kiwo-voice-backdrop");
    panelEl = document.getElementById("kiwo-voice-panel");
    orbEl = document.getElementById("kiwo-voice-orb");
    stateEl = document.getElementById("kiwo-voice-state");
    transcriptEl = document.getElementById("kiwo-voice-transcript");
    modePillEl = document.getElementById("kiwo-voice-mode-pill");

    const ids = Array.isArray(launcherBtnIds) ? launcherBtnIds : [launcherBtnIds];
    ids.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) attachGestures(btn, onTap);
    });

    backdropEl.addEventListener("click", closeVoiceOverlay);

    // Swipe back up on the panel to dismiss
    let dragStartY = null;
    panelEl.addEventListener("touchstart", (e) => { dragStartY = e.touches[0].clientY; }, { passive: true });
    panelEl.addEventListener("touchmove", (e) => {
      if (dragStartY === null) return;
      const dy = e.touches[0].clientY - dragStartY;
      if (dy < -30) { closeVoiceOverlay(); dragStartY = null; }
    }, { passive: true });
  }

  return { init, isOnline, modeLabel, closeVoiceOverlay };
})();

window.Kiwo = Kiwo;
