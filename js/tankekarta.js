/* Tankekarta – återanvändbar komponent
 *
 * Montera med:  <div class="tankekarta-mount" data-href-base="#m"></div>
 *   data-href-base : prefix för länkarna. Varje ruta länkar till {href-base}{milstolpenummer}.
 *       - i studieguiden (samma sida):  data-href-base="#m"            → "#m3"
 *       - på startsidan / annan sida:    data-href-base="studieguide.html#m"
 *       - i lärarvyn (när den finns):    data-href-base="lektioner.html#m"
 *
 * En enda källa för innehållsförteckningen: redigera THEMES nedan så uppdateras alla vyer.
 */
(function () {
  const THEMES = [
    { namn: "Byggstenarna",            items: [["Cellen & cellkärnan", 1], ["Kromosomer & DNA", 2], ["Gener & arvsanlag", 3]] },
    { namn: "Från gen till egenskap",  items: [["Alleler, genotyp & fenotyp", 4], ["Proteinsyntesen", 5]] },
    { namn: "Celldelning & variation", items: [["Mitos & meios", 6], ["Mutationer", 7]] },
    { namn: "Nedärvning",              items: [["Ärftlighet & korsningar", 8], ["Arv & miljö", 9]] },
    { namn: "Tillämpningar",           items: [["Genetiska sjukdomar", 10], ["Genteknik & CRISPR", 11]] },
  ];

  const VW = 1180, VH = 820;
  const cX = 95, cY = VH / 2;
  const tCx = 360, tW = 200, tH = 48;
  const leafCx = 905, leafW = 470, leafH = 50;
  const topY = 46, botY = 774;

  const curve = (x1, y1, x2, y2) => {
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1} C ${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  };
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

  function buildSVG(hrefBase) {
    // platta lista med leaves i ordning → y-positioner
    const leaves = [];
    THEMES.forEach(t => t.items.forEach(it => leaves.push({ t: it[0], m: it[1] })));
    const step = (botY - topY) / (leaves.length - 1);
    leaves.forEach((lf, i) => (lf.y = topY + i * step));

    // tema-y = medel av dess leaves
    let idx = 0;
    THEMES.forEach(t => {
      const ys = t.items.map(() => leaves[idx++].y);
      t.cy = ys.reduce((a, b) => a + b, 0) / ys.length;
    });

    let svg = `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">`;

    // connectors
    svg += `<g fill="none" stroke="#cbd5e1" stroke-width="2">`;
    let li = 0;
    THEMES.forEach(t => {
      svg += `<path d="${curve(cX + 75, cY, tCx - tW / 2, t.cy)}"/>`;
      t.items.forEach(() => {
        const lf = leaves[li++];
        svg += `<path d="${curve(tCx + tW / 2, t.cy, leafCx - leafW / 2, lf.y)}" stroke="#a7f3d0"/>`;
      });
    });
    svg += `</g>`;

    // centrumnod
    svg += `<g>
      <rect x="${cX - 72}" y="${cY - 40}" width="144" height="80" rx="16" fill="var(--area-strong,#15803d)"/>
      <text x="${cX}" y="${cY - 4}" text-anchor="middle" fill="#fff" font-size="22" font-weight="800">GENETIK</text>
      <text x="${cX}" y="${cY + 20}" text-anchor="middle" fill="#d1fae5" font-size="12">11 milstolpar</text>
    </g>`;

    // temanoder
    THEMES.forEach(t => {
      svg += `<g>
        <rect x="${tCx - tW / 2}" y="${t.cy - tH / 2}" width="${tW}" height="${tH}" rx="12"
              fill="var(--area-soft,#f0fdf4)" stroke="var(--area-border,#bbf7d0)" stroke-width="1.5"/>
        <text x="${tCx}" y="${t.cy + 5}" text-anchor="middle" fill="var(--area-strong,#15803d)" font-size="15" font-weight="700">${esc(t.namn)}</text>
      </g>`;
    });

    // leaves (klickbara länkar med diskret milstolpenummer)
    leaves.forEach(lf => {
      const x = leafCx - leafW / 2, y = lf.y - leafH / 2;
      svg += `<a class="leaf" href="${hrefBase}${lf.m}" aria-label="${esc(lf.t)} – milstolpe ${lf.m}">
        <rect class="nod-rect" x="${x}" y="${y}" width="${leafW}" height="${leafH}" rx="12"/>
        <rect x="${x}" y="${y + 10}" width="5" height="${leafH - 20}" rx="2.5" fill="var(--area,#16a34a)"/>
        <text class="nod-text" x="${x + 24}" y="${lf.y + 6}" font-size="17">${esc(lf.t)}</text>
        <text x="${x + leafW - 18}" y="${lf.y + 5}" text-anchor="end" fill="#9ca3af" font-size="13" font-weight="700">M${lf.m}</text>
      </a>`;
    });

    svg += `</svg>`;
    return svg;
  }

  function injectStyleOnce() {
    if (document.getElementById("tankekarta-style")) return;
    const s = document.createElement("style");
    s.id = "tankekarta-style";
    s.textContent = `
      .tankekarta-mount{display:block;background:#fff;border:1px solid var(--area-border,#bbf7d0);
        border-radius:16px;padding:.6rem;box-shadow:0 2px 10px rgba(0,0,0,.05);overflow-x:auto;}
      .tankekarta-mount svg{display:block;width:100%;height:auto;min-width:680px;}
      .tankekarta-mount a.leaf{cursor:pointer;}
      .tankekarta-mount a.leaf .nod-rect{fill:#fff;stroke:var(--area-border,#bbf7d0);stroke-width:1.5;
        transition:fill .15s,stroke .15s;}
      .tankekarta-mount a.leaf:hover .nod-rect,.tankekarta-mount a.leaf:focus .nod-rect{
        fill:var(--area-soft,#f0fdf4);stroke:var(--area,#16a34a);stroke-width:2;}
      .tankekarta-mount a.leaf .nod-text{fill:#1f2937;font-weight:600;}
      .tankekarta-mount a.leaf:hover .nod-text{fill:var(--area-strong,#15803d);}
    `;
    document.head.appendChild(s);
  }

  function render() {
    injectStyleOnce();
    document.querySelectorAll(".tankekarta-mount").forEach(m => {
      const base = m.dataset.hrefBase || "studieguide.html#m";
      m.innerHTML = buildSVG(base);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
