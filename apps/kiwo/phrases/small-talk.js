/* ============================================
   KIWO PHRASE BANK — Small Talk & Encouragement
   Online mode only.
   ============================================ */

window.KIWO_PHRASES = window.KIWO_PHRASES || {};

window.KIWO_PHRASES.encouragement = {
  triggers: ["i'm stuck", "this is hard", "i don't get it", "i'm confused", "help me"],
  responses: [
    "You've got this! Try breaking the question into smaller parts.",
    "It's okay to find this tricky — that's how learning works. Want me to explain a fact again?",
    "Take your time. Ask me about a specific topic and I'll do my best to explain it clearly.",
    "No worries — everyone gets stuck sometimes. What part is giving you trouble?"
  ]
};

window.KIWO_PHRASES.boredom = {
  triggers: ["i'm bored", "this is boring", "nothing to do"],
  responses: [
    "Why not try a quiz you haven't done yet? Or explore a wallpaper scene you haven't clicked through fully.",
    "Have you tried customizing Cosmo yet? His themes are pretty fun.",
    "Maybe try the Nile wallpaper if you've mostly been exploring the pyramids, or vice versa!"
  ]
};

window.KIWO_PHRASES.excitement = {
  triggers: ["this is cool", "awesome", "amazing", "i love this", "so cool"],
  responses: [
    "Right?! Ancient Egypt has so many interesting details.",
    "Glad you're enjoying it! There's plenty more to explore.",
    "I love that energy! Keep going."
  ]
};

window.KIWO_PHRASES.jokes = {
  triggers: ["tell me a joke", "make me laugh", "say something funny"],
  responses: [
    "Why did the mummy have trouble making friends? He was too wrapped up in himself.",
    "What do you call a pharaoh who's afraid of snakes? A cobra-phobic king.",
    "Why don't pharaohs ever get lost? They always follow the Nile."
  ]
};

window.KIWO_PHRASES.favoriteThings = {
  triggers: ["what's your favorite", "do you like", "favorite pyramid", "favorite god"],
  responses: [
    "I find the Great Pyramid fascinating — the engineering is incredible for its time.",
    "Honestly, the blue lotus's daily cycle is one of my favorite little facts.",
    "Hard to pick a favorite god, but Thoth's link to writing feels fitting for me!"
  ]
};

window.KIWO_PHRASES.weather = {
  triggers: ["weather", "is it hot", "what's it like outside"],
  responses: [
    "I don't have a window to check, but ancient Egypt was famously hot and dry — perfect for preserving mummies!",
    "I can't check real weather, but I can tell you the desert around Giza gets scorching during the day and cold at night."
  ]
};

window.KIWO_PHRASES.time = {
  triggers: ["what time is it", "what day is it", "what's today's date"],
  responses: [
    "I don't have access to the real time or date, sorry! Check your device's clock for that.",
  ]
};

window.KIWO_PHRASES.fallback = {
  // Used when nothing else matches in online mode.
  responses: [
    "That's an interesting question! I might not have a specific answer, but feel free to ask about the pyramids, the Nile, or your progress.",
    "I'm not totally sure about that one, but I'm happy to chat about ancient Egypt or help you navigate the app.",
    "Good question — I don't have a canned answer for that, but try asking about a lesson topic and I'll do my best.",
    "Hmm, that's outside what I know right now. Want to ask about Egypt Academy or ancient Egypt instead?"
  ]
};
