async function loadCSV(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("Failed to load CSV: " + res.status);
  const text = await res.text();
  return text.trim();
}

function parseCSV(csvText) {
  const lines = csvText.split("\n").map(l => l.trim()).filter(Boolean);
  const headers = lines[0].split(",").map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i]);
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

function buildDatasets(headers, rows) {
  // headers: decade, Jazz, Rock, Pop, ...
  const decadeKey = headers[0];
  const genres = headers.slice(1);

  const labels = rows.map(r => r[decadeKey]);

  const datasets = genres.map(g => ({
    label: g,
    data: rows.map(r => Number(r[g])),
    borderWidth: 2,
    tension: 0.25
  }));

  return { labels, datasets };
}

async function main() {
  const csvText = await loadCSV("data.csv");
  const { headers, rows } = parseCSV(csvText);

  renderTable(headers, rows);

  const { labels, datasets } = buildDatasets(headers, rows);

  const ctx = document.getElementById("genreChart");

  new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      },
      scales: {
        y: {
          title: { display: true, text: "Popularity (percentage)" },
          beginAtZero: true
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
  if (container) container.textContent = "Error loading dataset.";
});
