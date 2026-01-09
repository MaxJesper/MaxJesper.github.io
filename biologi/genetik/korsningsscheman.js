document.addEventListener("DOMContentLoaded", () => {
  const fatherGenInput = document.getElementById("fatherGen");
  const motherGenInput = document.getElementById("motherGen");

  const col1 = document.getElementById("col1");
  const col2 = document.getElementById("col2");
  const row1 = document.getElementById("row1");
  const row2 = document.getElementById("row2");

  const checkBtn = document.getElementById("checkBtn");
  const feedbackDiv = document.getElementById("feedback");

  function updatePunnett() {
    const father = fatherGenInput.value.toUpperCase();
    const mother = motherGenInput.value.toUpperCase();

    if (father.length !== 2 || mother.length !== 2) return;

    // Fyll kolumn- och radrutor
    col1.innerText = father[0];
    col2.innerText = father[1];
    row1.innerText = mother[0];
    row2.innerText = mother[1];
  }

  fatherGenInput.addEventListener("input", updatePunnett);
  motherGenInput.addEventListener("input", updatePunnett);

  checkBtn.onclick = () => {
    const father = fatherGenInput.value.toUpperCase();
    const mother = motherGenInput.value.toUpperCase();

    const expected = [
      father[0] + mother[0],
      father[1] + mother[0],
      father[0] + mother[1],
      father[1] + mother[1]
    ].sort();

    const user = [
      document.getElementById("c1").value.toUpperCase(),
      document.getElementById("c2").value.toUpperCase(),
      document.getElementById("c3").value.toUpperCase(),
      document.getElementById("c4").value.toUpperCase()
    ].sort();

    // Kontrollera genotyper
    let genoCorrect = JSON.stringify(expected) === JSON.stringify(user);

    // Enkelt exempel för fenotyper: anta A dominant och a recessiv
    let phenoExpected = user.map(g => g.includes("A") ? "dominant" : "recessiv").sort();
    let phenoUser = document.getElementById("phenoAnswer").value.toLowerCase().split(",").map(s => s.trim()).sort();
    let phenoCorrect = JSON.stringify(phenoExpected) === JSON.stringify(phenoUser);

    // Klyvningstal
    let counts = {AA:0, Aa:0, aa:0};
    user.forEach(g => counts[g] !== undefined ? counts[g]++ : null);
    let ratioExpected = `${counts.AA}:${counts.Aa}:${counts.aa}`;
    let ratioUser = document.getElementById("ratioAnswer").value.replace(/\s/g,'');
    let ratioCorrect = ratioExpected === ratioUser;

    feedbackDiv.innerHTML = `<h3>Resultat</h3>
      <p>Genotyper: ${genoCorrect ? "<span class='correct'>Rätt</span>" : "<span class='incorrect'>Fel</span> (Rätt: "+expected.join(", ")+")"}</p>
      <p>Fenotyper: ${phenoCorrect ? "<span class='correct'>Rätt</span>" : "<span class='incorrect'>Fel</span> (Rätt: "+phenoExpected.join(", ")+")"}</p>
      <p>Klyvningstal: ${ratioCorrect ? "<span class='correct'>Rätt</span>" : "<span class='incorrect'>Fel</span> (Rätt: "+ratioExpected+")"}</p>`;
  };
});
