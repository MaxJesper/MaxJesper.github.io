document.addEventListener("DOMContentLoaded", () => {

  // --- DOM ---
  const father = [father0, father1];
  const mother = [mother0, mother1];
  const cells  = [cell0, cell1, cell2, cell3];

  const taskTitle    = document.getElementById("taskTitle");
  const taskText     = document.getElementById("taskText");
  const taskExtra    = document.getElementById("taskExtra");
  const formatHint   = document.getElementById("formatHint");
  const taskCounter  = document.getElementById("taskCounter");

  const resultDiv       = document.getElementById("result");
  const correctColumn   = document.getElementById("correctColumn");
  const correctPunnett  = document.getElementById("correctPunnett");
  const correctSummary  = document.getElementById("correctSummary");

  // --- TOPPBAR: meny + back ---
  const menuBtn = document.getElementById("menuBtn");
  const menuOverlay = document.getElementById("menuOverlay");
  const closeMenuLink = document.getElementById("closeMenuLink");
  const backBtn = document.getElementById("backBtn");

  function openMenu() {
    menuOverlay.style.display = "block";
    menuOverlay.setAttribute("aria-hidden", "false");
  }
  function closeMenu() {
    menuOverlay.style.display = "none";
    menuOverlay.setAttribute("aria-hidden", "true");
  }
  menuBtn.addEventListener("click", openMenu);
  closeMenuLink.addEventListener("click", (e) => { e.preventDefault(); closeMenu(); });
  menuOverlay.addEventListener("click", (e) => {
    if (e.target === menuOverlay) closeMenu();
  });

  // Tillbaka: försök historik, annars tillbaka till genetik-start
  backBtn.addEventListener("click", () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "../genetik.html";
  });

  // --- Uppgiftsbank ---
  // Vi anger "gameter" (2 st för varje förälder) som facit.
  // Eleverna fyller i gameter + 4 rutor.
  // För X-länkat använder vi t.ex. XH, Xh, Y
  const tasks = [
    {
      id: 1,
      title: "Uppgift 1 – Grå starr (autosomal dominant)",
      text:
        "Grå starr är en ärftlig ögonsjukdom. Den är dominant (S). " +
        "En heterozygot kvinna (Ss) med grå starr får barn med en frisk man (ss). " +
        "Vilka genotyper kan barnen få? Visa med korsningsschema.",
      extra: "Tips: Gameterna blir S och s från mamman, och s och s från pappan.",
      hint: "Skriv gameter som t.ex. S / s. Skriv barnens genotyper som t.ex. Ss eller ss.",
      motherGametes: ["S", "s"],
      fatherGametes: ["s", "s"],
      summary: "Fenotyp: 50% grå starr (Ss), 50% frisk (ss)."
    },
    {
      id: 2,
      title: "Uppgift 2 – Klassisk recessiv (autosomal recessiv)",
      text:
        "En sjukdom är recessiv (a). Två friska heterozygoter (Aa) får barn. " +
        "Vilka genotyper kan barnen få? Visa med korsningsschema.",
      extra: "Frisk = A_, sjuk = aa.",
      hint: "Gameter: A och a från båda. Barnens genotyper: AA, Aa, aa.",
      motherGametes: ["A", "a"],
      fatherGametes: ["A", "a"],
      summary: "Genotyp: 25% AA, 50% Aa, 25% aa. Fenotyp: 75% friska, 25% sjuka."
    },
    {
      id: 3,
      title: "Uppgift 3 – Autosomal dominant (heterozygot × heterozygot)",
      text:
        "En egenskap är autosomalt dominant (B). Två heterozygoter (Bb) får barn. " +
        "Vilka genotyper kan barnen få? Visa med korsningsschema.",
      extra: "Dominant fenotyp = B_. Recessiv fenotyp = bb.",
      hint: "Gameter: B och b från båda.",
      motherGametes: ["B", "b"],
      fatherGametes: ["B", "b"],
      summary: "Genotyp: 25% BB, 50% Bb, 25% bb. Fenotyp: 75% dominanta, 25% recessiva."
    },
    {
      id: 4,
      title: "Uppgift 4 – Könsbunden (X-länkad) färgblindhet",
      text:
        "Röd-grön färgblindhet är X-länkad recessiv (Xh). " +
        "En bärare kvinna (XH Xh) får barn med en man som ser normalt (XH Y). " +
        "Vilka genotyper kan barnen få? Visa med korsningsschema.",
      extra:
        "Använd gameter: Mamman ger XH eller Xh. Pappan ger XH eller Y.",
      hint:
        "Skriv gameter som XH, Xh, Y. Skriv barnen t.ex. XHXH, XHXh, XHY, XhY.",
      motherGametes: ["XH", "Xh"],
      fatherGametes: ["XH", "Y"],
      summary:
        "Döttrar: 50% XHXH (normal), 50% XHXh (bärare). Söner: 50% XHY (normal), 50% XhY (färgblind)."
    },
    {
      id: 5,
      title: "Uppgift 5 – Könsbunden (X-länkad) sjuk man × frisk kvinna",
      text:
        "En X-länkad recessiv sjukdom (Xh). En sjuk man (Xh Y) får barn med en kvinna som inte är bärare (XH XH). " +
        "Vilka genotyper kan barnen få? Visa med korsningsschema.",
      extra:
        "Mamman ger alltid XH. Pappan ger Xh eller Y.",
      hint:
        "Gameter: mamma XH/XH. pappa Xh/Y. Barn: döttrar blir bärare, söner blir friska.",
      motherGametes: ["XH", "XH"],
      fatherGametes: ["Xh", "Y"],
      summary:
        "Alla döttrar: XHXh (bärare). Alla söner: XHY (friska)."
    },
    {
      id: 6,
      title: "Uppgift 6 – Intermediär nedärvning (ofullständig dominans)",
      text:
        "Blomfärg nedärvs intermediärt: R = röd, W = vit, RW = rosa. " +
        "En rosa blomma (RW) korsas med en vit blomma (WW). " +
        "Vilka genotyper kan avkomman få? Visa med korsningsschema.",
      extra:
        "Intermediärt betyder att heterozygoten får en mellanfärg.",
      hint:
        "Gameter: RW ger R och W. WW ger W och W. Barn: RW eller WW.",
      motherGametes: ["R", "W"],
      fatherGametes: ["W", "W"],
      summary:
        "Genotyp: 50% RW (rosa), 50% WW (vit)."
    },
    {
      id: 7,
      title: "Uppgift 7 – Intermediär (rosa × rosa)",
      text:
        "Samma intermediära blomfärg: R = röd, W = vit, RW = rosa. " +
        "Två rosa blommor (RW × RW) korsas. Vilka genotyper får avkomman?",
      extra:
        "Detta ger typiskt en 1:2:1-fördelning.",
      hint:
        "Gameter: R och W från båda. Barn: RR, RW, WW.",
      motherGametes: ["R", "W"],
      fatherGametes: ["R", "W"],
      summary:
        "Genotyp: 25% RR (röd), 50% RW (rosa), 25% WW (vit)."
    },
    {
      id: 8,
      title: "Uppgift 8 – Autosomal recessiv (sjuk × bärare)",
      text:
        "En recessiv sjukdom (a). En sjuk person (aa) får barn med en bärare (Aa). " +
        "Vilka genotyper kan barnen få? Visa med korsningsschema.",
      extra:
        "Sjuk = aa. Bärare = Aa.",
      hint:
        "Gameter: aa ger a och a. Aa ger A och a. Barn: Aa eller aa.",
      motherGametes: ["a", "a"],
      fatherGametes: ["A", "a"],
      summary:
        "Genotyp: 50% Aa (friska bärare), 50% aa (sjuka)."
    }
  ];

  // --- Hjälpfunktioner ---
  function clearInputs() {
    [...father, ...mother, ...cells].forEach(i => i.value = "");
  }

  // Normaliserar genotyp för jämförelse:
  // - Tar bort mellanslag
  // - Plockar ut tokens: XH, Xh, Y eller enstaka alleler (A, a, R, W ...)
  // - Sorterar tokens i stabil ordning så t.ex. "sS" matchar "Ss", och "Y XH" matchar "XHY"
  function normalizeGenotype(str) {
    const s = (str || "").replace(/\s+/g, "");
    // tokens: X + 1 bokstav (t.ex. XH, Xh) eller Y eller en bokstav
    const tokens = s.match(/X[A-Za-z]|Y|[A-Za-z]/g) || [];

    const rank = (t) => {
      if (t.startsWith("X")) return 0;     // X först
      if (t === "Y") return 1;             // sen Y
      // autosomala alleler: versal före gemen
      const isUpper = (t === t.toUpperCase());
      return isUpper ? 2 : 3;
    };

    tokens.sort((a,b) => {
      const ra = rank(a), rb = rank(b);
      if (ra !== rb) return ra - rb;
      // inom samma rank: alfabetiskt
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    return tokens.join("");
  }

  function sameMultiset(a, b) {
    const na = a.map(x => normalizeGenotype(x)).sort();
    const nb = b.map(x => normalizeGenotype(x)).sort();
    if (na.length !== nb.length) return false;
    for (let i=0;i<na.length;i++) if (na[i] !== nb[i]) return false;
    return true;
  }

  function expectedGridForOrder(studentFather, studentMother) {
    // Bygg förväntad 2x2 baserat på elevens ordning på gameterna.
    // cell-index: 0=(m0,f0) 1=(m0,f1) 2=(m1,f0) 3=(m1,f1)
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

    const template = `
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
    correctPunnett.innerHTML = template;
    correctSummary.textContent = task.summary || "";
  }

  // --- Uppgiftshantering ---
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

    clearInputs();
  }

  // --- Rättning ---
  document.getElementById("checkAnswers").addEventListener("click", () => {
    const task = tasks[currentIndex];

    resultDiv.textContent = "";
    correctColumn.style.display = "none";
    correctPunnett.innerHTML = "";
    correctSummary.textContent = "";

    // Kontrollera att allt är ifyllt
    const allFilled = [...father, ...mother, ...cells].every(i => i.value.trim() !== "");
    if (!allFilled) {
      resultDiv.textContent = "Fyll i alla rutor först.";
      return;
    }

    // 1) Kontrollera gameter (ordning oviktig)
    const studentFather = father.map(x => x.value.trim());
    const studentMother = mother.map(x => x.value.trim());

    const okFatherGametes = sameMultiset(studentFather, task.fatherGametes);
    const okMotherGametes = sameMultiset(studentMother, task.motherGametes);

    // 2) Kontrollera rutor (utifrån elevens ordning)
    const expected = expectedGridForOrder(studentFather, studentMother);

    let allCellsRight = true;
    for (let i = 0; i < 4; i++) {
      const stud = normalizeGenotype(cells[i].value.trim());
      if (stud !== expected[i]) allCellsRight = false;
    }

    if (okFatherGametes && okMotherGametes && allCellsRight) {
      resultDiv.textContent = "✅ Rätt!";
      return;
    }

    // Fel: visa facit
    correctColumn.style.display = "block";
    renderCorrectPunnett(task);

    // Mer specifik feedback
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

  // --- Nästa/Töm ---
  document.getElementById("nextTask").addEventListener("click", () => {
    loadTask(currentIndex + 1);
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    resultDiv.textContent = "";
    correctColumn.style.display = "none";
    correctPunnett.innerHTML = "";
    correctSummary.textContent = "";
    clearInputs();
  });

  // Init
  loadTask(0);

});
