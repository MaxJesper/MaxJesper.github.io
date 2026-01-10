document.addEventListener("DOMContentLoaded", () => {

  const father = [father0, father1];
  const mother = [mother0, mother1];
  const cells = [cell0, cell1, cell2, cell3];

  const resultDiv = document.getElementById("result");
  const correctColumn = document.getElementById("correctColumn");
  const correctPunnett = document.getElementById("correctPunnett");

  document.getElementById("checkAnswers").addEventListener("click", () => {

    resultDiv.textContent = "";
    correctColumn.style.display = "none";
    correctPunnett.innerHTML = "";

    // Kontrollera att allt är ifyllt
    const allFilled =
      [...father, ...mother, ...cells].every(i => i.value.trim() !== "");

    if (!allFilled) {
      resultDiv.textContent = "Fyll i alla rutor först.";
      return;
    }

    // Korrekt Punnett-resultat
    const correct = [
      father[0].value + mother[0].value,
      father[1].value + mother[0].value,
      father[0].value + mother[1].value,
      father[1].value + mother[1].value
    ];

    // Jämför (ordning oviktig, Ss = sS)
    let allRight = true;

    for (let i = 0; i < 4; i++) {
      const student = cells[i].value.split("").sort().join("");
      const corr = correct[i].split("").sort().join("");
      if (student !== corr) {
        allRight = false;
      }
    }

    if (allRight) {
      resultDiv.textContent = "✅ Rätt!";
      return;
    }

    // Visa korrekt Punnett-kvadrat
    correctColumn.style.display = "block";

    const template = `
      <div></div>
      <div class="headerCell">♂ ${father[0].value}</div>
      <div class="headerCell">♂ ${father[1].value}</div>

      <div class="sideCell">♀ ${mother[0].value}</div>
      <input class="offspringCell" value="${correct[0]}" readonly>
      <input class="offspringCell" value="${correct[1]}" readonly>

      <div class="sideCell">♀ ${mother[1].value}</div>
      <input class="offspringCell" value="${correct[2]}" readonly>
      <input class="offspringCell" value="${correct[3]}" readonly>
    `;

    correctPunnett.innerHTML = template;
    resultDiv.textContent = "❌ Inte helt rätt – se korrekt korsningsschema till höger.";

  });

});
