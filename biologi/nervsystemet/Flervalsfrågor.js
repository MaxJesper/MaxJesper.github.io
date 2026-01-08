let startTime;
let timerInterval;
let totalCorrect = 0;
let answered = 0;

const sectionResults = {};

// ====== FRÅGOR ======
const questions = [
  // 7.1 Nervsystemet
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
    section: "7.1",
    question: "Vad kallas nerver som leder impulser från sinnesorgan till CNS?",
    options: [
      "Motoriska nerver",
      "Sensoriska nerver",
      "Autonoma nerver",
      "Reflexnerver"
    ],
    correct: 1
  },

  // 7.2 Hjärnan
  {
    section: "7.2",
    question: "Vilka huvuddelar består hjärnan av?",
    options: [
      "Storhjärnan, lillhjärnan och hjärnstammen",
      "Storhjärnan och ryggmärgen",
      "Hjärnbalken och lillhjärnan",
      "Endast storhjärnan"
    ],
    correct: 0
  },
  {
    section: "7.2",
    question: "Vilken del samordnar balans och muskelrörelser?",
    options: [
      "Storhjärnan",
      "Hjärnstammen",
      "Lillhjärnan",
      "Ryggmärgen"
    ],
    correct: 2
  },
  {
    section: "7.2",
    question: "Vad gör vänster hjärnhalva särskilt bra?",
    options: [
      "Konst och musik",
      "Tal, läsning, logiskt tänkande",
      "Känna igen ansikten",
      "Balans och koordination"
    ],
    correct: 1
  },
  {
    section: "7.2",
    question: "Vad innebär associering i hjärnan?",
    options: [
      "Att koppla ihop olika minnen och upplevelser",
      "Att lagra minnen i lillhjärnan",
      "Att skicka reflexsignaler utan hjärnan",
      "Att stimulera hormoner i blodet"
    ],
    correct: 0
  },

  // 7.3 Reflexer
  {
    section: "7.3",
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
    question: "Vad sker vid knäreflexen?",
    options: [
      "Hjärnan tolkar slaget innan benet rör sig",
      "Impulsen går direkt till ryggmärgen och benet sträcks ut",
      "Reflexen styrs av lillhjärnan",
      "Benet rör sig slumpmässigt"
    ],
    correct: 1
  },

  // 7.11 Hormoner
  {
    section: "7.11",
    question: "Vad är ett hormon?",
    options: [
      "Ett kemiskt ämne som transporteras i blodet",
      "En elektrisk impuls i nerver",
      "En del av hjärnan",
      "Ett muskelfibrer"
    ],
    correct: 0
  },
  {
    section: "7.11",
    question: "Vad gör insulin?",
    options: [
      "Ökar blodsockret",
      "Sänker blodsockret",
      "Ökar hjärtfrekvensen",
      "Stänger luftrören"
    ],
    correct: 1
  },
  {
    section: "7.11",
    question: "Vilket hormon produceras vid stress eller fara?",
    options: [
      "Insulin",
      "Adrenalin",
      "Endorfin",
      "Tillväxthormon"
    ],
    correct: 1
  },
  {
    section: "7.11",
    question: "Vilka körtlar styr könshormoner?",
    options: [
      "Binjurarna",
      "Hypofysen",
      "Testiklar och äggstockar",
      "Sköldkörteln"
    ],
    correct: 2
  },

  // 7.14 Autonoma nervsystemet
  {
    section: "7.14",
    question: "Vilken del av nervsystemet styr självgående funktioner som hjärta och tarmar?",
    options: [
      "Centrala nervsystemet",
      "Autonoma nervsystemet",
      "Motoriska nerver",
      "Sensoriska nerver"
    ],
    correct: 1
  },
  {
    section: "7.14",
    question: "Vad gör det sympatiska nervsystemet vid fara?",
    options: [
      "Sänker pulsen och lugnar kroppen",
      "Ökar hjärtfrekvens, blodflöde till muskler",
      "Startar matsmältningen",
      "Stänger andningen"
    ],
    correct: 1
  },
  {
    section: "7.14",
    question: "Vad gör parasympatiska nervsystemet när kroppen är lugn?",
    options: [
      "Ökar pulsen",
      "Stänger tarmarna",
      "Stimulerar matsmältning och lugnar hjärtat",
      "Aktiverar muskler för flykt"
    ],
    correct: 2
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

// ====== NOLLSTÄLL RESULTAT ======
document.getElementById("resetButton").addEventListener("click", function() {
    if(confirm("Vill du verkligen nollställa alla resultat?")) {
        localStorage.removeItem("nerv_quiz_scores");
        totalCorrect = 0;
        answered = 0;
        for (let sec in sectionResults) {
            sectionResults[sec].correct = 0;
            sectionResults[sec].total = 0;
        }
        document.getElementById("quiz").innerHTML = "";
        document.getElementById("sectionScore").innerHTML = "";
        document.getElementById("finalResult").innerHTML = "";
        renderHighscores();
        alert("Resultaten har nollställts.");
    }
});

// ====== NYTT FÖRSÖK ======
document.getElementById("retryButton").addEventListener("click", function() {
    totalCorrect = 0;
    answered = 0;
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);

    for (let sec in sectionResults) {
        sectionResults[sec].correct = 0;
        sectionResults[sec].total = 0;
    }

    document.getElementById("quiz").innerHTML = "";
    document.getElementById("sectionScore").innerHTML = "";
    document.getElementById("finalResult").innerHTML = "";

    loadQuiz();
});

renderHighscores();
