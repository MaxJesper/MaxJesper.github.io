document.addEventListener("DOMContentLoaded", () => {
  const fatherInput = document.getElementById("fatherGenotype");
  const motherInput = document.getElementById("motherGenotype");

  const punnettCells = [
    document.getElementById("cell0"),
    document.getElementById("cell1"),
    document.getElementById("cell2"),
    document.getElementById("cell3")
  ];

  const fatherAllele0 = document.getElementById("fatherAllele0");
  const fatherAllele1 = document.getElementById("fatherAllele1");
  const motherAllele0 = document.getElementById("motherAllele0");
  const motherAllele1 = document.getElementById("motherAllele1");

  const checkBtn = document.getElementById("checkAnswers");
  const resultDiv = document.getElementById("result");
  const offspringGenotypeOptions = document.querySelectorAll('input[name="offspringGenotype"]');
  const offspringPhenotypeOptions = document.querySelectorAll('input[name="offspringPhenotype"]');
  const ratioInput = document.getElementById("ratio");

  const taskTitle = document.getElementById("taskTitle");
  const taskText = document.getElementById("taskText");
  const prevTaskBtn = document.getElementById("prevTask");
  const nextTaskBtn = document.getElementById("nextTask");

  // ==== UPPGIFTER ====
  const tasks = [
    {
      title: "Uppgift 1 – Grå starr",
      text: "Grå starr är en ärftlig ögonsjukdom. Den är dominant (S). En heterozygot kvinna (Ss) med grå starr gifter sig med en frisk man (ss). De får barn. Får dessa starr? Vilka olika möjligheter finns? Visa med korsningsschema.",
      mother: "Ss",
      father: "ss",
      correctGenotypes: ["Ss","Ss","ss","ss"],
      correctPhenotypes: ["Grå starr","Grå starr","Frisk","Frisk"],
      correctRatio: "2:2"
    }
  ];

  let currentTask = 0;

  // ==== FYLL I PARENTS OCH PUNNETT ====
  function fillPunnettSquare() {
    const f = fatherInput.value.toUpperCase().trim();
    const m = motherInput.value.toUpperCase().trim();

    if (f.length === 2 && m.length === 2) {
      const fatherAlleles = [f[0], f[1]];
      const motherAlleles = [m[0], m[1]];

      fatherAllele0.innerText = fatherAlleles[0];
      fatherAllele1.innerText = fatherAlleles[1];
      motherAllele0.innerText = motherAlleles[0];
      motherAllele1.innerText = motherAlleles[1];

      punnettCells[0].value = fatherAlleles[0] + motherAlleles[0];
      punnettCells[1].value = fatherAlleles[0] + motherAlleles[1];
      punnettCells[2].value = fatherAlleles[1] + motherAlleles[0];
      punnettCells[3].value = fatherAlleles[1] + motherAlleles[1];
    } else {
      fatherAllele0.innerText = "";
      fatherAllele1.innerText = "";
      motherAllele0.innerText = "";
      motherAllele1.innerText = "";
      punnettCells.forEach(cell => cell.value = "");
    }
  }

  fatherInput.addEventListener("input", fillPunnettSquare);
  motherInput.addEventListener("input", fillPunnettSquare);

  // ==== RÄTTA SVAR ====
  checkBtn.addEventListener("click", () => {
    let score = 0;
    let maxScore = 0;
    const task = tasks[currentTask];

    maxScore += offspringGenotypeOptions.length;
    offspringGenotypeOptions.forEach(input => {
      if (input.checked && task.correctGenotypes.includes(input.value)) score++;
    });

    maxScore += offspringPhenotypeOptions.length;
    offspringPhenotypeOptions.forEach(input => {
      if (input.checked && task.correctPhenotypes.includes(input.value)) score++;
    });

    maxScore += 1;
    if (ratioInput.value.trim() === task.correctRatio) score++;

    resultDiv.innerHTML = `<h3>Resultat</h3>
      <p>Du fick ${score} av ${maxScore} poäng.</p>
      <p>Bra jobbat! Kontrollera gärna svaren och testa igen för att bli snabbare.</p>`;
  });

  // ==== NAVIGATION ====
  function loadTask(idx) {
    const task = tasks[idx];
    taskTitle.innerText = task.title;
    taskText.innerText = task.text;

    motherInput.value = task.mother;
    fatherInput.value = task.father;
    fillPunnettSquare();

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

  // ==== STARTA FÖRSTA UPPGIFTEN ====
  loadTask(currentTask);
});
