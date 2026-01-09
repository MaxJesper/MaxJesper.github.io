document.addEventListener("DOMContentLoaded", () => {

  /* ===== UPPGIFTER ===== */
  const tasks = [
    {
      text: "Uppgift 1. Grå starr är en ärftlig ögonsjukdom. Den är dominant (S). En heterozygot kvinna (Ss) med grå starr gifter sig med en frisk man (ss). De får barn. Får dessa starr? Vilka olika möjligheter finns? Visa med korsningsschema."
    },
    {
      text: "Uppgift 2. (Text kommer senare)"
    }
  ];

  let currentTask = 0;

  /* ===== ELEMENT ===== */
  const taskText = document.getElementById("taskText");
  const inputs = document.querySelectorAll("input");
  const resultDiv = document.getElementById("result");

  /* ===== INIT ===== */
  renderTask();

  /* ===== NAV ===== */
  window.nextTask = () => {
    if (currentTask < tasks.length - 1) {
      currentTask++;
      renderTask();
    }
  };

  window.prevTask = () => {
    if (currentTask > 0) {
      currentTask--;
      renderTask();
    }
  };

  window.goBack = () => {
    window.location.href = "index.html";
  };

  function renderTask() {
    taskText.innerText = tasks[currentTask].text;
    resetAll();
  }

  function resetAll() {
    inputs.forEach(i => {
      if (i.type === "checkbox") i.checked = false;
      else i.value = "";
    });
    resultDiv.innerHTML = "";
  }

  /* ===== RÄTTNING ===== */
  document.getElementById("checkAnswers").onclick = () => {
    const correctCells = ["Ss", "Ss", "Ss", "Ss"];
    const userCells = [
      cell0.value, cell1.value, cell2.value, cell3.value
    ];

    let correct = true;
    for (let i = 0; i < 4; i++) {
      if (userCells[i] !== correctCells[i]) correct = false;
    }

    if (correct) {
      resultDiv.innerHTML = "<h3>✔ Rätt!</h3>";
    } else {
      resultDiv.innerHTML = `
        <h3>❌ Fel – korrekt schema:</h3>
        <div class="punnett-wrapper">
          <div class="punnett-grid">
            <div></div><div>♂ S</div><div>♂ s</div>
            <div>♀ s</div><div>Ss</div><div>Ss</div>
            <div>♀ s</div><div>Ss</div><div>Ss</div>
          </div>
        </div>`;
    }
  };

});
