document.addEventListener("DOMContentLoaded", () => {

  const offspring = [
    document.getElementById("cell0"),
    document.getElementById("cell1"),
    document.getElementById("cell2"),
    document.getElementById("cell3")
  ];

  const genotypeBoxes = document.querySelectorAll(".genotype");
  const phenotypeBoxes = document.querySelectorAll(".phenotype");
  const ratioInput = document.getElementById("ratio");
  const result = document.getElementById("result");

  const correctPunnett = ["Ss","Ss","ss","ss"];
  const correctGenotypes = ["Ss","ss"];
  const correctPhenotypes = ["Grå starr","Frisk"];
  const correctRatio = "2:2";

  document.getElementById("check").onclick = () => {
    let score = 0;
    let max = 0;

    offspring.forEach((cell, i) => {
      max++;
      if (cell.value.trim() === correctPunnett[i]) score++;
    });

    genotypeBoxes.forEach(box => {
      max++;
      if (box.checked && correctGenotypes.includes(box.value)) score++;
    });

    phenotypeBoxes.forEach(box => {
      max++;
      if (box.checked && correctPhenotypes.includes(box.value)) score++;
    });

    max++;
    if (ratioInput.value.trim() === correctRatio) score++;

    result.innerHTML = `<strong>Resultat:</strong> ${score} av ${max} poäng`;
  };

});
