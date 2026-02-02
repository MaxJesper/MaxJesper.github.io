document.addEventListener("DOMContentLoaded", () => {

  // --- DOM (robust, inga globala id-variabler) ---
  const father0 = document.getElementById("father0");
  const father1 = document.getElementById("father1");
  const mother0 = document.getElementById("mother0");
  const mother1 = document.getElementById("mother1");

  const cell0 = document.getElementById("cell0");
  const cell1 = document.getElementById("cell1");
  const cell2 = document.getElementById("cell2");
  const cell3 = document.getElementById("cell3");

  const father = [father0, father1];
  const mother = [mother0, mother1];
  const cells  = [cell0, cell1, cell2, cell3];

  const taskTitle   = document.getElementById("taskTitle");
  const taskText    = document.getElementById("taskText");
  const taskExtra   = document.getElementById("taskExtra");
  const formatHint  = document.getElementById("formatHint");
  const taskCounter = document.getElementById("taskCounter");

  const resultDiv      = document.getElementById("result");
  const correctColumn  = document.getElementById("correctColumn");
  const correctPunnett = document.getElementById("correctPunnett");
  const correctSummary = document.getElementById("correctSummary");

  const checkBtn = document.getElementById("checkAnswers");
  const nextBtn  = document.getElementById("nextTask");
  const resetBtn = document.getElementById("resetBtn");

  const phenotypeBtn  = document.getElementById("showPhenotypes");
  const phenotypeBox  = document.getElementById("phenotypeBox");
  const phenotypeText = document.getElementById("phenotypeText");

  let hasCheckedThisTask = false;

  // --- Uppgiftsbank ---
  // Varje uppgift: gameter (2+2) + fenotyp-facittext.
  const tasks = [
    {
      id: 1,
      title: "Uppgift 1 – Grå starr (autosomal dominant)",
      text:
        "Grå starr är en ärftlig ögonsjukdom. Den är dominant (S). " +
        "En heterozygot kvinna (Ss) med grå starr får barn med en frisk man (ss). " +
        "Visa genotyperna med korsningsschema och ange vilka fenotyper som uppstår (och i vilken andel).",
      extra: "Tips: Mamman ger S eller s. Pappan ger s och s.",
      hint: "Gameter: S/s eller XH/Xh/Y. Rutor: genotyper (t.ex. Ss, ss, XHXh, XhY).",
      motherGametes: ["S", "s"],
      fatherGametes: ["s", "s"],
      phenotype: "1/2 får grå starr, 1/2 är friska."
    },
    {
      id: 2,
      title: "Uppgift 2 – Autosomal recessiv (två bärare)",
      text:
        "En sjukdom är recessiv (a). Två friska heterozygoter (Aa) får barn. " +
        "Visa genotyperna med korsningsschema och ange vilka fenotyper som uppstår (och i vilken andel).",
      extra: "Frisk = A_, sjuk = aa.",
      hint: "Gameter: A och a från båda.",
      motherGametes: ["A", "a"],
      fatherGametes: ["A", "a"],
      phenotype: "3/4 är friska, 1/4 blir sjuka."
    },
    {
      id: 3,
      title: "Uppgift 3 – Autosomal dominant (heterozygot × heterozygot)",
      text:
        "En egenskap är autosomalt dominant (B). Två heterozygoter (Bb) får barn. " +
        "Visa genotyperna med korsningsschema och ange vilka fenotyper som uppstår (och i vilken andel).",
      extra: "Dominant fenotyp = B_. Recessiv fenotyp = bb.",
      hint: "Gameter: B och b från båda.",
      motherGametes: ["B", "b"],
      fatherGametes: ["B", "b"],
      phenotype: "3/4 visar den dominanta egenskapen, 1/4 visar den recessiva."
    },
    {
      id: 4,
      title: "Uppgift 4 – Könsbunden X-länkad recessiv (bärare mamma)",
      text:
        "Röd-grön färgblindhet är X-länkad recessiv (Xh). " +
        "En bärare kvinna (XH Xh) får barn med en man som ser normalt (XH Y). " +
        "Visa genotyperna med korsningsschema och ange vilka fenotyper som uppstår (och i vilken andel).",
      extra: "Mamman ger XH eller Xh. Pappan ger XH eller Y.",
      hint: "Gameter: XH, Xh, Y. Rutor: XHXH, XHXh, XHY, XhY.",
      motherGametes: ["XH", "Xh"],
      fatherGametes: ["XH", "Y"],
      phenotype: "Inga flickor blir sjuka. 1/2 av pojkarna blir sjuka, 1/2 av pojkarna blir friska."
    },
    {
      id: 5,
      title: "Uppgift 5 – Könsbunden X-länkad recessiv (sjuk man)",
      text:
        "En X-länkad recessiv sjukdom (Xh). En sjuk man (Xh Y) får barn med en kvinna som inte är bärare (XH XH). " +
        "Visa genotyperna med korsningsschema och ange vilka fenotyper som uppstår (och i vilken andel).",
      extra: "Mamman ger alltid XH. Pappan ger Xh eller Y.",
      hint: "Tänk: döttrar får pappans Xh, söner får pappans Y.",
      motherGametes: ["XH", "XH"],
      fatherGametes: ["Xh", "Y"],
      phenotype: "Inga barn blir sjuka. Alla flickor blir bärare. Alla pojkar blir friska."
    },
    {
      id: 6,
      title: "Uppgift 6 – Intermediär nedärvning (rosa × vit)",
      text:
        "Blomfärg nedärvs intermediärt: R = röd, W = vit, RW = rosa. " +
        "En rosa blomma (RW) korsas med en vit blomma (WW). " +
        "Visa genotyperna med korsningsschema och ange vilka fenotyper som uppstår (och i vilken andel).",
      extra: "Intermediärt = heterozygoten får en mellanfärg.",
      hint: "Gameter: R/W från RW och W/W från WW.",
      motherGametes: ["R", "W"],
      fatherGametes: ["W", "W"],
      phenotype: "1/2 blir rosa, 1/2 blir vita."
    },
    {
      id: 7,
      title: "Uppgift 7 – Intermediär nedärvning (rosa × rosa)",
      text:
        "Samma intermediära blomfärg: R = röd, W = vit, RW = rosa. " +
        "Två rosa blommor (RW × RW) korsas. " +
        "Visa genotyperna med korsningsschema och ange vilka fenotyper som uppstår (och i vilken andel).",
      extra: "Detta ger ofta en 1:2:1-fördelning.",
      hint: "Gameter: R och W från båda.",
      motherGametes: ["R", "W"],
      fatherGametes: ["R", "W"],
      phenotype: "1/4 blir röda, 1/2 blir rosa, 1/4 blir vita."
    },
    {
      id: 8,
      title: "Uppgift 8 – Autosomal recessiv (sjuk × bärare)",
      text:
        "En recessiv sjukdom (a). En sjuk person (aa) får barn med en bärare (Aa). " +
        "Visa genotyperna med korsningsschema och ange vilka fenotyper som uppstår (och i vilken andel).",
      extra: "Sjuk = aa. Bärare = Aa.",
      hint: "Gameter: a/a från aa och A/a från Aa.",
      motherGametes: ["a", "a"],
      fatherGametes: ["A", "a"],
      phenotype: "1/2 blir friska bärare, 1/2 blir sjuka."
    }
  ];

  // --- Helpers ---
  function clearInputs() {
    [...father, ...mother, ...cells].forEach(i => i.value = "");
  }

  // Normalisera genotyp:
  // - tar bort mellanslag
  // - tokens: XH, Xh, Y eller enstaka alleler
  // - sorterar så "sS" matchar "Ss" osv.
  function normalizeGenotype(str) {
    const s = (str || "").replace(/\s+/g, "");
    const tokens = s.match(/X[A-Za-z]|Y|[A-Za-z]/g) || [];

    const rank = (t) => {
      if (t.startsWith("X")) return 0;
      if (t === "Y") return 1;
      const isUpper = (t === t.toUpperCase());
      return isUpper ? 2 : 3;
    };

    tokens.sort((a, b) => {
      const ra = rank(a), rb = rank(b);
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b);
    });

    return tokens.join("");
  }

  function sameMultiset(a, b) {
    const na = a.map(x => normalizeGenotype(x)).sort();
    const nb = b.map(x => normalizeGenotype(x)).sort();
    if (na.length !== nb.length) return false;
    for (let i = 0; i < na.length; i++) if (na[i] !== nb[i]) return false;
    return true;
  }

  function expectedGridForOrder(studentFather, studentMother) {
    const f0 = normalizeGenotype(studentFather[0]);
    const f1 = normalizeGenotype(studentFather[1]);
    const m0 = normalizeGenotype(studentMother[0]);
    const m1 = normalizeGenotype(studentMother[1]);

    // cell-index: 0=(m0,f0) 1=(m0,f1) 2=(m1,f0) 3=(m1,f1)
    return [
      normalizeGenotype(m0 + f0),
      normalizeGenotype(m0 + f1),
      normalizeGenotype(m1 + f0),
      normalizeGenotype(m1 + f1),
    ];
  }

  function renderCorrectPunnett(task) {
    const f = task.fatherGametes.map(normalizeGenotype);
    const m = task.motherGametes.map(normalizeGenotype);

    const correct = [
      normalizeGenotype(m[0] + f[0]),
      normalizeGenotype(m[0] + f[1]),
      normalizeGenotype(m[1] + f[0]),
      normalizeGenotype(m[1] + f[1]),
    ];

    correctPunnett.innerHTML = `
      <div></div>
      <div class="headerCell">♂ ${f[0]}</div>
      <div class="headerCell">♂ ${f[1]}</div>

      <div class="sideCell">♀ ${m[0]}</div>
      <input class="offspringCell" value="${correct[0]}" readonly>
      <input class="offspringCell" value="${correct[1]}" readonly>

      <div class="sideCell">♀ ${m[1]}</div>
      <input class="offspringCell" value="${correct[2]}" readonly>
      <input class="offspringCell" value="${correct[3]}" readonly>
    `;

    // Under facit-kvadraten kan du ha en kort påminnelse om fenotyp-facit
    correctSummary.innerHTML = `<b>Kom ihåg:</b> Ange även fenotyper. Tryck på knappen <b>Fenotyper</b> för facit.`;
  }

  // --- Task handling ---
  let currentIndex = 0;

  function resetPhenotypeUI() {
    hasCheckedThisTask = false;
    phenotypeBtn.disabled = true;
    phenotypeBtn.textContent = "Fenotyper";
    phenotypeBox.style.display = "none";
    phenotypeText.textContent = "";
  }

  function loadTask(index) {
    currentIndex = (index + tasks.length) % tasks.length;
    const task = tasks[currentIndex];

    taskTitle.textContent = task.title;
    taskText.textContent  = task.text;
    taskExtra.textContent = task.extra || "";
    formatHint.textContent = "Format: " + (task.hint || "Fyll i gameter och rutor.");
    taskCounter.textContent = `(${currentIndex + 1}/${tasks.length})`;

    resultDiv.textContent = "";
    correctColumn.style.display = "none";
    correctPunnett.innerHTML = "";
    correctSummary.textContent = "";

    resetPhenotypeUI();
    clearInputs();
  }

  // --- Fenotyper (toggle) ---
  phenotypeBtn.addEventListener("click", () => {
    const task = tasks[currentIndex];

    if (phenotypeBox.style.display === "none") {
      phenotypeText.textContent = task.phenotype || "Ingen fenotyp angiven för denna uppgift.";
      phenotypeBox.style.display = "block";
      phenotypeBtn.textContent = "Dölj fenotyper";
    } else {
      phenotypeBox.style.display = "none";
      phenotypeBtn.textContent = "Fenotyper";
    }
  });

  // --- Rättning ---
  checkBtn.addEventListener("click", () => {
    const task = tasks[currentIndex];

    resultDiv.textContent = "";
    correctColumn.style.display = "none";
    correctPunnett.innerHTML = "";
    correctSummary.textContent = "";

    // Stäng fenotyper om den var öppen (så elever inte råkar ha facit synligt)
    phenotypeBox.style.display = "none";
    phenotypeBtn.textContent = "Fenotyper";

    const allFilled = [...father, ...mother, ...cells].every(i => i.value.trim() !== "");
    if (!allFilled) {
      resultDiv.textContent = "Fyll i alla rutor först.";
      return;
    }

    // Lås upp fenotypknappen efter första rättningen
    hasCheckedThisTask = true;
    phenotypeBtn.disabled = false;

    // 1) gameter måste stämma (ordning oviktig)
    const studentFather = father.map(x => x.value.trim());
    const studentMother = mother.map(x => x.value.trim());

    const okFatherGametes = sameMultiset(studentFather, task.fatherGametes);
    const okMotherGametes = sameMultiset(studentMother, task.motherGametes);

    // 2) rutor måste stämma utifrån elevens ordning
    const expected = expectedGridForOrder(studentFather, studentMother);

    let allCellsRight = true;
    for (let i = 0; i < 4; i++) {
      const stud = normalizeGenotype(cells[i].value.trim());
      if (stud !== expected[i]) allCellsRight = false;
    }

    if (okFatherGametes && okMotherGametes && allCellsRight) {
      resultDiv.textContent = "✅ Rätt! (Glöm inte att redovisa fenotyper också – klicka på Fenotyper om du vill kolla facit.)";
      return;
    }

    // Fel: visa facit-kvadrat
    correctColumn.style.display = "block";
    renderCorrectPunnett(task);

    if (!okFatherGametes && !okMotherGametes) {
      resultDiv.textContent = "❌ Gameterna för både mamma och pappa stämmer inte – se facit till höger.";
    } else if (!okFatherGametes) {
      resultDiv.textContent = "❌ Pappans gameter stämmer inte – se facit till höger.";
    } else if (!okMotherGametes) {
      resultDiv.textContent = "❌ Mammans gameter stämmer inte – se facit till höger.";
    } else {
      resultDiv.textContent = "❌ Gameterna är rätt, men någon ruta i kvadraten är fel – se facit till höger.";
    }
  });

  // --- Nästa / Töm ---
  nextBtn.addEventListener("click", () => loadTask(currentIndex + 1));

  resetBtn.addEventListener("click", () => {
    resultDiv.textContent = "";
    correctColumn.style.display = "none";
    correctPunnett.innerHTML = "";
    correctSummary.textContent = "";
    resetPhenotypeUI();
    clearInputs();
  });

  // Starta
  loadTask(0);
});
