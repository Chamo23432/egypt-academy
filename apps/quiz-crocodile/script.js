(function () {
  const QUESTIONS = [
    { q: "Which god was linked to the crocodile?", options: ["Anubis", "Horus", "Sobek"], correct: 2 },
    { q: "What did Sobek represent to ancient Egyptians?", options: ["Weakness", "Strength and protection", "Betrayal"], correct: 1 },
    { q: "What did Egyptians sometimes do with crocodiles as offerings?", options: ["Release them into the Nile", "Mummify them", "Paint them gold"], correct: 1 },
    { q: "About how long can a Nile crocodile live?", options: ["10 years", "70 years", "200 years"], correct: 1 },
    { q: "About how long can a Nile crocodile grow?", options: ["2 meters", "6 meters", "15 meters"], correct: 1 }
  ];
  const PROGRESS_ID = "quiz-nile-crocodile";

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
