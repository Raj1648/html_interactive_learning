const state = {
  sample: null,
  step: 0,
  results: {},
  quizIndex: 0,
  quizScore: 0,
  quizAnswered: false
};

// The activity describes the violet color as the positive protein test.
// Gram and pea are protein-containing food samples; banana is used as
// the comparison sample in this simulation.
const sampleData = {
  Gram: { icon: "🫘", protein: true, observation: "The solution turns violet." },
  Pea: { icon: "🟢", protein: true, observation: "The solution turns violet." },
  Banana: { icon: "🍌", protein: false, observation: "The solution does not show the violet protein-test color." }
};

const steps = [
  {
    title: "Choose a food sample",
    text: "Select Gram, Pea, or Banana to begin the virtual experiment."
  },
  {
    title: "Grind or mash the sample",
    text: "The sample must be crushed so that it can mix properly with the reagents."
  },
  {
    title: "Add water",
    text: "Add water to the prepared food sample in the test tube."
  },
  {
    title: "Add copper sulphate",
    text: "Add copper sulphate solution to the test tube."
  },
  {
    title: "Add caustic soda",
    text: "Add caustic soda. Now observe the final color of the solution."
  },
  {
    title: "Identify the result",
    text: "A violet color indicates the presence of proteins."
  }
];

const quiz = [
  {
    q: "What does a violet color indicate in this protein test?",
    options: ["Presence of starch", "Presence of proteins", "Presence of fat", "Presence of water"],
    answer: 1,
    explanation: "In this activity, violet color is the positive indication for proteins."
  },
  {
    q: "Which reagent is added before caustic soda?",
    options: ["Water", "Copper sulphate solution", "Oil", "Iodine solution"],
    answer: 1,
    explanation: "The sequence is: sample → water → copper sulphate → caustic soda."
  },
  {
    q: "Why is the food sample ground or mashed?",
    options: ["To change its taste", "To make it colder", "To prepare it for mixing with the reagents", "To remove all nutrients"],
    answer: 2,
    explanation: "Grinding or mashing helps prepare the food sample for the test."
  },
  {
    q: "Which observation should you look for as evidence of protein?",
    options: ["Violet color", "Bright orange color", "Bubbles only", "No change in the test tube"],
    answer: 0,
    explanation: "A violet color is the observation used to identify protein in this activity."
  }
];

const $ = (id) => document.getElementById(id);

const sampleButtons = document.querySelectorAll(".sample");
const grindBtn = $("grindBtn");
const waterBtn = $("waterBtn");
const copperBtn = $("copperBtn");
const causticBtn = $("causticBtn");
const actionButtons = [grindBtn, waterBtn, copperBtn, causticBtn];

function updateProgress() {
  const percent = ((state.step + 1) / steps.length) * 100;
  $("progressBar").style.width = `${percent}%`;
  $("progressText").textContent = `Step ${Math.min(state.step + 1, steps.length)} of ${steps.length}`;
  $("stepBadge").textContent = Math.min(state.step + 1, steps.length);
  $("instructionTitle").textContent = steps[Math.min(state.step, steps.length - 1)].title;
  $("instructionText").textContent = steps[Math.min(state.step, steps.length - 1)].text;
}

function setObservation(text) {
  $("observationText").textContent = text;
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2200);
}

function enableOnly(button) {
  actionButtons.forEach(btn => btn.disabled = true);
  if (button) button.disabled = false;
}

function selectSample(name) {
  state.sample = name;
  state.step = 1;

  sampleButtons.forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.sample === name);
  });

  $("selectedSample").textContent = name;
  $("tubeLabel").textContent = `${sampleData[name].icon} ${name}`;
  $("sampleInside").className = `sample-inside ${name.toLowerCase()} visible`;
  $("liquid").style.height = "0%";
  $("liquid").classList.remove("violet");
  $("bubbles").classList.remove("active");

  $("resultCard").classList.add("hidden");
  setObservation(`${name} selected. Grind or mash the sample to begin.`);
  enableOnly(grindBtn);
  [grindBtn, waterBtn, copperBtn, causticBtn].forEach(btn => btn.classList.remove("done"));

  updateProgress();
  window.scrollTo({ top: document.querySelector(".workspace").offsetTop - 15, behavior: "smooth" });
}

