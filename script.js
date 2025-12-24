async function loadCSV(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("Failed to load CSV: " + path + " (" + res.status + ")");
  return (await res.text()).trim();
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

function buildGenreDatasets(headers, rows) {
  const decadeKey = headers[0];
  const genres = headers.slice(1);
  const labels = rows.map(r => r[decadeKey]);

  const datasets = genres.map(g => ({
    label: g,
    data: rows.map(r => Number(r[g])),
    borderWidth: 1.5,
    fill: true,
    stack: "genres",
    tension: 0.3
  }));

  return { labels, datasets };
}

function buildTensionSeries(rows) {
  const labels = rows.map(r => r.decade);
  const data = rows.map(r => Number(r.tension_index));
  return { labels, data };
}

async function main() {
  // --- Chart 1: Genres (stacked area) ---
  const genreCSV = await loadCSV("music_genres.csv");
  const genreParsed = parseCSV(genreCSV);
  const genreData = buildGenreDatasets(genreParsed.headers, genreParsed.rows);

  new Chart(document.getElementById("genreChart"), {
    type: "line",
    data: genreData,
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      },
      scales: {
        y: {
          stacked: true,
          beginAtZero: true,
          title: { display: true, text: "Relative popularity (%)" }
        },
        x: { title: { display: true, text: "Decade" } }
      }
    }
  });

  // --- Chart 2: Tension index ---
  const contextCSV = await loadCSV("context_events.csv");
  const contextParsed = parseCSV(contextCSV);
  const contextRows = contextParsed.rows;

  const tension = buildTensionSeries(contextRows);

  new Chart(document.getElementById("tensionChart"), {
    type: "bar",
    data: {
      labels: tension.labels,
      datasets: [{
        label: "Tension index (0–100)",
        data: tension.data,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: "Tension index" }
        },
        x: { title: { display: true, text: "Decade" } }
      }
    }
  });
}

main().catch(console.error);
