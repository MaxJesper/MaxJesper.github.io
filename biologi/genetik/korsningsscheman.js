document.addEventListener("DOMContentLoaded", () => {
  // ===== UPPGIFTER =====
  const tasks = [
    {
      title: "Uppgift 1 – Grå starr",
      text: "Grå starr är en ärftlig ögonsjukdom. Den är dominant (S). En heterozygot kvinna (Ss) med grå starr gifter sig med en frisk man (ss). De får barn. Får dessa starr? Vilka olika möjligheter finns? Visa med korsningsschema.",
      father: "ss",
      mother: "Ss",
      correctGenotypes: ["Ss","Ss","ss","ss"],
      correctPhenotypes: ["Grå starr","Grå starr","Frisk","Frisk"],
      correctRatio: "2:2"
    },
    {
      title: "Uppgift 2 – Exempeltext",
      text: "Här skriver vi nästa uppgift senare.",
      father: "aa",
      mother: "Aa",
      correctGenotypes: ["Aa","Aa","aa","aa"],
      correctPhenotypes: ["Dominant","Dominant","Recessiv","Recessiv"],
      correctRatio: "2:2"
    }
  ];

  let currentTask = 0;

  const taskContainer = document.getElementById("taskContainer");
  const nextBtn = document.getElementById("nextTask");
  const prevBtn = document.getElementById("prevTask");

  // ===== Rendera uppgift =====
  function renderTask() {
    const task = tasks[currentTask];
    taskContainer.innerHTML = `
      <div class="parents">
        <label>Kvinnans genotyp: <input type="text" id="motherGenotype" maxlength="2" class="genInput" value="${task.mother}"></label>
        <label>Mannens genotyp: <input type="text" id="fatherGenotype" maxlength="2" class="genInput" value="${task.father}"></label>
      </div>

      <div class="punnett">
        <input type="text" class="offspringCell" id="cell0" readonly>
        <input type="text" class="offspringCell" id="cell1" readonly>
        <input type="text" class="offspringCell" id="cell2" readonly>
        <input type="text" class="offspringCell" id="cell3" readonly>
      </div>

      <div class="section">
        <h3>Avkommans genotyper</h3>
        <div class="checkboxes">
          <label><input type="checkbox" name="offspringGenotype" value="SS"> SS</label>
          <label><input type="checkbox" name="offspringGenotype" value="Ss"> Ss</label>
          <label><input type="checkbox" name="offspringGenotype" value="ss"> ss</label>
        </div>
      </div>

      <div class="section">
        <h3>Avkommans fenotyper</h3>
        <div class="checkboxes">
          <label><input type="checkbox" name="offspringPhenotype" value="Grå starr"> Grå starr</label>
          <label><input type="checkbox" name="offspringPhenotype" value="Frisk"> Frisk</label>
        </div>
      </div>

      <div class="section">
        <label>Klyvningstal (ex: 2:2): <input type="text" id="ratio" maxlength="5" placeholder="t.ex. 2:2"></label>
      </div>

      <button id="checkAnswers">Rätta svar</button>
      <div id="result"></div>
    `;

    // ==== Elementreferenser för den aktuella uppgiften ====
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

    // ==== Fyll Punnett-kvadraten automatiskt ====
    function fillPunnettSquare() {
      const f = fatherInput.value.toUpperCase().trim();
      const m = motherInput.value.toUpperCase().trim();

      if(f.length===2 && m.length===2){
        const fatherAlleles=[f[0],f[1]];
        const motherAlleles=[m[0],m[1]];

        punnettCells[0].value = fatherAlleles[0]+motherAlleles[0];
        punnettCells[1].value = fatherAlleles[0]+motherAlleles[1];
        punnettCells[2].value = fatherAlleles[1]+motherAlleles[0];
        punnettCells[3].value = fatherAlleles[1]+motherAlleles[1];
      } else {
        punnettCells.forEach(cell=>cell.value="");
      }
    }

    fatherInput.addEventListener("input", fillPunnettSquare);
    motherInput.addEventListener("input", fillPunnettSquare);
    fillPunnettSquare();

    // ==== Kontrollera svar ====
    checkBtn.addEventListener("click",()=>{
      let score=0;
      let maxScore=0;

      maxScore += offspringGenotypeOptions.length;
      offspringGenotypeOptions.forEach(input=>{
        if(input.checked && task.correctGenotypes.includes(input.value)) score++;
      });

      maxScore += offspringPhenotypeOptions.length;
      offspringPhenotypeOptions.forEach(input=>{
        if(input.checked && task.correctPhenotypes.includes(input.value)) score++;
      });

      maxScore +=1;
      if(ratioInput.value.trim()===task.correctRatio) score++;

      resultDiv.innerHTML=`<h3>Resultat</h3>
        <p>Du fick ${score} av ${maxScore} poäng.</p>
        <p>Bra jobbat! Kontrollera gärna svaren och testa igen för att bli snabbare.</p>`;
    });
  }

  renderTask();

  nextBtn.addEventListener("click", ()=>{
    if(currentTask < tasks.length-1) currentTask++;
    renderTask();
  });

  prevBtn.addEventListener("click", ()=>{
    if(currentTask > 0) currentTask--;
    renderTask();
  });

});
