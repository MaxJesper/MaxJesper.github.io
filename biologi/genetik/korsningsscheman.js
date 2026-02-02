document.addEventListener("DOMContentLoaded", () => {

  // --- DOM ---
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

  // --- Uppgiftsbank (15 st) ---
  // Notation:
  // - Autosomal: A/a, B/b, etc.
  // - X-länkad: XH (normal), Xh (sjuk allel), Y
  // - Intermediär: R/W (RW = mellanfärg)
  const tasks = [
    {
      id: 1,
      title: "Uppgift 1 – Cystisk fibros (autosomal recessiv)",
      text:
        "Cystisk fibros är en autosomal recessiv sjukdom (f). Två friska bärare (Ff) får barn. " +
        "Visa genotyperna med korsningsschema och ange vilka fenotyper som uppstår (och i vilken andel).",
      extra: "Frisk = F_, sjuk = ff.",
      hint: "Gameter: F och f från båda.",
      motherGametes: ["F", "f"],
      fatherGametes: ["F", "f"],
      phenotype: "3/4 blir friska, 1/4 får cystisk fibros."
    },
    {
      id: 2,
      title: "Uppgift 2 – PKU (fenylketonuri) (autosomal recessiv)",
      text:
        "PKU är autosomalt recessivt (p). Två bärare (Pp) får barn. " +
        "Visa genotyperna med korsningsschema och ange fenotyper och andelar.",
      extra: "Frisk = P_, sjuk = pp (om obehandlad leder det till allvarliga symtom).",
      hint: "Gameter: P och p från båda.",
      motherGametes: ["P", "p"],
      fatherGametes: ["P", "p"],
      phenotype: "3/4 blir friska, 1/4 får PKU."
    },
    {
      id: 3,
      title: "Uppgift 3 – Albinism (autosomal recessiv)",
      text:
        "Albinism är autosomalt recessivt (a). En person med albinism (aa) får barn med en bärare (Aa). " +
        "Visa korsningsschema och ange fenotyper och andelar.",
      extra: "Normal pigmentering = A_, albinism = aa.",
      hint: "Gameter: a/a från aa och A/a från Aa.",
      motherGametes: ["a", "a"],
      fatherGametes: ["A", "a"],
      phenotype: "1/2 får normal pigmentering (bärare), 1/2 får albinism."
    },
    {
      id: 4,
      title: "Uppgift 4 – Sickle cell (autosomal recessiv i förenklad modell)",
      text:
        "Sickle cell-sjukdom behandlas här som autosomalt recessiv (s). Två bärare (Ss) får barn. " +
        "Visa korsningsschema och ange fenotyper och andelar.",
      extra: "Frisk = S_, sjuk = ss. (Förenklad modell för skolnivå.)",
      hint: "Gameter: S och s från båda.",
      motherGametes: ["S", "s"],
      fatherGametes: ["S", "s"],
      phenotype: "3/4 blir friska, 1/4 får sickle cell-sjukdom."
    },
    {
      id: 5,
      title: "Uppgift 5 – Huntingtons sjukdom (autosomal dominant)",
      text:
        "Huntingtons sjukdom är autosomalt dominant (H). En heterozygot sjuk person (Hh) får barn med en frisk person (hh). " +
        "Visa korsningsschema och ange fenotyper och andelar.",
      extra: "Sjuk = H_, frisk = hh.",
      hint: "Gameter: H/h från Hh och h/h från hh.",
      motherGametes: ["H", "h"],
      fatherGametes: ["h", "h"],
      phenotype: "1/2 får Huntingtons sjukdom, 1/2 blir friska."
    },
    {
      id: 6,
      title: "Uppgift 6 – Achondroplasi (autosomal dominant, förenklad)",
      text:
        "Achondroplasi (kortväxthetstyp) behandlas här som autosomalt dominant (A). En heterozygot (Aa) får barn med en frisk (aa). " +
        "Visa korsningsschema och ange fenotyper och andelar.",
      extra: "Dominant fenotyp = A_. Recessiv = aa.",
      hint: "Gameter: A/a från Aa och a/a från aa.",
      motherGametes: ["A", "a"],
      fatherGametes: ["a", "a"],
      phenotype: "1/2 får den dominanta egenskapen, 1/2 får den recessiva."
    },
    {
      id: 7,
      title: "Uppgift 7 – Grå starr (autosomal dominant)",
      text:
        "Grå starr är dominant (S). En heterozygot kvinna (Ss) får barn med en frisk man (ss). " +
        "Visa korsningsschema och ange fenotyper och andelar.",
      extra: "Sjuk = S_, frisk = ss.",
      hint: "Gameter: S/s från Ss och s/s från ss.",
      motherGametes: ["S", "s"],
      fatherGametes: ["s", "s"],
      phenotype: "1/2 får grå starr, 1/2 är friska."
    },
    {
      id: 8,
      title: "Uppgift 8 – Polydaktyli (extra fingrar/tår) (autosomal dominant, förenklad)",
      text:
        "Polydaktyli behandlas här som autosomalt dominant (P). En heterozygot (Pp) får barn med en frisk (pp). " +
        "Visa korsningsschema och ange fenotyper och andelar.",
      extra: "Dominant fenotyp = P_. Recessiv = pp.",
      hint: "Gameter: P/p från Pp och p/p från pp.",
      motherGametes: ["P", "p"],
      fatherGametes: ["p", "p"],
      phenotype: "1/2 får polydaktyli, 1/2 får inte polydaktyli."
    },
    {
      id: 9,
      title: "Uppgift 9 – Röd-grön färgblindhet (X-länkad recessiv) – bärare mamma",
      text:
        "Röd-grön färgblindhet är X-länkad recessiv (Xh). En bärare kvinna (XH Xh) får barn med en man som ser normalt (XH Y). " +
        "Visa korsningsschema och ange fenotyper och andelar.",
      extra: "Mamman ger XH eller Xh. Pappan ger XH eller Y.",
      hint: "Gameter: XH/Xh och XH/Y.",
      motherGametes: ["XH", "Xh"],
      fatherGametes: ["XH", "Y"],
      phenotype: "Inga flickor blir sjuka. 1/2 av pojkarna blir sjuka och 1/2 av pojkarna blir friska."
    },
    {
      id: 10,
      title: "Uppgift 10 – Hemofili (X-länkad recessiv) – bärare mamma",
      text:
        "Hemofili är X-länkad recessiv (Xh). En bärare kvinna (XH Xh) får barn med en frisk man (XH Y). " +
        "Visa korsningsschema och ange fenotyper och andelar.",
      extra: "Samma korsningstyp som färgblindhet, men annan sjukdom.",
      hint: "Gameter: XH/Xh och XH/Y.",
      motherGametes: ["XH", "Xh"],
      fatherGametes: ["XH", "Y"],
      phenotype: "Inga flickor blir sjuka. 1/2 av pojkarna får hemofili, 1/2 blir friska."
    },
    {
      id: 11,
      title: "Uppgift 11 – Duchennes muskeldystrofi (X-länkad recessiv) – sjuk man",
      text:
        "Duchennes muskeldystrofi är X-länkad recessiv (Xh). En sjuk man (Xh Y) får barn med en kvinna som inte är bärare (XH XH). " +
        "Visa korsningsschema och ange fenotyper och andelar.",
      extra: "Tänk: döttrar får pappans X, söner får pappans Y.",
      hint: "Gameter: mamma XH/XH och pappa Xh/Y.",
      motherGametes: ["XH", "XH"],
      fatherGametes: ["Xh", "Y"],
      phenotype: "Inga barn blir sjuka. Alla flickor blir bärare. Alla pojkar blir friska."
    },
    {
      id: 12,
      title: "Uppgift 12 – X-länkad recessiv: sjuk mamma × frisk pappa",
      text:
        "En X-länkad recessiv sjukdom (Xh). En sjuk kvinna (Xh Xh) får barn med en frisk man (XH Y). " +
        "Visa korsningsschema och ange fenotyper och andelar.",
      extra: "Mamman ger bara Xh. Pappan ger XH eller Y.",
      hint: "Gameter: mamma Xh/Xh och pappa XH/Y.",
      motherGametes: ["Xh", "Xh"],
      fatherGametes: ["XH", "Y"],
      phenotype: "Alla döttrar blir bärare (friska). Alla söner blir sjuka."
    },
    {
      id: 13,
      title: "Uppgift 13 – Intermediär nedärvning: rosa × vit",
      text:
        "Blomfärg nedärvs intermediärt: R = röd, W = vit, RW = rosa. En rosa blomma (RW) korsas med en vit (WW). " +
        "Visa korsningsschema och ange fenotyper och andelar.",
      extra: "Intermediärt = heterozygoten blir mellanfärg.",
      hint: "Gameter: R/W från RW och W/W från WW.",
      motherGametes: ["R", "W"],
      fatherGametes: ["W", "W"],
      phenotype: "1/2 blir rosa, 1/2 blir vita."
    },
    {
      id: 14,
      title: "Uppgift 14 – Intermediär nedärvning: rosa × rosa",
      text:
        "Samma intermediära blomfärg: R = röd, W = vit, RW = rosa. Två rosa (RW × RW) korsas. " +
        "Visa korsningsschema och ange fenotyper och andelar.",
      extra: "Detta ger en 1:2:1-fördelning.",
      hint: "Gameter: R och W från båda.",
      motherGametes: ["R", "W"],
      fatherGametes: ["R", "W"],
      phenotype: "1/4 blir röda, 1/2 blir rosa, 1/4 blir vita."
    },
    {
      id: 15,
      title: "Uppgift 15 – Tay-Sachs (autosomal recessiv)",
      text:
        "Tay-Sachs behandlas här som autosomalt recessivt (t). Två friska bärare (Tt) får barn. " +
        "Visa korsningsschema och ange fenotyper och andelar.",
      extra: "Frisk = T_, sjuk = tt.",
      hint: "Gameter: T och t från båda.",
      motherGametes: ["T", "t"],
      fatherGametes: ["T", "t"],
      phenotype: "3/4 blir friska, 1/4 får Tay-Sachs."
    }
  ];

  // --- Helpers ---
  function clearInputs() {
    [...father, ...mother, ...cells].forEach(i => i.value = "");
  }

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

    correctSummary.innerHTML = `<b>Tips:</b> Du ska redovisa både genotyper (via rutor) och fenotyper (knappen <b>Fenotyper</b>).`;
  }

  // --- Fenotyper: alltid tillgängligt (även utan ifyllnad) ---
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

  // --- Task handling ---
  let currentIndex = 0;

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

    // Fenotyper ska alltid vara möjliga — men vi stänger boxen när ny uppgift laddas
    phenotypeBox.style.display = "none";
    phenotypeBtn.textContent = "Fenotyper";
    phenotypeText.textContent = "";

    clearInputs();
  }

  // --- Rättning ---
  checkBtn.addEventListener("click", () => {
    const task = tasks[currentIndex];

    resultDiv.textContent = "";
    correctColumn.style.display = "none";
    correctPunnett.innerHTML = "";
    correctSummary.textContent = "";

    const allFilled = [...father, ...mother, ...cells].every(i => i.value.trim() !== "");
    if (!allFilled) {
      resultDiv.textContent = "Fyll i alla rutor först. (Du kan ändå klicka på Fenotyper för facit.)";
      return;
    }

    const studentFather = father.map(x => x.value.trim());
    const studentMother = mother.map(x => x.value.trim());

    const okFatherGametes = sameMultiset(studentFather, task.fatherGametes);
    const okMotherGametes = sameMultiset(studentMother, task.motherGametes);

    const expected = expectedGridForOrder(studentFather, studentMother);

    let allCellsRight = true;
    for (let i = 0; i < 4; i++) {
      const stud = normalizeGenotype(cells[i].value.trim());
      if (stud !== expected[i]) allCellsRight = false;
    }

    if (okFatherGametes && okMotherGametes && allCellsRight) {
      resultDiv.textContent = "✅ Rätt! (Fenotyper kan du alltid kolla via knappen Fenotyper.)";
      return;
    }

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
    clearInputs();
    // Låt fenotypboxen vara som den är (elever som tänker i huvudet kan ha den uppe)
  });

  // Starta
  loadTask(0);
});
