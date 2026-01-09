document.addEventListener("DOMContentLoaded", () => {

  const motherInput = document.getElementById("motherGenotype");
  const fatherInput = document.getElementById("fatherGenotype");
  const fillTableBtn = document.getElementById("fillTable");
  const checkBtn = document.getElementById("checkAnswers");
  const resultDiv = document.getElementById("result");
  const offspringCells = document.querySelectorAll(".offspringCell");

  // Fyll i Punnett-kvadrat baserat på föräldrar
  fillTableBtn.addEventListener("click", () => {
    const mother = motherInput.value.toUpperCase();
    const father = fatherInput.value.toUpperCase();

    if (mother.length !== 2 || father.length !== 2) {
      alert("Ange båda allelerna för modern och fadern (t.ex. Ss, ss).");
      return;
    }

    // Skapa kombinationer: två rader x två kolumner
    const combinations = [
      mother[0] + father[0],
      mother[0] + father[1],
      mother[1] + father[0],
      mother[1] + father[1]
    ];

    offspringCells.forEach((cell, i) => {
      cell.value = combinations[i];
    });

    resultDiv.innerHTML = "Punnett-kvadraten har fyllts i.";
  });

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
        cell.style.backgroundColor = "#4CAF50"; // grön om korrekt
        correctCells++;
      } else {
        cell.style.backgroundColor = "#f44336"; // röd om fel
      }
    });

    // Rätt svar för avkommans genotyper, fenotyper och klyvningstal
    const offspringGenotypesInput = document.getElementById("offspringGenotypes");
    const offspringPhenotypesInput = document.getElementById("offspringPhenotypes");
    const ratioInput = document.getElementById("ratio");

    const expectedGenotypes = ["Ss", "Ss", "ss", "ss"];
    const expectedPhenotypes = ["Grå starr", "Grå starr", "Frisk", "Frisk"];
    const expectedRatio = "2:2";

    let genotypeCorrect = offspringGenotypesInput.value.replace(/\s/g,'').toUpperCase() === expectedGenotypes.join("").toUpperCase();
    let phenotypeCorrect = offspringPhenotypesInput.value.replace(/\s/g,'').toUpperCase() === expectedPhenotypes.join("").toUpperCase();
    let ratioCorrect = ratioInput.value.replace(/\s/g,'') === expectedRatio;

    // Visa resultat
    let resultHTML = `<p>Punnett-kvadrat: ${correctCells} / 4 rätt</p>`;
    resultHTML += `<p>Genotyper: ${genotypeCorrect ? "✅ Rätt" : "❌ Fel"} (Rätt: ${expectedGenotypes.join(", ")})</p>`;
    resultHTML += `<p>Fenotyper: ${phenotypeCorrect ? "✅ Rätt" : "❌ Fel"} (Rätt: ${expectedPhenotypes.join(", ")})</p>`;
    resultHTML += `<p>Klyvningstal: ${ratioCorrect ? "✅ Rätt" : "❌ Fel"} (Rätt: ${expectedRatio})</p>`;

    resultDiv.innerHTML = resultHTML;
  });

});
