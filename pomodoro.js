let timer;
let timeLeft;
let totalTime;
let isRunning = false;
let onBreak = false;

const display = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const taskInput = document.getElementById('task-input');
const timeInput = document.getElementById('time-input');
const progressCircle = document.querySelector('.progress-ring__circle');

const alertBox = document.getElementById('custom-alert');
const alertTitle = document.getElementById('alert-title');
const alertMessage = document.getElementById('alert-message');
const alertBtn = document.getElementById('alert-btn');

const circleLength = 2 * Math.PI * 90;
progressCircle.style.strokeDasharray = circleLength;

// =========================
// Save & Load State
// =========================
function saveState() {
  localStorage.setItem("timerState", JSON.stringify({
    taskName: taskInput.value,
    timeLeft,
    totalTime,
    isRunning,
    onBreak,
    lastTimestamp: Date.now()
  }));
}

function loadState() {
  const saved = localStorage.getItem("timerState");
  if (saved) {
    const state = JSON.parse(saved);
    taskInput.value = state.taskName || "";
    timeLeft = state.timeLeft || 0;
    totalTime = state.totalTime || 1;
    isRunning = state.isRunning;
    onBreak = state.onBreak;

    // adjust remaining time if running
    if (isRunning) {
      const elapsed = Math.floor((Date.now() - state.lastTimestamp) / 1000);
      timeLeft = Math.max(0, timeLeft - elapsed);
    }

    updateDisplay();

    // ⏯ Resume ticking if timer was running
    if (isRunning && timeLeft > 0) {
      resumeTimer();
    }
  } else {
    resetTimer();
  }
}

// =========================
// Core Functions
// =========================
function updateDisplay() {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  display.textContent =
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  let progress = circleLength - (timeLeft / totalTime) * circleLength;
  progressCircle.style.strokeDashoffset = progress;
  saveState();
}

function showAlert(title, message, callback) {
  alertTitle.textContent = title;
  alertMessage.textContent = message;
  alertBox.style.display = "flex";

  alertBtn.onclick = () => {
    alertBox.style.display = "none";
    if (callback) callback();
  };
}

function startTimer(resume = false) {
  const taskName = taskInput.value.trim();
  const customMinutes = parseInt(timeInput.value);

  if (!resume) {
    if (!onBreak) {
      if (!taskName) {
        showAlert("⚠ Missing Task", "Please enter a task first!");
        return;
      }
      if (!customMinutes || customMinutes <= 0) {
        showAlert("⚠ Invalid Time", "Please enter a valid number of minutes!");
        return;
      }
      timeLeft = customMinutes * 60;
      totalTime = timeLeft;
    } else {
      timeLeft = 5 * 60; // break time
      totalTime = timeLeft;
    }
  }

  if (!isRunning) {
    updateDisplay();
    isRunning = true;
    runInterval(taskName);
  }
}

// 🔄 Resume interval after refresh
function resumeTimer() {
  if (!isRunning) return;
  const taskName = taskInput.value.trim();
  runInterval(taskName);
}

// The repeating countdown logic
function runInterval(taskName) {
  clearInterval(timer);
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      clearInterval(timer);
      isRunning = false;

      // ✅ Use single alarm element
      const alarm = document.getElementById("alarm");

      if (!onBreak) {
        // 🔔 Work session ended → play alarm
        alarm.currentTime = 0;
        alarm.play().catch(err => console.log("Autoplay blocked:", err));

        showAlert("🎉 Task Completed!", `You finished "${taskName}"! Time for a 5-min break.`, () => {
          // Stop alarm when alert is closed
          alarm.pause();
          alarm.currentTime = 0;

          onBreak = true;
          startTimer();
        });
      } else {
        // 🔔 Break ended → play alarm again
        alarm.currentTime = 0;
        alarm.play().catch(err => console.log("Autoplay blocked:", err));

        showAlert("Break Over", "Your 5-min break is done. Ready for the next task!", () => {
          // Stop alarm when alert is closed
          alarm.pause();
          alarm.currentTime = 0;

          onBreak = false;
          resetTimer();
        });
      }
    }
  }, 1000);
}



function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  onBreak = false;
  timeLeft = 0;
  totalTime = 1;
  display.textContent = "25:00";
  taskInput.value = "";
  timeInput.value = "";
  progressCircle.style.strokeDashoffset = 0;
  localStorage.removeItem("timerState");
}

// =====================
// Dark Mode
// =====================
const darkToggle = document.getElementById("darkToggle");

if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
  darkToggle.checked = true;
}

darkToggle.addEventListener("change", () => {
  if (darkToggle.checked) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("darkMode", "enabled");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("darkMode", "disabled");
  }
});

// =====================
// Event Listeners
// =====================
startBtn.addEventListener('click', () => startTimer(false));
resetBtn.addEventListener('click', resetTimer);

loadState(); // Load state on refresh
