/* ============================================
   KIWO PHRASE BANK — App Help & Navigation
   Online mode only.
   ============================================ */

window.KIWO_PHRASES = window.KIWO_PHRASES || {};

window.KIWO_PHRASES.progress = {
  triggers: ["progress", "how am i doing", "my score", "completed"],
  responses: [
    "Let me check your progress for you.",
    "Here's where you stand right now.",
    "Pulling up your stats."
  ]
};

window.KIWO_PHRASES.cosmo = {
  triggers: ["cosmo"],
  responses: [
    "Cosmo is your desktop buddy! You can turn him on and pick his theme from the Cosmo app in the nav bar.",
    "Cosmo has five personalities — Classic (happy), Sunset (silly), Nile (sad), Crimson (angry), and Moonlight (chill).",
    "If Cosmo isn't showing up, check that he's enabled in the Cosmo app — he's off by default."
  ]
};

window.KIWO_PHRASES.quizzes = {
  triggers: ["quiz", "quizzes", "test"],
  responses: [
    "You can find all six quizzes under the Quizzes tab — each one has 5 questions.",
    "Quizzes are a great way to check what you remember from a lesson.",
    "Getting all 5 questions right marks a quiz complete on your dashboard."
  ]
};

window.KIWO_PHRASES.lessons = {
  triggers: ["lesson", "lessons", "where do i learn"],
  responses: [
    "Lessons live inside the two interactive wallpapers — click a pyramid or something near the Nile to open one.",
    "Try the Dashboard and click on one of the wallpaper scenes to start exploring lessons.",
    "Each lesson is short, followed by its own quiz if you want to test yourself."
  ]
};

window.KIWO_PHRASES.settings = {
  triggers: ["settings", "theme", "dark mode", "light mode"],
  responses: [
    "You can change the theme — Default, Dark, or Light — from the Settings app.",
    "Settings also lets you reset your progress or delete your account.",
    "Looking for hotspot label options or reduced motion? Those are in Settings too."
  ]
};

window.KIWO_PHRASES.profile = {
  triggers: ["profile", "change my name", "change password", "my account"],
  responses: [
    "You can update your name or password anytime from the Profile app.",
    "Forgot your password? Use the recovery code you saved when you first set one, through the Alpaca Recovery Suite.",
    "Your profile settings are all self-serve — no need to ask me for that!"
  ]
};

window.KIWO_PHRASES.fileUpload = {
  triggers: ["upload a file", "attach a file", "send a file", "how do i upload"],
  responses: [
    "Click the paperclip icon next to the chat box to attach a file.",
    "You can upload a file with the paperclip button — I'll note it in our conversation.",
    "File uploads work right from the chat input row."
  ]
};

window.KIWO_PHRASES.voiceHelp = {
  triggers: ["how does voice work", "how do i use voice", "voice mode", "talk to you"],
  responses: [
    "Hold down my icon and swipe down to open voice mode — I'll start listening right away.",
    "In voice mode, just talk normally. You'll see live captions of what I'm hearing.",
    "To close voice mode, swipe the panel back up or tap outside it."
  ]
};

window.KIWO_PHRASES.onlineOffline = {
  triggers: ["online mode", "offline mode", "what's the difference", "why are you offline"],
  responses: [
    "Online mode gives you broader conversation. Offline mode sticks to the basics when there's no internet.",
    "I automatically switch between online and offline based on your connection, no need to do anything.",
    "You'll see a little 'Online' or 'Offline' label in my chat header so you always know which mode I'm in."
  ]
};

window.KIWO_PHRASES.devtools = {
  triggers: ["dev tools", "developer mode", "secret"],
  responses: [
    "I can't help you unlock hidden features — that wouldn't be much of a secret then, would it?",
    "Some things are more fun to discover yourself!"
  ]
};