sampleButtons.forEach(btn => {
  btn.addEventListener("click", () => selectSample(btn.dataset.sample));
});

grindBtn.addEventListener("click", () => {
  if (!state.sample) return;
  grindBtn.classList.add("done");
  state.step = 2;
  setObservation("The sample has been ground/m mashed. Now add water.");
  enableOnly(waterBtn);
  updateProgress();
  toast("Sample prepared ✓");
});

waterBtn.addEventListener("click", () => {
  waterBtn.classList.add("done");
  $("liquid").style.height = "38%";
  state.step = 3;
  setObservation("Water added. Next, add copper sulphate solution.");
  enableOnly(copperBtn);
  updateProgress();
  toast("Water added ✓");
});

copperBtn.addEventListener("click", () => {
  copperBtn.classList.add("done");
  $("liquid").style.height = "56%";
  $("liquid").style.background = "rgba(88, 139, 186, .5)";
  state.step = 4;
  setObservation("Copper sulphate solution added. Now add caustic soda.");
  enableOnly(causticBtn);
  updateProgress();
  toast("Copper sulphate added ✓");
});

causticBtn.addEventListener("click", () => {
  causticBtn.classList.add("done");
  $("liquid").style.height = "70%";
  $("bubbles").classList.add("active");

  const data = sampleData[state.sample];

  setTimeout(() => {
    $("bubbles").classList.remove("active");
    if (data.protein) {
      $("liquid").classList.add("violet");
      $("liquid").style.background = "";
    } else {
      $("liquid").classList.remove("violet");
      $("liquid").style.background = "rgba(211, 215, 190, .7)";
    }

    state.step = 5;
    setObservation(data.observation);
    updateProgress();
    showResult(data.protein);
  }, 800);
});

function showResult(protein) {
  $("resultCard").classList.remove("hidden");
  $("resultTitle").textContent = `${state.sample}: ${protein ? "Protein detected" : "No protein detected"}`;
  $("resultDescription").textContent = protein
    ? "The final solution has turned violet. According to this test, the sample contains proteins."
    : "The final solution has not turned violet. According to this simulation, the sample does not give a positive protein-test result.";
  $("resultIcon").textContent = protein ? "🟣" : "🔬";
  $("answerFeedback").textContent = "";
  $("answerFeedback").className = "feedback";

  $("yesBtn").onclick = () => checkAnswer(protein === true, true);
  $("noBtn").onclick = () => checkAnswer(protein === false, false);

  window.scrollTo({ top: $("resultCard").offsetTop - 15, behavior: "smooth" });
}

function checkAnswer(correct, selectedYes) {
  const feedback = $("answerFeedback");
  if (correct) {
    feedback.textContent = "Correct! You identified the result from the observation.";
    feedback.className = "feedback correct";
    toast("Correct answer ✓");
  } else {
    feedback.textContent = `Not quite. Look at the final observation: ${sampleData[state.sample].observation}`;
    feedback.className = "feedback wrong";
  }

  state.results[state.sample] = {
    protein: sampleData[state.sample].protein,
    answered: true
  };

  renderComparison();

  setTimeout(() => {
    $("comparisonCard").classList.remove("hidden");
    window.scrollTo({ top: $("comparisonCard").offsetTop - 15, behavior: "smooth" });
  }, 400);
}

