document.addEventListener("DOMContentLoaded", () => {
  // ==== ELEMENTREFERENSER ====
  const fatherInput = document.getElementById("fatherGenotype");
  const motherInput = document.getElementById("motherGenotype");
  const punnettCells = [
    document.getElementById("cell0"),
    document.getElementById("cell1"),
    document.getElementById("cell2"),
    document.getElementById("cell3")
  ];
  const checkBtn = document.getElementById("checkAnswers");
  const resultDiv = document.getElementById("result");
  const offspringGenotypeOptions = document.querySelectorAll('input[name="offspringGenotype"]');
  const offspringPhenotypeOptions = document.querySelectorAll('input[name="offspringPhenotype"]');
  const ratioInput = document.getElementById("ratio");
  const taskTitle = document.getElementById("taskTitle");
  const prevTaskBtn = document.getElementById("prevTask");
  const nextTaskBtn = document.getElementById("nextTask");

  // ==== UPPGIFTER ====
  const tasks = [
    {
      title: "Uppgift 1 – Grå starr",
      mother: "Ss",
      father: "ss",
      correctGenotypes: ["Ss","Ss","ss","ss"],
      correctPhenotypes: ["Grå starr","Grå starr","Frisk","Frisk"],
      correctRatio: "2:2"
    },
    {
      title: "Uppgift 2 – Exempeluppgift",
      mother: "AA",
      father: "aa",
      correctGenotypes: ["Aa","Aa","Aa","Aa"],
      correctPhenotypes: ["Dominant","Dominant","Dominant","Dominant"],
      correctRatio: "4:0"
    }
  ];

  let currentTask = 0;

  // ==== AUTOMATISK FYLLNING AV PUNNETT-KVADRAT ====
  function fillPunnettSquare() {
    const f = fatherInput.value.toUpperCase().trim();
    const m = motherInput.value.toUpperCase().trim();

    if (f.length === 2 && m.length === 2) {
      const fatherAlleles = [f[0], f[1]];
      const motherAlleles = [m[0], m[1]];

      punnettCells[0].value = fatherAlleles[0] + motherAlleles[0];
      punnettCells[1].value = fatherAlleles[0] + motherAlleles[1];
      punnettCells[2].value = fatherAlleles[1] + motherAlleles[0];
      punnettCells[3].value = fatherAlleles[1] + motherAlleles[1];
    } else {
      punnettCells.forEach(cell => cell.value = "");
    }
  }

  fatherInput.addEventListener("input", fillPunnettSquare);
  motherInput.addEventListener("input", fillPunnettSquare);

  // ==== KONTROLLERA SVAR ====
  checkBtn.addEventListener("click", () => {
    let score = 0;
    let maxScore = 0;

    const task = tasks[currentTask];

    // ==== KONTROLLERA AVKOMMANS GENOTYP ====
    maxScore += offspringGenotypeOptions.length;
    offspringGenotypeOptions.forEach(input => {
      if (input.checked && task.correctGenotypes.includes(input.value)) {
        score++;
      }
    });

    // ==== KONTROLLERA AVKOMMANS FENOTYP ====
    maxScore += offspringPhenotypeOptions.length;
    offspringPhenotypeOptions.forEach(input => {
      if (input.checked && task.correctPhenotypes.includes(input.value)) {
        score++;
      }
    });

    // ==== KONTROLLERA KLYVNINGSTAL ====
    maxScore += 1;
    if (ratioInput.value.trim() === task.correctRatio) {
      score++;
    }

    // ==== VISA RESULTAT ====
    resultDiv.innerHTML = `<h3>Resultat</h3>
      <p>Du fick ${score} av ${maxScore} poäng.</p>
      <p>Bra jobbat! Kontrollera gärna svaren och testa igen för att bli snabbare.</p>`;
  });

  // ==== NAVIGATION UPPGIFTER ====
  function loadTask(idx) {
    const task = tasks[idx];
    taskTitle.innerText = task.title;
    motherInput.value = task.mother;
    fatherInput.value = task.father;
    fillPunnettSquare();

    // Nollställ checkboxar och klyvningstal
    offspringGenotypeOptions.forEach(cb => cb.checked = false);
    offspringPhenotypeOptions.forEach(cb => cb.checked = false);
    ratioInput.value = "";
    resultDiv.innerHTML = "";
  }

  nextTaskBtn.addEventListener("click", () => {
    if (currentTask < tasks.length - 1) {
      currentTask++;
      loadTask(currentTask);
    }
  });

  prevTaskBtn.addEventListener("click", () => {
    if (currentTask > 0) {
      currentTask--;
      loadTask(currentTask);
    }
  });

  // ==== STARTA MED FÖRSTA UPPGIFTEN ====
  loadTask(currentTask);

});
