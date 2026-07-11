(function () {
  const QUESTIONS = [
    { q: "Who was the Great Pyramid built for?", options: ["Ramesses II", "Pharaoh Khufu", "Cleopatra"], correct: 1 },
    { q: "About how tall was the pyramid originally?", options: ["65 meters", "100 meters", "146 meters"], correct: 2 },
    { q: "Roughly how many limestone blocks make up the pyramid?", options: ["2.3 million", "500,000", "10 million"], correct: 0 },
    { q: "About how long did it take to build?", options: ["5 years", "20 years", "100 years"], correct: 1 },
    { q: "When was the Great Pyramid completed?", options: ["Around 2560 BCE", "Around 1200 BCE", "Around 500 BCE"], correct: 0 }
  ];
  const PROGRESS_ID = "quiz-pyramid-khufu";

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
