(function () {
  const QUESTIONS = [
    { q: "What famous statue sits beside Khafre's pyramid?", options: ["Colossi of Memnon", "The Great Sphinx", "Statue of Ramesses"], correct: 1 },
    { q: "Whose son was Khafre?", options: ["Khufu", "Menkaure", "Tutankhamun"], correct: 0 },
    { q: "Why does Khafre's pyramid look taller than Khufu's?", options: ["It's built on higher ground", "It's actually bigger", "It has a taller capstone"], correct: 0 },
    { q: "About when was Khafre's pyramid completed?", options: ["2532 BCE", "1000 BCE", "3000 BCE"], correct: 0 },
    { q: "What creature is the Sphinx's body modeled after?", options: ["A lion", "A crocodile", "A falcon"], correct: 0 }
  ];
  const PROGRESS_ID = "quiz-pyramid-khafre";

  const progressEl = document.getElementById("quiz-progress");
  const bodyEl = document.getElementById("quiz-body");
  const nextBtn = document.getElementById("quiz-next-btn");
  let current = 0;
  let score = 0;

  function renderQuestion() {
    if (window.Cosmo) window.Cosmo.stopWatchingQuiz();
    const item = QUESTIONS[current];
    progressEl.textContent = `Question ${current + 1} of ${QUESTIONS.length}`;
    nextBtn.style.display = "none";
    bodyEl.innerHTML = `
      <p class="quiz-question">${item.q}</p>
      <div class="quiz-options">
        ${item.options.map((opt, i) => `<button class="quiz-btn" data-correct="${i === item.correct}">${opt}</button>`).join("")}
      </div>
      <p class="quiz-feedback" id="quiz-feedback"></p>
    `;
    const buttons = bodyEl.querySelectorAll(".quiz-btn");
    const feedback = document.getElementById("quiz-feedback");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const correct = btn.dataset.correct === "true";
        buttons.forEach(b => { b.classList.remove("correct", "wrong"); b.disabled = true; });
        btn.classList.add(correct ? "correct" : "wrong");
        if (correct) score++;
        feedback.textContent = correct ? "Correct!" : "Not quite.";
        if (window.Cosmo) window.Cosmo.reactTo(correct ? "quizCorrect" : "quizWrong");
        if (window.Cosmo) window.Cosmo.stopWatchingQuiz();
        nextBtn.style.display = "inline-block";
        nextBtn.textContent = current === QUESTIONS.length - 1 ? "See results" : "Next question";
      });
    });
    if (window.Cosmo) window.Cosmo.watchQuiz(bodyEl);
  }

  function renderResults() {
    if (window.Cosmo) window.Cosmo.stopWatchingQuiz();
    progressEl.textContent = "";
    nextBtn.style.display = "none";
    bodyEl.innerHTML = `<p class="quiz-score">You scored ${score} / ${QUESTIONS.length}</p>`;
    if (score === QUESTIONS.length && window.markLessonComplete) {
      window.markLessonComplete(PROGRESS_ID);
    }
  }

  nextBtn.addEventListener("click", () => {
    current++;
    if (current >= QUESTIONS.length) renderResults();
    else renderQuestion();
  });

  renderQuestion();

  window.currentAppTeardown = function () {
    if (window.Cosmo) window.Cosmo.stopWatchingQuiz();
  };
})();
