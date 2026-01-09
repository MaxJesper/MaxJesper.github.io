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

    // ==== KONTROLLERA AVKOMMANS GENOTYP ====
    const correctGenotypes = ["Ss","Ss","ss","ss"]; // enligt uppgift
    maxScore += offspringGenotypeOptions.length;
    offspringGenotypeOptions.forEach((input, idx) => {
      if ((input.checked && correctGenotypes.includes(input.value))) {
        score++;
      }
    });

    // ==== KONTROLLERA AVKOMMANS FENOTYP ====
    const correctPhenotypes = ["Grå starr","Grå starr","Frisk","Frisk"];
    maxScore += offspringPhenotypeOptions.length;
    offspringPhenotypeOptions.forEach((input, idx) => {
      if (input.checked && correctPhenotypes.includes(input.value)) {
        score++;
      }
    });

    // ==== KONTROLLERA KLYVNINGSTAL ====
    maxScore += 1;
    const correctRatio = "2:2"; // dominant:recessiv
    if (ratioInput.value.trim() === correctRatio) {
      score++;
    }

    // ==== VISA RESULTAT ====
    resultDiv.innerHTML = `<h3>Resultat</h3>
      <p>Du fick ${score} av ${maxScore} poäng.</p>
      <p>Bra jobbat! Kontrollera gärna svaren och testa igen för att bli snabbare.</p>`;
  });

});
