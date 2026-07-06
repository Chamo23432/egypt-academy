/* ============================================
   KIWO PHRASE BANK — Online Mode (Part 1 of 2)
   ONLINE MODE ONLY. Curated to a fixed, known set of questions.
   ============================================ */

window.KIWO_PHRASES = window.KIWO_PHRASES || {};

// 1. "hello" / "hi"
window.KIWO_PHRASES.greetings = {
  triggers: ["hello", "hi", "hey"],
  responses: [
    "Hi there! I'm Kiwo. What are you curious about today?",
    "Hey! Ready to explore some ancient Egypt together?",
    "Hello! I'm here — ask me anything about the app or the lessons."
  ]
};

// 2. "who are you"
window.KIWO_PHRASES.identity = {
  triggers: ["who are you", "what are you"],
  responses: [
    "I'm Kiwo, your Egypt Academy assistant. Online, I can chat more broadly than my offline mode."
  ]
};

// 3. "thank you"
window.KIWO_PHRASES.thanks = {
  triggers: ["thank you", "thanks"],
  responses: [
    "You're welcome!",
    "Anytime! Let me know if you need anything else."
  ]
};

// 4. "tell me about egypt academy"
window.KIWO_PHRASES.egyptAcademy = {
  triggers: ["egypt academy", "about this app"],
  responses: [
    "Egypt Academy is your interactive learning app for ancient Egypt — lessons, quizzes, and a bit of fun with me and Cosmo along the way."
  ]
};

// 5. "tell me about the pyramids" / "how old are the pyramids"
window.KIWO_PHRASES.pyramidsGeneral = {
  triggers: ["how old are the pyramids", "tell me about the pyramids", "pyramids built"],
  responses: [
    "The Giza pyramids were built roughly 4,500 years ago, between about 2560 and 2510 BCE, for Khufu, Khafre, and Menkaure."
  ]
};

// 6. "tell me about the nile"
window.KIWO_PHRASES.nile = {
  triggers: ["tell me about the nile"],
  responses: [
    "The Nile flows north into the Mediterranean Sea. Ancient Egyptians called their land Kemet, 'the Black Land,' after the rich soil its floods left behind."
  ]
};

// 7. "tell me about the lotus"
window.KIWO_PHRASES.lotus = {
  triggers: ["tell me about the lotus", "blue lotus"],
  responses: [
    "The blue lotus opens at dawn and closes at dusk, sinking underwater each night — Egyptians linked it to rebirth and the sun god Ra."
  ]
};

// 8. "tell me about the crocodile"
window.KIWO_PHRASES.crocodile = {
  triggers: ["tell me about the crocodile", "sobek"],
  responses: [
    "The Nile crocodile was linked to the god Sobek, a symbol of strength and protection."
  ]
};
