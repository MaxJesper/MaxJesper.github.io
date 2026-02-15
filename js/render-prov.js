function renderProv({ jsonPath, mountId, mode = "exam" }) {
  const mount = document.getElementById(mountId);
  fetch(jsonPath)
    .then(r => r.json())
    .then(data => {
      mount.innerHTML = data.sections.map(section => {
        return `
          <section class="prov-section">
            <h2>${section.title}</h2>
            ${section.questions.map((qObj, index) => {
              if (mode === "facit") {
                return `
                  <div class="prov-item">
                    <p><strong>${index + 1}. ${qObj.q}</strong></p>
                    <p class="facit-text">${qObj.a}</p>
                  </div>
                `;
              } else {
                const lines = qObj.lines || 4;
                const lineHtml = Array.from({ length: lines })
                  .map(() => `<div class="prov-line"></div>`)
                  .join("");
                return `
                  <div class="prov-item">
                    <p><strong>${index + 1}. ${qObj.q}</strong></p>
                    ${lineHtml}
                  </div>
                `;
              }
            }).join("")}
          </section>
        `;
      }).join("");
    });
}
