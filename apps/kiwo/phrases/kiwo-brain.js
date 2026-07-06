/* ============================================
   KIWO BRAIN — response picker for ONLINE mode only.
   Reads window.KIWO_PHRASES (populated by apps/kiwo/phrases/*.js).
   Offline mode does NOT use this file.

   Matching approach: word-boundary regex per trigger (not naive
   substring .includes()), then picks the entry whose matched trigger
   is the LONGEST (most specific) match — so "how old are the
   pyramids" matches "pyramids" specifically rather than accidentally
   tripping a short unrelated trigger like "ra" inside another word.
   ============================================ */

const KiwoBrain = (() => {
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function getProgressSummary() {
    try {
      const progress = JSON.parse(localStorage.getItem("egyptAcademyProgress")) || {};
      const data = window.EGYPT_ACADEMY_DATA || {};
      const lessonIds = data.allLessonIds || [];
      const quizzes = data.quizzes || [];
      const doneLessons = lessonIds.filter(id => progress[id]).length;
      const doneQuizzes = quizzes.filter(q => progress[q.id]).length;
      return `You've completed ${doneLessons}/${lessonIds.length} lessons and ${doneQuizzes}/${quizzes.length} quizzes.`;
    } catch {
      return "I couldn't read your progress right now.";
    }
  }

  // Finds the BEST match across all phrase banks: whole-word/phrase
  // matches only (no accidental substring hits), preferring the
  // longest trigger phrase when multiple match.
  function findMatch(text) {
    const banks = window.KIWO_PHRASES || {};
    const t = " " + text.toLowerCase().replace(/[^a-z0-9\s']/g, " ") + " ";
    let best = null;
    let bestLength = 0;

    for (const key in banks) {
      const entry = banks[key];
      if (!entry.triggers) continue;
      for (const trigger of entry.triggers) {
        const pattern = new RegExp("\\b" + escapeRegex(trigger.toLowerCase()) + "\\b");
        if (pattern.test(t) && trigger.length > bestLength) {
          best = { key, entry };
          bestLength = trigger.length;
        }
      }
    }
    return best;
  }

  function onlineRespond(text) {
    const match = findMatch(text);
    if (match) {
      if (match.key === "progress") {
        return pickRandom(match.entry.responses) + " " + getProgressSummary();
      }
      return pickRandom(match.entry.responses);
    }
    const fallbackBank = (window.KIWO_PHRASES || {}).fallback;
    if (fallbackBank) return pickRandom(fallbackBank.responses);
    return "I'm listening — ask me about ancient Egypt or the app!";
  }

  function respond(text, online, offlineFn) {
    if (online) return onlineRespond(text);
    if (typeof offlineFn === "function") return offlineFn(text);
    return "I'm offline right now and can only help with the basics.";
  }

  return { respond, onlineRespond, getProgressSummary };
})();

window.KiwoBrain = KiwoBrain;
