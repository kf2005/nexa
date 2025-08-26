// ===== DOM ELEMENTS =====
const calendar = document.getElementById("calendar"); 
const datePicker = document.getElementById("datePicker");
const timePicker = document.getElementById("timePicker");
const occasionInput = document.getElementById("occasionInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskTitle = document.getElementById("taskTitle");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const monthYear = document.getElementById("monthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const darkModeToggle = document.getElementById("darkModeToggle");
const clearAllBtn = document.getElementById("clearAllBtn");


// ===== INITIALIZE VARIABLES =====
let selectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let occasions = JSON.parse(localStorage.getItem("occasions") || "{}");
// Audio unlock (keep this LAST)
let audioUnlocked = false;
const reminderSound = document.getElementById("reminderSound");

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// ===== NOTIFICATION PERMISSION =====
window.addEventListener("DOMContentLoaded", () => {
    // Dark mode
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeToggle.checked = true;
    }

    // Notifications
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }

    document.getElementById("closeReminder")?.addEventListener("click", () => {
        const alertBox = document.getElementById("reminderAlert");
        alertBox.style.display = "none";
        alertBox.classList.remove("blink");
    });

    document.addEventListener("click", () => {
        try {
            if (!audioUnlocked && reminderSound) {
                reminderSound.play()
                    .then(() => {
                        reminderSound.pause();
                        reminderSound.currentTime = 0;
                        audioUnlocked = true;
                    })
                    .catch(err => {
                        console.warn("Audio unlock failed:", err);
                        audioUnlocked = true;
                    });
            } else {
                audioUnlocked = true;
            }
        } catch (err) {
            console.error("Error in audio unlock:", err);
            audioUnlocked = true;
        }
    });


    // Initial load of calendar & occasions list
    renderCalendar();
    updateCalendarGrid();
    updateAllOccasionsList();
});

function normalizeTime(timeStr) {
    if (!timeStr || timeStr === "All Day") return null;
    const [h, m] = timeStr.split(":");
    return h.padStart(2, "0") + ":" + m.padStart(2, "0");
}

function checkReminders() {
    const now = new Date();
    const currentDate = now.toLocaleDateString("en-CA");
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

    console.clear();
    console.log("=== Reminder Check ===");
    console.log("Current Date:", currentDate, "Current Time (min):", currentTimeMinutes);

    if (!occasions[currentDate]) {
        console.log("No occasions for today.");
        return;
    }

    occasions[currentDate].forEach((oc, idx) => {
        let reminderMinutes;

        if (!oc.time || oc.time === "All Day") {
            reminderMinutes = 9 * 60; // 9:00 AM default
        } else {
            const [h, m] = oc.time.split(":").map(Number);
            reminderMinutes = h * 60 + m;
        }

        console.log(
            `Occasion #${idx + 1}:`,
            oc.name,
            "| Time:", oc.time,
            "| Reminder min:", reminderMinutes,
            "| Notified:", oc.notified
        );

        if (Math.abs(reminderMinutes - currentTimeMinutes) <= 0 && !oc.notified) {
            console.log("🔥 Triggering reminder:", oc.name);
            showReminder(oc.name);

            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Reminder!", { body: oc.name });
            }

            oc.notified = true;
            localStorage.setItem("occasions", JSON.stringify(occasions));
        } else {
            console.log("❌ Not triggering yet.");
        }
    });
}


function showReminder(text) {
    const alertBox = document.getElementById("reminderAlert");
    const alertText = document.getElementById("reminderText");

    if (!alertBox || !alertText) return;

    alertText.textContent = "Reminder: " + text;
    alertBox.style.display = "block";
    alertBox.classList.add("blink");

    setTimeout(() => {
        alertBox.style.display = "none";
        alertBox.classList.remove("blink");
    }, 10000);

    if (audioUnlocked && reminderSound) {
        reminderSound.currentTime = 0;
        reminderSound.play().catch(err => console.warn("Sound play error:", err));
    }
}

// Check reminders every 2 seconds
setInterval(checkReminders, 2000);
checkReminders();

