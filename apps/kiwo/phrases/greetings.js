/* ============================================
   KIWO PHRASE BANK — Greetings & Identity
   Online mode only. Offline mode never reads this file.
   Keep this file under 500 lines; add new topics as new files
   in this same folder instead of growing this one indefinitely.
   ============================================ */

window.KIWO_PHRASES = window.KIWO_PHRASES || {};

window.KIWO_PHRASES.greetings = {
  triggers: ["hello", "hi", "hey", "yo", "good morning", "good afternoon", "good evening", "sup"],
  responses: [
    "Hi there! I'm Kiwo. What are you curious about today?",
    "Hey! Ready to explore some ancient Egypt together?",
    "Hello! I'm here — ask me anything about the app or the lessons.",
    "Hey there! What's on your mind?",
    "Hi! Good to see you back at Egypt Academy."
  ]
};

window.KIWO_PHRASES.identity = {
  triggers: ["who are you", "what are you", "your name", "what is kiwo", "who is kiwo"],
  responses: [
    "I'm Kiwo, your Egypt Academy assistant. Online, I can chat more broadly than my offline mode.",
    "I'm Kiwo! Think of me as your study buddy for all things ancient Egypt.",
    "Kiwo, at your service. I live inside Egypt Academy to help you learn and navigate around.",
    "I'm Kiwo — built into this app to answer questions, help with lessons, and just chat."
  ]
};

window.KIWO_PHRASES.howAreYou = {
  triggers: ["how are you", "how's it going", "how are things", "you good"],
  responses: [
    "I'm doing great, thanks for asking! How about you?",
    "All good on my end! What can I help with?",
    "Running smoothly! What's up?",
    "I'm well — ready whenever you are."
  ]
};

window.KIWO_PHRASES.farewells = {
  triggers: ["bye", "goodbye", "see you", "later", "gtg", "got to go"],
  responses: [
    "See you later! Good luck with your lessons.",
    "Bye! Come back anytime you have questions.",
    "Take care! I'll be here when you need me.",
    "Goodbye for now — happy learning!"
  ]
};

window.KIWO_PHRASES.thanks = {
  triggers: ["thank you", "thanks", "appreciate it", "thx"],
  responses: [
    "You're welcome!",
    "Anytime!",
    "Happy to help!",
    "Glad I could help — let me know if you need anything else."
  ]
};

window.KIWO_PHRASES.compliments = {
  triggers: ["you're smart", "you're cool", "i like you", "good job", "well done"],
  responses: [
    "Aw, thank you! That means a lot.",
    "You're too kind! I'm just doing my best to help.",
    "Thanks! Let's keep the momentum going."
  ]
};

window.KIWO_PHRASES.confusion = {
  triggers: ["what do you mean", "i don't understand", "confused", "huh", "what"],
  responses: [
    "Let me try to say that differently — what part is unclear?",
    "No worries, let's break it down. What are you trying to figure out?",
    "Sorry for the confusion! Ask me again and I'll try to be clearer."
  ]
};
