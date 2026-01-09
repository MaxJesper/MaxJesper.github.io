document.addEventListener("DOMContentLoaded", () => {

  const motherInput = document.getElementById("motherGenotype");
  const fatherInput = document.getElementById("fatherGenotype");
  const checkBtn = document.getElementById("checkAnswers");
  const resultDiv = document.getElementById("result");
  const offspringCells = document.querySelectorAll(".offspringCell");

  // Kombinationer automatiskt när föräldrar ändras
  function updatePunnett() {
    const mother = motherInput.value.toUpperCase();
    const father = fatherInput.value.toUpperCase();

    if (mother.length === 2 && father.length === 2) {
      const combinations = [
        mother[0] + father[0],
        mother[0] + father[1],
        mother[1] + father[0],
        mother[1] + father[1]
      ];

      offspringCells.forEach((cell, i) => {
        cell.value = combinations[i];
        cell.style.backgroundColor = ""; // återställ färg
      });

      resultDiv.innerHTML = "";
    }
  }

  motherInput.addEventListener("input", updatePunnett);
  fatherInput.addEventListener("input", updatePunnett);

  // Rättning
  checkBtn.addEventListener("click", () => {
    const mother = motherInput.value.toUpperCase();
    const father = fatherInput.value.toUpperCase();
    const correctCombinations = [
      mother[0] + father[0],
      mother[0] + father[1],
      mother[1] + father[0],
      mother[1] + father[1]
    ];

    // Kontrollera Punnett-kvadrat
    let correctCells = 0;
    offspringCells.forEach((cell, i) => {
      if (cell.value.toUpperCase() === correctCombinations[i]) {
        cell.style.backgroundColor = "#4CAF50"; // grön
        correctCells++;
      } else {
        cell.style.backgroundColor = "#f44336"; // röd
      }
    });

    // Kontrollera avkommans genotyper (flervalsrutor)
    const genotypeCheckboxes = document.querySelectorAll('input[name="genotype"]:checked');
    const expectedGenotypes = ["Ss", "Ss", "ss", "ss"];
    const selectedGenotypes = Array.from(genotypeCheckboxes).map(cb => cb.value);
    let genotypeCorrect = expectedGenotypes.every(g => selectedGenotypes.includes(g)) &&
                          selectedGenotypes.every(g => expectedGenotypes.includes(g));

    // Kontrollera avkommans fenotyper (flervalsrutor)
    const phenotypeCheckboxes = document.querySelectorAll('input[name="phenotype"]:checked');
    const expectedPhenotypes = ["Grå starr", "Frisk"];
    const selectedPhenotypes = Array.from(phenotypeCheckboxes).map(cb => cb.value);
    let phenotypeCorrect = expectedPhenotypes.every(p => selectedPhenotypes.includes(p)) &&
                           selectedPhenotypes.every(p => expectedPhenotypes.includes(p));

    // Klyvningstal
    const ratioInput = document.getElementById("ratio");
    let ratioCorrect = ratioInput.value.replace(/\s/g,'') === "2:2";

    // Visa resultat
    let resultHTML = `<p>Punnett-kvadrat: ${correctCells} / 4 rätt</p>`;
    resultHTML += `<p>Avkommans genotyper: ${genotypeCorrect ? "✅ Rätt" : "❌ Fel"} (Rätt: Ss, Ss, ss, ss)</p>`;
    resultHTML += `<p>Avkommans fenotyper: ${phenotypeCorrect ? "✅ Rätt" : "❌ Fel"} (Rätt: Grå starr, Frisk)</p>`;
    resultHTML += `<p>Klyvningstal: ${ratioCorrect ? "✅ Rätt" : "❌ Fel"} (Rätt: 2:2)</p>`;

    resultDiv.innerHTML = resultHTML;
  });

});
