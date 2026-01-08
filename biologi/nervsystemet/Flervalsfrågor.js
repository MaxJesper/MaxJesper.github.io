let startTime;
let timerInterval;
let totalCorrect = 0;
let answered = 0;

const sectionResults = {};

// ====== FRÅGOR ======
const questions = [
  {
    section: "7.1",
    question: "Vad är nervsystemets huvuduppgift?",
    options: [
      "Transportera syre",
      "Styra och samordna kroppens funktioner",
      "Bryta ner maten",
      "Skydda kroppen mot bakterier"
    ],
    correct: 1
  },
  {
    section: "7.1",
    question: "Vad kännetecknar nervimpulser?",
    options: [
      "Långsamma och kemiska",
      "Sprids i blodet",
      "Snabba och elektriska",
      "Består av hormoner"
    ],
    correct: 2
  },
  {
    section: "7.2",
    question: "Vad är en reflex?",
    options: [
      "En viljestyrd rörelse",
      "En långsam hormonreaktion",
      "En snabb och omedveten reaktion",
      "En muskelrörelse som styrs av hjärtat"
    ],
    correct: 2
  },
  {
    section: "7.3",
    question: "Vad gör insulin?",
    options: [
      "Höjer blodsockret",
      "Sänker blodsockret",
      "Ökar hjärtfrekvensen",
      "Påverkar andningen"
    ],
    correct: 1
  }
];

// ====== START ======
document.getElementById("startBtn").onclick = () => {
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("timer").style.display = "block";

  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);

  loadQuiz();
};

// ====== TIMER ======
function updateTimer() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("timer").innerText = `Tid: ${seconds} s`;
}

// ====== VISA FRÅGOR ======
function loadQuiz() {
  const quizDiv = document.getElementById("quiz");
  quizDiv.innerHTML = "";

  questions.forEach((q, index) => {
    if (!sectionResults[q.section]) {
      sectionResults[q.section] = { correct: 0, total: 0 };
    }
    sectionResults[q.section].total++;

    const div = document.createElement("div");
    div.innerHTML = `<h3>${q.section} – ${q.question}</h3>`;

    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.innerText = opt;

      btn.onclick = () => handleAnswer(btn, div, q, i);

      div.appendChild(btn);
    });

    quizDiv.appendChild(div);
  });
}

// ====== HANTERA SVAR ======
function handleAnswer(btn, div, q, i) {
  if (btn.disabled) return;

  answered++;

  if (i === q.correct) {
    btn.classList.add("correct");
    totalCorrect++;
    sectionResults[q.section].correct++;
  } else {
    btn.classList.add("incorrect");
  }

  div.querySelectorAll("button")[q.correct].classList.add("correct");
  div.querySelectorAll("button").forEach(b => b.disabled = true);

  updateSectionScore();

  if (answered === questions.length) {
    finishQuiz();
  }
}

// ====== RESULTAT PER AVSNITT ======
function updateSectionScore() {
  let html = "<h2>Resultat per avsnitt</h2><ul>";
  for (let sec in sectionResults) {
    const s = sectionResults[sec];
    html += `<li>${sec}: ${s.correct} / ${s.total} rätt</li>`;
  }
  html += "</ul>";
  document.getElementById("sectionScore").innerHTML = html;
}

// ====== SLUTRESULTAT ======
function finishQuiz() {
  clearInterval(timerInterval);
  const time = Math.floor((Date.now() - startTime) / 1000);

  document.getElementById("finalResult").innerHTML = `
    <h2>✅ Test klart!</h2>
    <p>Du fick <strong>${totalCorrect}</strong> av <strong>${questions.length}</strong> rätt.</p>
    <p>Tid: <strong>${time}</strong> sekunder</p>
    <p>Bra jobbat! Gör testet igen för ännu bättre resultat 💪</p>
  `;

  saveHighscore(totalCorrect, time);
}

// ====== HIGHSCORE ======
function saveHighscore(score, time) {
  let scores = JSON.parse(localStorage.getItem("nerv_quiz_scores")) || [];
  scores.push({ score, time });

  scores.sort((a, b) => b.score - a.score || a.time - b.time);
  scores = scores.slice(0, 3);

  localStorage.setItem("nerv_quiz_scores", JSON.stringify(scores));
  renderHighscores();
}

function renderHighscores() {
  const tbody = document.getElementById("highscoreTable");
  tbody.innerHTML = "";

  const scores = JSON.parse(localStorage.getItem("nerv_quiz_scores")) || [];
  scores.forEach((s, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${s.score}</td>
        <td>${s.time}</td>
      </tr>`;
  });
}

renderHighscores();

// Nollställ-knapp
document.getElementById("resetButton").addEventListener("click", function() {
    if(confirm("Vill du verkligen nollställa alla resultat?")) {
        localStorage.removeItem("nervsystemetHighscores");
        alert("Resultaten har nollställts.");
        location.reload(); // uppdaterar sidan
    }
});
