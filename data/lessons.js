/* ============================================
   LESSON REGISTRY
   Central place to define wallpapers + hotspots.
   Add new hotspots here without touching app.js logic.
   Each hotspot maps to an "appId" that must match
   a folder name in /apps/ (apps/<appId>/index.html etc)
   ============================================ */

window.EGYPT_ACADEMY_DATA = {
  wallpapers: {
    pyramids: {
      id: "pyramids",
      title: "The Giza Plateau",
      image: "assets/wallpapers/pyramids.jpg",
      hotspots: [
        {
          id: "khufu",
          label: "Great Pyramid of Khufu",
          x: 46, y: 44,
          appId: "pyramid-khufu"
        },
        {
          id: "khafre",
          label: "Pyramid of Khafre",
          x: 27, y: 56,
          appId: "pyramid-khafre"
        },
        {
          id: "menkaure",
          label: "Pyramid of Menkaure",
          x: 76, y: 56,
          appId: "pyramid-menkaure"
        }
      ]
    },
    nile: {
      id: "nile",
      title: "The Nile River",
      image: "assets/wallpapers/nile.jpg",
      hotspots: [
        {
          id: "river",
          label: "The Nile's Flow",
          x: 50, y: 32,
          appId: "nile-river"
        },
        {
          id: "lotus",
          label: "Blue Lotus Flower",
          x: 68, y: 78,
          appId: "nile-lotus"
        },
        {
          id: "crocodile",
          label: "Nile Crocodile",
          x: 20, y: 88,
          appId: "nile-crocodile"
        }
      ]
    }
  },

  // Track which lessons the user has opened (persisted in localStorage)
  allLessonIds: [
    "pyramid-khufu", "pyramid-khafre", "pyramid-menkaure",
    "nile-river", "nile-lotus", "nile-crocodile"
  ],

  quizzes: [
    { id: "quiz-pyramid-khufu", label: "Khufu Quiz", appId: "quiz-khufu" },
    { id: "quiz-pyramid-khafre", label: "Khafre Quiz", appId: "quiz-khafre" },
    { id: "quiz-pyramid-menkaure", label: "Menkaure Quiz", appId: "quiz-menkaure" },
    { id: "quiz-nile-river", label: "Nile River Quiz", appId: "quiz-river" },
    { id: "quiz-nile-lotus", label: "Blue Lotus Quiz", appId: "quiz-lotus" },
    { id: "quiz-nile-crocodile", label: "Crocodile Quiz", appId: "quiz-crocodile" }
  ],

  // Flat search index used by the top search bar.
  // type: "view" opens a nav view directly; "scene" opens a wallpaper scene;
  // "lesson" and "quiz" open that app in the fullscreen lesson host.
  searchIndex: [
    { label: "Dashboard", type: "view", target: "view-dashboard" },
    { label: "Quizzes", type: "view", target: "view-quizzes" },
    { label: "Cosmo", type: "view", target: "view-cosmo" },
    { label: "Profile", type: "view", target: "view-settings" },
    { label: "Settings", type: "view", target: "view-settings" },
    { label: "Kiwo", type: "view", target: "view-kiwo" },
    { label: "Giza Plateau (pyramids)", type: "scene", target: "pyramids" },
    { label: "The Nile River (scene)", type: "scene", target: "nile" },
    { label: "Great Pyramid of Khufu", type: "lesson", target: "pyramid-khufu" },
    { label: "Pyramid of Khafre", type: "lesson", target: "pyramid-khafre" },
    { label: "Pyramid of Menkaure", type: "lesson", target: "pyramid-menkaure" },
    { label: "The Nile's Flow", type: "lesson", target: "nile-river" },
    { label: "Blue Lotus Flower", type: "lesson", target: "nile-lotus" },
    { label: "Nile Crocodile", type: "lesson", target: "nile-crocodile" },
    { label: "Khufu Quiz", type: "quiz", target: "quiz-khufu" },
    { label: "Khafre Quiz", type: "quiz", target: "quiz-khafre" },
    { label: "Menkaure Quiz", type: "quiz", target: "quiz-menkaure" },
    { label: "Nile River Quiz", type: "quiz", target: "quiz-river" },
    { label: "Blue Lotus Quiz", type: "quiz", target: "quiz-lotus" },
    { label: "Nile Crocodile Quiz", type: "quiz", target: "quiz-crocodile" }
  ]
};
