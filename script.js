// ✅ Full Working script.js for MindMetrics Flip Game with 60s Timer + Auto-Lose

let selectedGender = '';
let cards = [];
let flipped = [];
let matched = [];
let timer;
let seconds = 0;
let attempts = 0;
let matchCount = 0;
let mismatchCount = 0;
let leaderboard = [];

function showForm() {
  document.getElementById('landing-screen').classList.add('hidden');
  document.getElementById('form-screen').classList.remove('hidden');
}

function selectGender(button, gender) {
  selectedGender = gender;
  document.querySelectorAll('#gender-select button').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
}

function startGame() {
  const name = document.getElementById('name').value.trim();
  const age = document.getElementById('age').value.trim();

  if (!name || !age || !selectedGender) {
    alert('Please fill out all fields');
    return;
  }

  document.getElementById('form-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  document.getElementById('player-name').textContent = name;
  document.getElementById('player-age').textContent = age;
  document.getElementById('gender').textContent = selectedGender;
  startTimer();
  initBoard();
}

function initBoard() {
  const emojis = ['🚀','🧠','🎮','💾','🎯','⚡','🛰️','💻'];
  cards = [...emojis, ...emojis].sort(() => 0.5 - Math.random());
  const board = document.getElementById('board');
  board.innerHTML = '';
  matched = [];
  flipped = [];
  matchCount = 0;
  mismatchCount = 0;
  attempts = 0;
  updateStats();

  cards.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.dataset.index = index;
    card.textContent = '';
    card.addEventListener('click', () => flipCard(card));
    board.appendChild(card);
  });
}

function flipCard(card) {
  if (card.classList.contains('matched') || flipped.includes(card)) return;
  if (flipped.length >= 2) return;

  card.classList.add('flipped');
  card.textContent = card.dataset.emoji;
  flipped.push(card);

  if (flipped.length === 2) {
    attempts++;
    if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
      matchCount++;
      flipped[0].classList.add('matched');
      flipped[1].classList.add('matched');
      matched.push(flipped[0], flipped[1]);
      flipped = [];
      if (matched.length === cards.length) endGame(true);
    } else {
      mismatchCount++;
      setTimeout(() => {
        flipped[0].classList.remove('flipped');
        flipped[1].classList.remove('flipped');
        flipped[0].textContent = '';
        flipped[1].textContent = '';
        flipped = [];
      }, 700);
    }
    updateStats();
  }
}

function updateStats() {
  document.getElementById('attempts').textContent = `Attempts: ${attempts}`;
  document.getElementById('matches').textContent = `Matches: ${matchCount}`;
  document.getElementById('mismatches').textContent = `Mismatches: ${mismatchCount}`;
  const accuracy = attempts > 0 ? ((matchCount / attempts) * 100).toFixed(1) : 0;
  document.getElementById('accuracy').textContent = `Accuracy: ${accuracy}%`;
}

function startTimer() {
  seconds = 0;
  timer = setInterval(() => {
    seconds++;
    document.getElementById('time').textContent = `Time: ${seconds}`;
    if (seconds >= 60) {
      clearInterval(timer);
      endGame(false);
    }
  }, 1000);
}

function endGame(won) {
  clearInterval(timer);
  document.getElementById('game-screen').classList.add('hidden');

  const summary = document.getElementById('summary');
  summary.innerHTML = `
    <strong>Name:</strong> ${document.getElementById('name').value}<br>
    <strong>Age:</strong> ${document.getElementById('age').value}<br>
    <strong>Gender:</strong> ${selectedGender}<br>
    <strong>Time:</strong> ${seconds}s<br>
    <strong>Matches:</strong> ${matchCount}<br>
    <strong>Mismatches:</strong> ${mismatchCount}<br>
    <strong>Attempts:</strong> ${attempts}<br>
    <strong>Accuracy:</strong> ${attempts > 0 ? ((matchCount / attempts) * 100).toFixed(1) : 0}%<br>
    <strong>Status:</strong> ${won ? 'Success' : 'Failed'}
  `;

  // ✅ Send game data to Flask for Excel storage
  fetch("http://127.0.0.1:5000/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: document.getElementById('name').value,
      age: parseInt(document.getElementById('age').value),
      gender: selectedGender,
      time: seconds,
      matches: matchCount,
      mismatches: mismatchCount,
      status: won ? "Won" : "Lost"
    })
  })
  .then(res => res.json())
  .then(data => console.log("Saved to Excel:", data))
  .catch(err => console.error("Save Error:", err));

  if (won) {
    document.getElementById('win-screen').classList.remove('hidden');
    updateLeaderboard();
    document.getElementById('leaderboard').style.display = 'block';
  } else {
    document.getElementById('gameover-screen').classList.remove('hidden');
    document.getElementById('leaderboard').style.display = 'none';
  }
}


function restartGame() {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('landing-screen').classList.remove('hidden');
  document.getElementById('leaderboard').style.display = 'none';
}

function updateLeaderboard() {
  const name = document.getElementById('name').value;
  leaderboard.push({ name, time: seconds, attempts });
  leaderboard.sort((a, b) => a.time - b.time || a.attempts - b.attempts);
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';
  leaderboard.slice(0, 5).forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} - ${entry.time}s, ${entry.attempts} attempts`;
    list.appendChild(li);
  });
}
