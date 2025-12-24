const ctx = document.getElementById('genreChart');

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['1920', '1940', '1960', '1980', '2000', '2020'],
    datasets: [
      {
        label: 'Jazz',
        data: [45, 40, 25, 10, 5, 3],
        borderWidth: 2
      },
      {
        label: 'Rock',
        data: [0, 5, 40, 30, 20, 15],
        borderWidth: 2
      },
      {
        label: 'Pop',
        data: [10, 15, 20, 35, 30, 25],
        borderWidth: 2
      },
      {
        label: 'Hip-Hop',
        data: [0, 0, 0, 10, 25, 35],
        borderWidth: 2
      },
      {
        label: 'Electronic',
        data: [0, 0, 0, 5, 20, 22],
        borderWidth: 2
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});
