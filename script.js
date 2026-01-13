async function loadCSV(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load CSV: ${path} (${res.status})`);
  return (await res.text()).trim();
}

function parseCSV(csvText) {
  const lines = csvText.split("\n").map(l => l.trim()).filter(Boolean);
  const headers = lines[0].split(",").map(h => h.trim());

  const rows = lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = values[i]));
    return obj;
  });

  return { headers, rows };
}

function renderTable(headers, rows) {
  const container = document.getElementById("tableContainer");
  const table = document.createElement("table");

  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach(r => {
    const tr = document.createElement("tr");
    headers.forEach(h => {
      const td = document.createElement("td");
      td.textContent = r[h];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.innerHTML = "";
  container.appendChild(table);
}

function decadeLabel(d) {
  return `${d}s`;
}

/* -------- Theme toggle -------- */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

function initThemeToggle() {
  const saved = localStorage.getItem("theme");
  const initial = saved || "light";
  applyTheme(initial);

  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

/* -------- KPIs -------- */
function renderKPIs(rows) {
  const el = document.getElementById("kpiRow");
  if (!el) return;

  const maxPol = rows.reduce((a, b) =>
    Number(b.polarization_index_0_100) > Number(a.polarization_index_0_100) ? b : a
  );

  const maxLongevity = rows.reduce((a, b) =>
    Number(b.avg_lifetime_weeks) > Number(a.avg_lifetime_weeks) ? b : a
  );

  const maxTop10 = rows.reduce((a, b) =>
    Number(b.pct_reached_top10) > Number(a.pct_reached_top10) ? b : a
  );

  el.innerHTML = `
    <div class="kpi">
      <div class="label">Peak polarization decade</div>
      <div class="value">${maxPol.decade}s (${Number(maxPol.polarization_index_0_100).toFixed(1)})</div>
    </div>
    <div class="kpi">
      <div class="label">Highest chart longevity</div>
      <div class="value">${maxLongevity.decade}s (${Number(maxLongevity.avg_lifetime_weeks).toFixed(2)} weeks)</div>
    </div>
    <div class="kpi">
      <div class="label">Highest Top 10 reach</div>
      <div class="value">${maxTop10.decade}s (${Number(maxTop10.pct_reached_top10).toFixed(2)}%)</div>
    </div>
  `;
}

async function main() {
  initThemeToggle();

  const csvPath = "data/merged_music_politics_by_decade.csv";
  const csvText = await loadCSV(csvPath);
  const { headers, rows } = parseCSV(csvText);

  // KPI row
  renderKPIs(rows);

  // ---- Dataset preview: fewer columns by default + toggle ----
  const importantCols = [
    "decade",
    "avg_lifetime_weeks",
    "pct_reached_top10",
    "avg_best_peak",
    "polarization_gap",
    "polarization_index_0_100"
  ];

  let showAll = false;
  const toggleBtn = document.getElementById("toggleColumnsBtn");

  const renderPreview = () => {
    const headersToShow = showAll
      ? headers
      : headers.filter(h => importantCols.includes(h));

    renderTable(headersToShow, rows);

    if (toggleBtn) {
      toggleBtn.textContent = showAll ? "Show fewer columns" : "Show all columns";
    }
  };

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      showAll = !showAll;
      renderPreview();
    });
  }

  renderPreview();

  // ---- Charts ----
  const labels = rows.map(r => decadeLabel(Number(r.decade)));

  // Music: avg_lifetime_weeks
  const musicValues = rows.map(r => Number(r.avg_lifetime_weeks));

  new Chart(document.getElementById("musicChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Avg weeks on Hot 100",
        data: musicValues,
        borderWidth: 2,
        tension: 0.25
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Weeks" }
        },
        x: {
          title: { display: true, text: "Decade" }
        }
      }
    }
  });

  // Politics: polarization_index_0_100
  const polValues = rows.map(r => Number(r.polarization_index_0_100));

  new Chart(document.getElementById("politicsChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Polarization index (0–100)",
        data: polValues,
        borderWidth: 2,
        tension: 0.25
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          title: { display: true, text: "Index (0–100)" }
        },
        x: {
          title: { display: true, text: "Decade" }
        }
      }
    }
  });
}

main().catch(err => {
  console.error(err);
  const container = document.getElementById("tableContainer");
  if (container) container.textContent = "Error loading dataset. Check file name/path.";
});
