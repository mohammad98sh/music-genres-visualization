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

async function main() {
  const csvPath = "data/merged_music_politics_by_decade.csv";
  const csvText = await loadCSV(csvPath);
  const { headers, rows } = parseCSV(csvText);

  // ---- Dataset preview: show fewer columns by default, allow toggle ----
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
  if (toggleBtn) {
    const render = () => {
      const headersToShow = showAll
        ? headers
        : headers.filter(h => importantCols.includes(h));

      renderTable(headersToShow, rows);
      toggleBtn.textContent = showAll ? "Show fewer columns" : "Show all columns";
    };

    toggleBtn.addEventListener("click", () => {
      showAll = !showAll;
      render();
    });

    render();
  } else {
    // Fallback if button not present in HTML
    renderTable(headers, rows);
  }

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
