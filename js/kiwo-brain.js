/* ============================================
   KiwoBrain — lightweight offline keyword-based responder used by
   Chameleo's text chat (tap C) and voice mode (hold C).
   Rebuilt after the original phrases/kiwo-brain.js was accidentally
   deleted along with the rest of the standalone Kiwo app folder.
   ============================================ */

const KiwoBrain = (() => {
  const STORAGE_KEY = "egyptAcademyProgress";

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function getProgressSummary() {
    const progress = getProgress();
    const data = window.EGYPT_ACADEMY_DATA || {};
    const lessonIds = data.allLessonIds || [];
    const quizIds = (data.quizzes || []).map((q) => q.id);
    const allIds = [...lessonIds, ...quizIds];

    if (allIds.length === 0) {
      return "I can't find your progress right now.";
    }

    const doneCount = allIds.filter((id) => progress[id]).length;
    if (doneCount === 0) {
      return "You haven't completed anything yet — let's get started!";
    }
    if (doneCount === allIds.length) {
      return "You've completed everything! Amazing work.";
    }
    return `You've completed ${doneCount} out of ${allIds.length} lessons and quizzes. Keep going!`;
  }

  function keywordRespond(text) {
    const t = text.toLowerCase();

    if (t.includes("progress") || t.includes("how am i doing") || t.includes("score")) {
      return getProgressSummary();
    }
    if (t.includes("pyramid")) {
      return "The Giza pyramids were built for Khufu, Khafre, and Menkaure around 2560 to 2510 BCE.";
    }
    if (t.includes("nile")) {
      return "The Nile flows north into the Mediterranean Sea, and its yearly floods gave Egypt its rich black farmland.";
    }
    if (t.includes("crocodile")) {
      return "Crocodiles lived along the Nile and were even worshipped as the god Sobek in some regions!";
    }
    if (t.includes("lotus")) {
      return "The lotus flower symbolized rebirth in ancient Egypt — it closes at night and reopens at dawn.";
    }
    if (t.includes("hieroglyph")) {
      return "Hieroglyphs are the ancient Egyptian writing system — a mix of pictures representing sounds and ideas.";
    }
    if (t.includes("pharaoh") || t.includes("king") || t.includes("queen")) {
      return "Pharaohs were considered god-kings, responsible for keeping order (ma'at) across the land.";
    }
    if (t.includes("chameleo") || t.includes("who are you")) {
      return "I'm Chameleo, your desktop buddy! You can enable me and customize how I look in the Chameleo app.";
    }
    if (t.includes("thank")) {
      return "You're welcome! Let me know if you want to know more about ancient Egypt.";
    }
    if (t.includes("hello") || t.includes("hi") || t.includes("hey")) {
      return "Hey! Ask me about your progress, the pyramids, the Nile, or anything else about ancient Egypt.";
    }
    return null; // no keyword match — caller decides the fallback
  }

  // respond(text, online, offlineFallbackFn):
  // Kept the (text, online, offlineFallbackFn) signature from before so
  // existing call sites don't need to change. Currently everything is
  // answered offline via keyword matching; `online` is accepted for
  // future use if a real API-backed mode gets added later.
  function respond(text, online, offlineFallbackFn) {
    const match = keywordRespond(text);
    if (match) return match;
    if (typeof offlineFallbackFn === "function") {
      const fallback = offlineFallbackFn(text);
      if (fallback) return fallback;
    }
    return "I'm not sure about that, but ask me about your progress, the pyramids, or the Nile!";
  }

  function onlineRespond(text) {
    // No real online backend wired up — same keyword logic either way.
    return respond(text, true);
  }

  return { respond, onlineRespond, getProgressSummary };
})();

window.KiwoBrain = KiwoBrain;
