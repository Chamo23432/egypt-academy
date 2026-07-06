/* ============================================
   KIWO PHRASE BANK — Online Mode (Part 2 of 2)
   ONLINE MODE ONLY. Curated to a fixed, known set of questions.
   ============================================ */

window.KIWO_PHRASES = window.KIWO_PHRASES || {};

// 9. "what is my progress" / "how am i doing"
window.KIWO_PHRASES.progress = {
  triggers: ["progress", "how am i doing"],
  responses: [
    "Let me check your progress for you."
  ]
};

// 10. "tell me about cosmo"
window.KIWO_PHRASES.cosmo = {
  triggers: ["tell me about cosmo", "who is cosmo"],
  responses: [
    "Cosmo is your desktop buddy! Turn him on and pick his theme from the Cosmo app — five personalities to choose from."
  ]
};

// 11. "how do quizzes work"
window.KIWO_PHRASES.quizzes = {
  triggers: ["how do quizzes work", "tell me about the quizzes"],
  responses: [
    "Each quiz has 5 questions. Get them all right and it's marked complete on your dashboard."
  ]
};

// 12. "how do i use voice mode"
window.KIWO_PHRASES.voiceHelp = {
  triggers: ["how do i use voice", "voice mode"],
  responses: [
    "Hold down my icon and swipe down to open voice mode — I'll start listening right away."
  ]
};

// 13. "what's the difference between online and offline"
window.KIWO_PHRASES.onlineOffline = {
  triggers: ["online mode", "offline mode"],
  responses: [
    "Online mode gives you broader conversation. Offline mode sticks to a handful of basics when there's no internet."
  ]
};

// 14. "tell me a joke"
window.KIWO_PHRASES.jokes = {
  triggers: ["tell me a joke", "make me laugh"],
  responses: [
    "Why did the mummy have trouble making friends? He was too wrapped up in himself."
  ]
};

// 15. fallback for anything else in online mode
window.KIWO_PHRASES.fallback = {
  responses: [
    "That's outside what I can answer right now — try asking about the pyramids, the Nile, Cosmo, or your progress."
  ]
};
