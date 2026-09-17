const scoreEl = document.getElementById("score");
const slider = document.getElementById("angleSlider");
const angleValue = document.getElementById("angleValue");
const angleText = document.getElementById("angleText");
const classification = document.getElementById("classification");
const arm2 = document.getElementById("arm2");
const handle = document.getElementById("handle");
const ticks = document.getElementById("ticks");
const protractorArc = document.getElementById("protractorArc");

let score = 0;
let angle = 60;

function angleType(deg) {
  if (deg === 0) return "zero";
  if (deg < 90) return "acute";
  if (deg === 90) return "right";
  if (deg < 180) return "obtuse";
  if (deg === 180) return "straight";
  return "reflex";
}

const descriptions = {
  zero: "It has no opening.",
  acute: "It is greater than 0° and less than 90°.",
  right: "It measures exactly 90°.",
  obtuse: "It is greater than 90° and less than 180°.",
  straight: "It measures exactly 180°.",
  reflex: "It is greater than 180° and less than 360°."
};

function pointOnCircle(cx, cy, r, deg) {
  const rad = -deg * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function updateAngle(deg) {
  angle = Math.max(0, Math.min(180, Number(deg) || 0));
  slider.value = angle;
  angleValue.textContent = angle;
  angleText.textContent = angle + "°";

  const [x, y] = pointOnCircle(260, 250, 190, angle);
  arm2.setAttribute("x2", x);
  arm2.setAttribute("y2", y);
  handle.setAttribute("cx", x);
  handle.setAttribute("cy", y);
  handle.setAttribute("aria-valuenow", angle);

  const type = angleType(angle);
  const title = type.charAt(0).toUpperCase() + type.slice(1) + " angle";
  classification.innerHTML = `<strong>${title}</strong><span>${descriptions[type]}</span>`;
}

function buildProtractor() {
  const [sx, sy] = pointOnCircle(260, 250, 190, 0);
  const [ex, ey] = pointOnCircle(260, 250, 190, 180);
  protractorArc.setAttribute("d", `M ${sx} ${sy} A 190 190 0 0 0 ${ex} ${ey}`);

  for (let d = 0; d <= 180; d += 10) {
    const [x1, y1] = pointOnCircle(260, 250, 165, d);
    const [x2, y2] = pointOnCircle(260, 250, 180, d);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1); line.setAttribute("y1", y1);
    line.setAttribute("x2", x2); line.setAttribute("y2", y2);
    line.setAttribute("class", "tick");
    ticks.appendChild(line);
  }
}

slider.addEventListener("input", e => updateAngle(e.target.value));

document.querySelectorAll("[data-angle]").forEach(btn => {
  btn.addEventListener("click", () => updateAngle(btn.dataset.angle));
});

let dragging = false;
function setFromPointer(e) {
  const rect = document.getElementById("angleSvg").getBoundingClientRect();
  const cx = rect.left + rect.width * (260 / 520);
  const cy = rect.top + rect.height * (250 / 320);
  let deg = Math.atan2(-(e.clientY - cy), e.clientX - cx) * 180 / Math.PI;
  if (deg < 0) deg = 0;
  if (deg > 180) deg = 180;
  updateAngle(Math.round(deg));
}

handle.addEventListener("pointerdown", e => {
  dragging = true;
  handle.setPointerCapture(e.pointerId);
});
handle.addEventListener("pointermove", e => { if (dragging) setFromPointer(e); });
handle.addEventListener("pointerup", () => dragging = false);
handle.addEventListener("pointercancel", () => dragging = false);

handle.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
    e.preventDefault(); updateAngle(angle - 1);
  }
  if (e.key === "ArrowRight" || e.key === "ArrowUp") {
    e.preventDefault(); updateAngle(angle + 1);
  }
});

let quizAngle = 120;
function randomAngle() {
  const choices = [20, 35, 45, 60, 75, 90, 110, 120, 135, 150, 180];
  return choices[Math.floor(Math.random() * choices.length)];
}

function showQuizQuestion() {
  quizAngle = randomAngle();
  const [x, y] = pointOnCircle(180, 175, 140, quizAngle);
  document.getElementById("quizArm2").setAttribute("x2", x);
  document.getElementById("quizArm2").setAttribute("y2", y);
  document.getElementById("quizDegrees").textContent = quizAngle + "°";
  document.getElementById("quizFeedback").textContent = "";
  document.getElementById("quizFeedback").className = "feedback";
  document.querySelectorAll(".answer").forEach(b => b.classList.remove("correct", "wrong"));
}

document.querySelectorAll(".answer").forEach(btn => {
  btn.addEventListener("click", () => {
    const chosen = btn.dataset.type;
    const correct = angleType(quizAngle);
    document.querySelectorAll(".answer").forEach(b => b.classList.remove("correct", "wrong"));

    if (chosen === correct) {
      btn.classList.add("correct");
      score += 10;
      scoreEl.textContent = score;
      document.getElementById("quizFeedback").textContent = "Correct! +10 points";
      document.getElementById("quizFeedback").className = "feedback good";
    } else {
      btn.classList.add("wrong");
      document.getElementById("quizFeedback").textContent =
        `Not quite. ${quizAngle}° is a ${correct} angle.`;
      document.getElementById("quizFeedback").className = "feedback bad";
    }
  });
});

document.getElementById("nextQuestion").addEventListener("click", showQuizQuestion);

let timer = 30;
let interval = null;
let roundScore = 0;
let timedAngle = 0;
const timeEl = document.getElementById("time");
const roundScoreEl = document.getElementById("roundScore");
const timedQuestion = document.getElementById("timedQuestion");
const roundStatus = document.getElementById("roundStatus");
const startQuiz = document.getElementById("startQuiz");

function newTimedQuestion() {
  timedAngle = randomAngle();
  timedQuestion.textContent = `${timedAngle}° — What type of angle is this?`;
  document.querySelectorAll(".timed-answer").forEach(b => b.classList.remove("correct", "wrong"));
}

function endTimedQuiz() {
  clearInterval(interval);
  interval = null;
  document.querySelectorAll(".timed-answer").forEach(b => b.disabled = true);
  startQuiz.disabled = false;
  startQuiz.textContent = "Play Again";
  roundStatus.textContent = `Time's up! You scored ${roundScore} in this round.`;
}

function startTimedQuiz() {
  clearInterval(interval);
  timer = 30;
  roundScore = 0;
  timeEl.textContent = timer;
  roundScoreEl.textContent = roundScore;
  startQuiz.disabled = true;
  document.querySelectorAll(".timed-answer").forEach(b => b.disabled = false);
  roundStatus.textContent = "Go!";
  newTimedQuestion();

  interval = setInterval(() => {
    timer--;
    timeEl.textContent = timer;
    if (timer <= 0) endTimedQuiz();
  }, 1000);
}

document.querySelectorAll(".timed-answer").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!interval) return;
    const correct = angleType(timedAngle);
    if (btn.dataset.type === correct) {
      roundScore++;
      score += 5;
      scoreEl.textContent = score;
      roundScoreEl.textContent = roundScore;
      btn.classList.add("correct");
    } else {
      btn.classList.add("wrong");
    }
    setTimeout(newTimedQuestion, 180);
  });
});

startQuiz.addEventListener("click", startTimedQuiz);

buildProtractor();
updateAngle(angle);
showQuizQuestion();
