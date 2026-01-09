document.addEventListener("DOMContentLoaded", () => {

  const offspringCells = [
    document.getElementById("cell0"),
    document.getElementById("cell1"),
    document.getElementById("cell2"),
    document.getElementById("cell3")
  ];

  const genotypeChecks = document.querySelectorAll('input[name="offspringGenotype"]');
  const phenotypeChecks = document.querySelectorAll('input[name="offspringPhenotype"]');
  const ratioInput = document.getElementById("ratio");
  const resultDiv = document.getElementById("result");

  const taskTitle = document.getElementById("taskTitle");
  const taskText = document.getElementById("taskText");

  const task = {
    title: "Uppgift 1 – Grå starr",
    text: "Grå starr är en ärftlig ögonsjukdom. Den är dominant (S). En heterozygot kvinna (Ss) med grå starr gifter sig med en frisk man (ss). De får barn. Får dessa starr? Vilka olika möjligheter finns? Visa med korsningsschema.",
    correctPunnett: ["Ss","Ss","ss","ss"],
    correctGenotypes: ["Ss","ss"],
    correctPhenotypes: ["Grå starr","Frisk"],
    ratio: "2:2"
  };

  taskTitle.innerText = task.title;
  taskText.innerText = task.text;

  document.getElementById("checkAnswers").addEventListener("click", () => {
    let score = 0;
    let max = 0;

    // Kontrollera Punnett-kvadrat
    offspringCells.forEach((cell, i) => {
      max++;
      if (cell.value.trim() === task.correctPunnett[i]) score++;
    });

    // Kontrollera genotyper
    genotypeChecks.forEach(cb => {
      max++;
      if (cb.checked && task.correctGenotypes.includes(cb.value)) score++;
    });

    // Kontrollera fenotyper
    phenotypeChecks.forEach(cb => {
      max++;
      if (cb.checked && task.correctPhenotypes.includes(cb.value)) score++;
    });

    // Kontrollera klyvningstal
    max++;
    if (ratioInput.value.trim() === task.ratio) score++;

    resultDiv.innerHTML = `<p><strong>Resultat:</strong> ${score} av ${max} poäng</p>`;
  });

});