// ===== CALENDAR RENDER =====
function renderCalendar() {
    calendar.innerHTML = "";
    monthYear.textContent = `${months[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("empty");
        calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        dayDiv.dataset.day = day;
        dayDiv.textContent = day;
        dayDiv.addEventListener("click", (event) => selectDate(day, event));
        calendar.appendChild(dayDiv);
    }

    updateCalendarGrid();
}

function updateCalendarGrid() {
    const dayCells = document.querySelectorAll(".day");
    dayCells.forEach(cell => {
        const dayNum = parseInt(cell.dataset.day);
        const month = currentMonth + 1;
        const year = currentYear;
        const dateKey = `${year}-${String(month).padStart(2,"0")}-${String(dayNum).padStart(2,"0")}`;

        cell.textContent = dayNum;
        if (occasions[dateKey] && occasions[dateKey].length > 0) {
            const emoji = occasions[dateKey][0].emoji || "";
            cell.textContent = `${dayNum} ${emoji}`;
        }
    });
}

function selectDate(day, event) {
    document.querySelectorAll(".calendar div").forEach(d => d.classList.remove("selected"));
    event.target.classList.add("selected");
    selectedDate = day;

    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    datePicker.value = formattedDate;
    showOccasionsForDay(day);
}

function showOccasionsForDay(day) {
    taskList.innerHTML = "";
    const key = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const items = occasions[key] || [];
    taskTitle.textContent = `Occasions for ${key}`;

    items.forEach((oc, index) => {
        const div = document.createElement("div");
        div.classList.add("task");
        div.innerHTML = `<span>${oc.time} - ${oc.name}</span>
                         <button onclick="deleteOccasion('${key}', ${index})">Delete</button>`;
        taskList.appendChild(div);
    });
}

function addOccasion() {
    const date = datePicker.value;
    const time = timePicker.value || "All Day";
    const name = occasionInput.value.trim();
    const emoji = document.getElementById("occasionType").value;

    if (!date || !name) {
        alert("Please select date and enter occasion");
        return;
    }

    if (!occasions[date]) occasions[date] = [];
    occasions[date].push({ time, name, emoji, notified: false });

    localStorage.setItem("occasions", JSON.stringify(occasions));
    occasionInput.value = "";

    updateCalendarGrid();
    updateAllOccasionsList();
    showOccasionsForDay(parseInt(date.split("-")[2]));
}

function deleteOccasion(date, index) {
    if (!occasions[date]) return;
    occasions[date].splice(index, 1);
    if (occasions[date].length === 0) delete occasions[date];

    localStorage.setItem("occasions", JSON.stringify(occasions));
    showOccasionsForDay(parseInt(date.split("-")[2]));
    updateCalendarGrid();
    updateAllOccasionsList();
}

function deleteAllOccasions() {
    if (!selectedDate) return;

    const key = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}`;
    delete occasions[key];

    localStorage.setItem("occasions", JSON.stringify(occasions));
    showOccasionsForDay(selectedDate);
    updateCalendarGrid();
    updateAllOccasionsList();
}

if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
        if (Object.keys(occasions).length === 0) return alert("No occasions to clear!");
        if (confirm("Delete ALL occasions?")) {
            occasions = {};
            localStorage.setItem("occasions", JSON.stringify(occasions));
            updateCalendarGrid();
            updateAllOccasionsList();
            taskList.innerHTML = "";
        }
    });
}

function updateAllOccasionsList() {
    const allOccasionsDiv = document.getElementById("allOccasionsList");
    allOccasionsDiv.innerHTML = "";

    Object.keys(occasions).sort().forEach(date => {
        occasions[date].forEach((oc, idx) => {
            const div = document.createElement("div");
            div.classList.add("task");
            div.innerHTML = `<span>${date} - ${oc.time} - ${oc.name}</span>
                             <button onclick="deleteOccasion('${date}', ${idx})">Delete</button>`;
            allOccasionsDiv.appendChild(div);
        });
    });
}

function changeMonth(offset) {
    currentMonth += offset;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    else if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
}

darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "disabled");
    }
});

addBtn.addEventListener("click", addOccasion);
deleteAllBtn.addEventListener("click", deleteAllOccasions);
prevMonthBtn.addEventListener("click", () => changeMonth(-1));
nextMonthBtn.addEventListener("click", () => changeMonth(1));
