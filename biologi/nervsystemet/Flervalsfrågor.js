document.addEventListener("DOMContentLoaded", () => {

  let startTime;
  let timerInterval;
  let totalCorrect = 0;
  let answered = 0;

  const sectionResults = {};

  const questions = [
    // 7.1 Nervsystemet
    { section: "7.1", question: "Vad är nervsystemets huvuduppgift?", options: ["Transportera syre","Styra och samordna kroppens funktioner","Bryta ner maten","Skydda kroppen mot bakterier"], correct: 1 },
    { section: "7.1", question: "Vad kännetecknar nervimpulser?", options: ["Långsamma och kemiska","Sprids i blodet","Snabba och elektriska","Består av hormoner"], correct: 2 },
    { section: "7.1", question: "Vilka nerver leder signaler från sinnesorganen till CNS?", options: ["Motoriska nerver","Sensoriska nerver","Autonoma nerver","Reflexnerver"], correct: 1 },
    { section: "7.1", question: "Vad är skillnaden mellan medvetna och omedvetna reaktioner?", options: ["Omedvetna styrs av hjärnan","Medvetna sker innan reflexen","Medvetna styrs av hjärnan, reflexer av ryggmärgen","Reflexer tar längre tid"], correct: 2 },

    // 7.2 Hjärnan
    { section: "7.2", question: "Vilka tre delar består hjärnan av?", options: ["Storhjärnan, lillhjärnan, hjärnstammen","Storhjärnan, ryggmärgen, lillhjärnan","Storhjärnan, hypofysen, lillhjärnan","Hjärnbarken, lillhjärnan, hjärnbalken"], correct: 0 },
    { section: "7.2", question: "Vilken funktion har lillhjärnan?", options: ["Styr viljestyrda rörelser","Samordnar balans och muskelrörelser","Lagrar minnen","Producerar hormoner"], correct: 1 },
    { section: "7.2", question: "Vad lagras i storhjärnans bark?", options: ["Axon och myelin","Cellkroppar som tänker och lagrar minnen","Blodkärl och vätska","Reflexer"], correct: 1 },
    { section: "7.2", question: "Vilken halva av hjärnan ansvarar för logik och tal?", options: ["Höger","Vänster","Båda lika","Lillhjärnan"], correct: 1 },

    // 7.3 Hormonsystemet
    { section: "7.3", question: "Vad är ett hormon?", options: ["Elektrisk impuls i en nerv","Signalämne som sprids med blodet","Molekyl i muskler","Reflex"], correct: 1 },
    { section: "7.3", question: "Vilket hormon sänker blodsockret?", options: ["Insulin","Adrenalin","Testosteron","T3"], correct: 0 },
    { section: "7.3", question: "Vilket hormon frigörs vid stress och fara?", options: ["Adrenalin","Progesteron","Östrogen","Acetylkolin"], correct: 0 },
    { section: "7.3", question: "Vilken körtel kallas chefskörtel och styr andra körtlar?", options: ["Sköldkörteln","Binjurarna","Hypofysen","Bukspottkörteln"], correct: 2 }
  ];

  // ==== Elementreferenser ====
  const startBtn = document.getElementById("startBtn");
  const retryBtn = document.getElementById("retryButton");
  const resetBtn = document.getElementById("resetButton");

  // ==== START TEST ====
  startBtn.onclick = () => {
    startBtn.style.display = "none";
    document.getElementById("timer").style.display = "block";
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    loadQuiz();
  };

  // ==== NYTT FÖRSÖK ====
  retryBtn.onclick = () => {
    totalCorrect = 0;
    answered = 0;
    for (let sec in sectionResults) sectionResults[sec] = { correct: 0, total: 0 };
    document.getElementById("quiz").innerHTML = "";
    document.getElementById("sectionScore").innerHTML = "";
    document.getElementById("finalResult").innerHTML = "";
    startBtn.style.display = "inline-block";
    document.getElementById("timer").innerText = "Tid: 0 s";
    clearInterval(timerInterval);
  };

  // ==== NOLLSTÄLL RESULTAT ====
  resetBtn.onclick = () => {
    if(confirm("Vill du verkligen nollställa alla resultat?")) {
      localStorage.removeItem("nerv_quiz_scores");
      renderHighscores();
      alert("Resultaten har nollställts.");
    }
  };

  // ==== TIMER ====
  function updateTimer() {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("timer").innerText = `Tid: ${seconds} s`;
  }

  // ==== VISA FRÅGOR ====
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

  // ==== HANTERA SVAR ====
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

  // ==== RESULTAT PER AVSNITT ====
  function updateSectionScore() {
    let html = "<h2>Resultat per avsnitt</h2><ul>";
    for (let sec in sectionResults) {
      const s = sectionResults[sec];
      html += `<li>${sec}: ${s.correct} / ${s.total} rätt</li>`;
    }
    html += "</ul>";
    document.getElementById("sectionScore").innerHTML = html;
  }

  // ==== SLUTRESULTAT ====
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

  // ==== HIGHSCORE ====
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
      tbody.innerHTML += `<tr>
        <td>${i + 1}</td>
        <td>${s.score}</td>
        <td>${s.time} s</td>
      </tr>`;
    });
  }

  renderHighscores();

});