function renderComparison() {
  const names = Object.keys(state.results);
  $("resultsTable").innerHTML = `
    <table class="results-table">
      <thead>
        <tr>
          <th>Sample</th>
          <th>Observation</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        ${names.map(name => `
          <tr>
            <td>${sampleData[name].icon} <strong>${name}</strong></td>
            <td>${sampleData[name].observation}</td>
            <td><span class="status">${sampleData[name].protein ? "Protein present" : "No protein detected"}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

$("quizBtn").addEventListener("click", () => {
  state.quizIndex = 0;
  state.quizScore = 0;
  state.quizAnswered = false;
  $("quizCard").classList.remove("hidden");
  $("completionCard").classList.add("hidden");
  renderQuiz();
  window.scrollTo({ top: $("quizCard").offsetTop - 15, behavior: "smooth" });
});

function renderQuiz() {
  const current = quiz[state.quizIndex];
  $("quizCounter").textContent = `Question ${state.quizIndex + 1} of ${quiz.length}`;

  $("quizContent").innerHTML = `
    <div class="quiz-question">
      <h3>${current.q}</h3>
      <div class="quiz-options">
        ${current.options.map((option, index) =>
          `<button class="quiz-option" data-index="${index}">${option}</button>`
        ).join("")}
      </div>
      <p class="quiz-feedback" id="quizFeedback"></p>
      <div id="nextQuestion"></div>
    </div>
  `;

  document.querySelectorAll(".quiz-option").forEach(button => {
    button.addEventListener("click", () => answerQuiz(Number(button.dataset.index)));
  });
}

function answerQuiz(selected) {
  if (state.quizAnswered) return;
  state.quizAnswered = true;

  const current = quiz[state.quizIndex];
  const options = document.querySelectorAll(".quiz-option");
  const feedback = $("quizFeedback");

  options.forEach((button, index) => {
    button.disabled = true;
    if (index === current.answer) button.classList.add("correct");
    if (index === selected && selected !== current.answer) button.classList.add("incorrect");
  });

  if (selected === current.answer) {
    state.quizScore++;
    feedback.textContent = `Correct! ${current.explanation}`;
  } else {
    feedback.textContent = `The correct answer is "${current.options[current.answer]}". ${current.explanation}`;
  }

  const next = document.createElement("button");
  next.className = "primary-btn next-question";
  next.textContent = state.quizIndex === quiz.length - 1 ? "See My Score →" : "Next Question →";
  next.addEventListener("click", () => {
    state.quizIndex++;
    if (state.quizIndex < quiz.length) {
      state.quizAnswered = false;
      renderQuiz();
    } else {
      showCompletion();
    }
  });
  $("nextQuestion").appendChild(next);
}

function showCompletion() {
  $("quizCard").classList.add("hidden");
  $("completionCard").classList.remove("hidden");
  $("scoreText").textContent = `You scored ${state.quizScore} out of ${quiz.length} in the quick quiz.`;
  window.scrollTo({ top: $("completionCard").offsetTop - 15, behavior: "smooth" });
}

function resetExperiment() {
  state.sample = null;
  state.step = 0;
  state.results = {};
  state.quizIndex = 0;
  state.quizScore = 0;
  state.quizAnswered = false;

  sampleButtons.forEach(btn => btn.classList.remove("selected"));
  $("selectedSample").textContent = "None";
  $("tubeLabel").textContent = "Select a sample";
  $("sampleInside").className = "sample-inside";
  $("liquid").style.height = "8%";
  $("liquid").classList.remove("violet");
  $("liquid").style.background = "";
  $("bubbles").classList.remove("active");

  actionButtons.forEach(btn => {
    btn.disabled = true;
    btn.classList.remove("done");
  });

  setObservation("Choose a sample to start the experiment.");
  $("resultCard").classList.add("hidden");
  $("comparisonCard").classList.add("hidden");
  $("quizCard").classList.add("hidden");
  $("completionCard").classList.add("hidden");
  updateProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("resetBtn").addEventListener("click", resetExperiment);
$("restartBtn").addEventListener("click", resetExperiment);

updateProgress();
