const tasksCount = 6;
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const inputsDiv = document.getElementById("inputs");
const resultDiv = document.getElementById("result");
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");

let tasks = Array(tasksCount).fill().map((_, i) => `Task ${i + 1}`);
let startAngle = 0;
let spinAngle = 0;
let spinning = false;

// Audio for spinning
const spinAudio = new Audio("spin-sound.mp3");
spinAudio.loop = true;

const storageKey = "darkMode_thisPage";

function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const size = 500;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

function getColors() {
  const rootStyles = getComputedStyle(document.body);
  return rootStyles.getPropertyValue("--colors").split(",").map(c => c.trim());
}

function createInputs() {
  inputsDiv.innerHTML = "";
  for (let i = 0; i < tasksCount; i++) {
    const inp = document.createElement("input");
    inp.type = "text";
    inp.placeholder = `Task ${i + 1}`;
    inp.id = `task${i}`;
    inp.value = tasks[i];
    inp.addEventListener("input", () => {
      tasks[i] = inp.value.trim() || `Task ${i + 1}`;
      drawWheel();
    });
    inputsDiv.appendChild(inp);
  }
}

function drawWheel() {
  const arc = (Math.PI * 2) / tasksCount;
  const colors = getColors();
  const centerX = 250;
  const centerY = 250;
  const radius = 250;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < tasksCount; i++) {
    const angle = startAngle + i * arc;
    ctx.fillStyle = colors[i];

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + arc);
    ctx.closePath();
    ctx.fill();

    const wheelTextColor = document.body.classList.contains('dark') ? "#fff" : "#000";

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle + arc / 2);
    ctx.fillStyle = wheelTextColor;
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(tasks[i], radius - 20, 0);
    ctx.restore();
  }

  updateSelectedTask();
}

function getSelectedIndex() {
  const arc = (Math.PI * 2) / tasksCount;
  let normalizedAngle = startAngle % (Math.PI * 2);
  if (normalizedAngle < 0) normalizedAngle += Math.PI * 2;
  let topAngle = (normalizedAngle + Math.PI * 1.5) % (Math.PI * 2);
  let index = Math.floor(topAngle / arc);
  index = index % tasksCount;
  return index;
}

function updateSelectedTask() {
  const index = getSelectedIndex();
  resultDiv.textContent = `✅ Selected Task: ${tasks[index]}`;
}

function spin() {
  if (spinAngle <= 0) {
    spinning = false;
    updateSelectedTask();
    spinBtn.disabled = false;
    spinAudio.pause();
    spinAudio.currentTime = 0;
    return;
  }
  spinAngle -= 10;
  startAngle += (spinAngle / 1000) * Math.PI;
  drawWheel();
  requestAnimationFrame(spin);
}

function startSpin() {
  if (spinning) return;
  for (let i = 0; i < tasksCount; i++) {
    if (!tasks[i].trim()) {
      alert("Please enter all 6 tasks");
      return;
    }
  }
  spinning = true;
  spinBtn.disabled = true;
  spinAngle = Math.random() * 3000 + 3000;
  spinAudio.play();
  spin();
}

function applyTheme(dark) {
  if (dark) {
    document.body.classList.add("dark");
    themeToggle.checked = true;
    themeLabel.textContent = "🌙 Dark Mode";
    localStorage.setItem(storageKey, "true");
  } else {
    document.body.classList.remove("dark");
    themeToggle.checked = false;
    themeLabel.textContent = "🌞 Light Mode";
    localStorage.setItem(storageKey, "false");
  }
  drawWheel();
}

themeToggle.addEventListener("change", () => {
  applyTheme(themeToggle.checked);
});

function loadTheme() {
  const darkMode = localStorage.getItem(storageKey) === "true";
  applyTheme(darkMode);
}

spinBtn.addEventListener("click", startSpin);

setupCanvas();
createInputs();
loadTheme();
drawWheel();

window.addEventListener("resize", () => {
  setupCanvas();
  drawWheel();
});