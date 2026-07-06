(function () {
  const QUESTIONS = [
    { q: "What stone covered Menkaure's lower layers?", options: ["Sandstone", "Marble", "Pink granite"], correct: 2 },
    { q: "Where does Menkaure's pyramid rank in size among the Giza three?", options: ["Largest", "Middle", "Smallest"], correct: 2 },
    { q: "About when was Menkaure's pyramid completed?", options: ["2510 BCE", "1000 BCE", "500 BCE"], correct: 0 },
    { q: "Why was pink granite notable to use?", options: ["It was rare and costly to transport", "It was the cheapest stone", "It was found right at Giza"], correct: 0 },
    { q: "Who was Menkaure's pyramid built for?", options: ["A queen", "Pharaoh Menkaure", "A high priest"], correct: 1 }
  ];
  const PROGRESS_ID = "quiz-pyramid-menkaure";

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
