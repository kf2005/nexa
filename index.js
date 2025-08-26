const moodTasks = {
  happy: [
    "Dance for 5 minutes",
    "Write a thank you note",
    "Watch a funny video",
    "Call a friend to share good news",
    "Reward yourself with a small treat",
    "Make a playlist",
    "Try a random act of kindness"

  ],
  focused: [
    "Work on your main project",
    "Read a chapter of a book",
    "Organize your workspace",
    "Plan your tasks for tomorrow",
    "Work outside your usual spot",
    "Teach someone else a skill or a fact"
  ],
  relaxed: [
    "Take a 10-minute walk",
    "Meditate for 5 minutes",
    "Listen to calming music",
    "Do some light stretching",
    "Try a sensory taste test",
    "Make art with your non-dominant hand",
    "Write a letter to your future self"
  ],
  stressed: [
    "Write down what's bothering you",
    "Take deep breaths for 3 minutes",
    "Try a short guided meditation",
    "Drink a glass of water slowly",
    "Create a tiny DIY stress ball",
    "Listen to nature sounds (e.g. : forest wind, rain sounds)"
  ],
  nostalgic: [
    "Look at old photos",
    "Write about a happy memory",
    "Listen to music from your childhood",
    "Call an old friend",
    "Recreate a childhood snack or meal",
    "Visit a place from your past",
    "Draw a timeline of your life highlights"
  ],
  angry: [
    "Scream into / punch a pillow",
    "Go for a run",
    "Write a letter you won’t send",
    "Practice deep breathing",
    "Draw abstract art with bold colors",
    "Try cold water therapy",
    "Crush / tear paper"
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('modeToggle');
  const icon = document.getElementById('modeIcon');
  const taskInput = document.getElementById('taskInput');
  const taskCategory = document.getElementById('taskCategory');
  const addTaskBtn = document.getElementById('addTask');
  const dateModal = document.getElementById('dateModal');
  const datePicker = document.getElementById('datePicker');
  const dateOk = document.getElementById('dateOk');
  const dateCancel = document.getElementById('dateCancel');
  const moodSelect = document.querySelector('.header-left select');
  const surpriseBtn = document.querySelector('.header-left button.special-white');
  const chatAssistant = document.getElementById('chatAssistant');
  const chatHeader = document.getElementById('chatHeader');
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const lists = {
    today: document.getElementById('todayList'),
    tomorrow: document.getElementById('tomorrowList'),
    later: document.getElementById('laterList')
  };
  function showCustomAlert(message) {
    const alertBox = document.getElementById('customAlert');
    const alertMsg = document.getElementById('customAlertMessage');
    const alertOk = document.getElementById('customAlertOk');

    alertMsg.textContent = message;
    alertBox.style.display = 'block';

    alertOk.onclick = () => {
      alertBox.style.display = 'none';
    };
  }
  // To keep track of shown tasks per mood (to avoid repeats)
const shownTasks = {};

surpriseBtn.addEventListener('click', () => {
  const mood = moodSelect.value;
  if (!mood || !moodTasks[mood]) {
    showCustomAlert("Please select a mood first!");
    return;
  }

  if (!shownTasks[mood]) {
    shownTasks[mood] = new Set();
  }

  const availableTasks = moodTasks[mood].filter(task => !shownTasks[mood].has(task));

  let taskToShow;

  if (availableTasks.length === 0) {
    // All tasks shown, reset to allow repeats
    shownTasks[mood].clear();
    taskToShow = moodTasks[mood][Math.floor(Math.random() * moodTasks[mood].length)];
  } else {
    taskToShow = availableTasks[Math.floor(Math.random() * availableTasks.length)];
    shownTasks[mood].add(taskToShow);
  }

  showCustomAlert(taskToShow);
});


  function log(...args) { console.log('[TODO]', ...args); }

  // ---- LOAD tasks safely and normalize them ----
  function loadTasks() {
    try {
      const raw = localStorage.getItem('tasks');
      const parsed = raw ? JSON.parse(raw) : null;
      console.log('📂 Loaded (raw):', parsed);
      if (!parsed) return { today: [], tomorrow: [], later: [] };

      const out = { today: [], tomorrow: [], later: [] };
      ['today', 'tomorrow', 'later'].forEach(cat => {
        if (!Array.isArray(parsed[cat])) {
          out[cat] = [];
        } else {
          out[cat] = parsed[cat].map(t => ({
            text: typeof t.text === 'string' ? t.text : '',
            completed: !!t.completed,
            id: t.id || Date.now(),
            dueDate: t.dueDate || null
          }));
        }
      });
      return out;
    } catch (e) {
      console.error('Failed to load tasks, resetting.', e);
      return { today: [], tomorrow: [], later: [] };
    }
  }

  let tasks = loadTasks();

  // ---- Load task counts for suggestions ----
  let taskCounts;
  try {
    taskCounts = JSON.parse(localStorage.getItem('taskCounts')) || {};
  } catch {
    taskCounts = {};
  }

  // ---- THEME (unchanged) ----
  try {
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark');
      toggle.checked = true;
      icon.classList.replace('bi-sun-fill', 'bi-moon-stars-fill');
    }
  } catch (e) { /* ignore */ }

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      document.body.classList.add('dark');
      icon.classList.replace('bi-sun-fill', 'bi-moon-stars-fill');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      icon.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
      localStorage.setItem('theme', 'light');
    }
  });

  // ---- SAVE tasks ----
  function saveTasks() {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('taskCounts', JSON.stringify(taskCounts));
      console.log('💾 Saved to localStorage:', JSON.parse(localStorage.getItem('tasks')));
    } catch (e) {
      console.error('Saving tasks failed:', e);
    }
  }
  function showDateModal() {
        return new Promise((resolve) => {
            datePicker.value = '';
            dateModal.style.display = 'flex';

            function onOk() {
            if (!datePicker.value) {
                alert('Please select a date!');
                return;
            }
            cleanup();
            resolve(datePicker.value);
            }

            function onCancel() {
            cleanup();
            resolve(null);
            }

            function cleanup() {
            dateOk.removeEventListener('click', onOk);
            dateCancel.removeEventListener('click', onCancel);
            dateModal.style.display = 'none';
            }

            dateOk.addEventListener('click', onOk);
            dateCancel.addEventListener('click', onCancel);
        });
    }


  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function addTaskToCategory(text, category, date = null) {
    if (!tasks[category]) tasks[category] = [];
    const newTask = { text, completed: false, id: Date.now() };
    if (date) newTask.dueDate = date;
    tasks[category].push(newTask);
    saveTasks();
  }
  // ---- Suggestions Elements ----
  const suggestionsList = document.getElementById('suggestionsList');
  const clearSuggestionsBtn = document.getElementById('clearSuggestionsBtn');

  // Increase count of task text
  function increaseTaskCount(taskText) {
    if (!taskText) return;
    taskCounts[taskText] = (taskCounts[taskText] || 0) + 1;
    localStorage.setItem('taskCounts', JSON.stringify(taskCounts));
    renderSuggestions();
  }

  // Decrease count of task text
  function decreaseTaskCount(taskText) {
    if (!taskText) return;
    if (taskCounts[taskText]) {
      taskCounts[taskText] = Math.max(0, taskCounts[taskText] - 1);
      if (taskCounts[taskText] === 0) delete taskCounts[taskText];
      localStorage.setItem('taskCounts', JSON.stringify(taskCounts));
      renderSuggestions();
    }
  }

  // Clear all suggestions
  if (clearSuggestionsBtn) {
    clearSuggestionsBtn.addEventListener('click', () => {
      taskCounts = {};
      localStorage.removeItem('taskCounts');
      renderSuggestions();
    });
  }

  // Render suggestions list
  function renderSuggestions() {
    if (!suggestionsList) return;
    suggestionsList.innerHTML = '';
    const frequentTasks = Object.entries(taskCounts).filter(([task, count]) => count >= 3);

    frequentTasks.forEach(([task]) => {
      const li = document.createElement('li');
      li.textContent = `You do "${task}" often, do you want to add it again?`;
      li.style.cursor = 'pointer';
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.gap = '10px';

      // Dropdown hidden initially
      const select = document.createElement('select');
      select.style.display = 'none';

      ['Today', 'Tomorrow', 'Later'].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.toLowerCase();
        option.textContent = cat;
        select.appendChild(option);
      });

      li.appendChild(select);
        li.addEventListener('click', () => {
        if (select.style.display === 'none') {
            select.style.display = 'inline-block';
            select.focus();
        } else {
            const selectedCategory = select.value || 'today';
            addSuggestedTask(task, selectedCategory);
            select.style.display = 'none';
        }
        });

        select.addEventListener('change', () => {
        const selectedCategory = select.value || 'today';
        addSuggestedTask(task, selectedCategory);
        select.style.display = 'none';
        });

      suggestionsList.appendChild(li);
    });
  }

  // Add suggested task
  function addSuggestedTask(taskText, category) {
    if (!taskText) return;
    if (!tasks[category]) tasks[category] = [];
    tasks[category].push({ text: taskText, completed: false, id: Date.now() });
    increaseTaskCount(taskText);  // count again
    saveTasks();
    renderTasks();
    log('Added suggested task:', taskText, '->', category);
  }

  // ---- RENDER tasks (creates elements, and updates checkbox in-place) ----
  function renderTasks() {
    Object.keys(lists).forEach(category => {
      const ul = lists[category];
      ul.innerHTML = '';

      tasks[category].forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `todo-item`;
        li.setAttribute("draggable", "true");
        if (task.completed) li.classList.add('completed');
        li.style.display = "flex";
        li.style.alignItems = "center";

        li.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", JSON.stringify({
            id: task.id,
            text: task.text,
            completed: task.completed,
            dueDate: task.dueDate,
            fromCategory: category
          }));
          e.dataTransfer.effectAllowed = "move";
        });

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !!task.completed;
        checkbox.style.marginRight = '10px';

        // Text (span)
        const span = document.createElement('span');
        span.style.flex = '1';
        span.style.outline = 'none';
        if (task.dueDate) {
        span.textContent = `${task.text} (Due: ${task.dueDate})`;
        } else {
        span.textContent = task.text;
        }


        // Actions container
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '10px';

        // Edit icon
        const editIcon = document.createElement('i');
        editIcon.className = 'bi bi-pencil-fill';
        editIcon.title = 'Edit';
        editIcon.style.cursor = 'pointer';
        editIcon.style.color = 'green';

        // Trash icon
        const trashIcon = document.createElement('i');
        trashIcon.className = 'bi bi-trash-fill';
        trashIcon.title = 'Delete';
        trashIcon.style.cursor = 'pointer';
        trashIcon.style.color = 'red';

        actions.appendChild(editIcon);
        actions.appendChild(trashIcon);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(actions);
        ul.appendChild(li);

        // ---- Events ----

        // Checkbox change: update task.completed and save (no full re-render needed)
        checkbox.addEventListener('change', () => {
          task.completed = checkbox.checked;
          li.classList.toggle('completed', task.completed);
          saveTasks();
        });

        // Inline edit on pencil click
        editIcon.addEventListener('click', () => {
          span.contentEditable = 'true';
          span.focus();

          // Select all text in the span
          const range = document.createRange();
          range.selectNodeContents(span);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);

          function finishEdit() {
            span.contentEditable = 'false';
            const newText = span.textContent.trim();
            // Keep old text if user clears accidentally
            // Also update taskCounts if text changed
            if(newText && newText !== task.text) {
            //   decreaseTaskCount(task.text);
              task.text = newText;
              increaseTaskCount(newText);
            } else {
              task.text = task.text; // unchanged or empty fallback
            }
            span.textContent = task.text;
            saveTasks();
            // cleanup listeners
            span.removeEventListener('blur', onBlur);
            span.removeEventListener('keydown', onKeydown);
          }

          function onBlur() { finishEdit(); }
          function onKeydown(e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              finishEdit();
              span.blur();
            } else if (e.key === 'Escape') {
              // cancel editing: restore previous text
              span.textContent = task.text;
              span.contentEditable = 'false';
              span.blur();
              span.removeEventListener('blur', onBlur);
              span.removeEventListener('keydown', onKeydown);
            }
          }

          span.addEventListener('blur', onBlur);
          span.addEventListener('keydown', onKeydown);
        });

        // Delete
        trashIcon.addEventListener('click', () => {
        //   decreaseTaskCount(task.text);
          tasks[category].splice(index, 1);
          saveTasks();
          renderTasks();
        });
      });
    });
    const todayDoneBtn = document.getElementById('todayDoneBtn');
    if (todayDoneBtn) {
      if (tasks.today.length > 0) {
        todayDoneBtn.style.display = 'block';
      } else {
        todayDoneBtn.style.display = 'none';
      }
    }
     
  }
  ["today", "tomorrow", "later"].forEach(enableDropZone);

  function enableDropZone(category) {
    const ul = lists[category];
    if (!ul) return;

    ul.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    ul.addEventListener("drop", async (e) => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const { id, text, completed, dueDate, fromCategory } = data;

      // 🔒 Prevent duplicate tasks
      if (tasks[category].some(t => t.text === text)) {
        return;
      }

      // Remove from old category
      tasks[fromCategory] = tasks[fromCategory].filter(t => t.id !== id);

      // If dropping into later → ask for date
      let newDueDate = dueDate || null;
      if (category === "later") {
        newDueDate = await showDateModal();
        if (!newDueDate) {
          renderTasks();
          return;
        }
      }

      // Add into new category
      tasks[category].push({
        id,
        text,
        completed,
        dueDate: newDueDate
      });

      saveTasks();
      renderTasks();
    });
  }


  // ---- Add task ----
  async function addTask(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const text = taskInput.value.trim();
  let category = taskCategory.value || 'today';

  if (!text) {
    taskInput.focus();
    return;
  }

  if (category === 'later') {
    const selectedDate = await showDateModal();
    if (!selectedDate) return; // user cancelled
    addTaskToCategory(text, category, selectedDate);
  } else {
    addTaskToCategory(text, category);
  }

  // Increase count for suggestions
  increaseTaskCount(text);

  taskInput.value = '';
  taskCategory.value = 'today';
  renderTasks();
  taskInput.focus();
  console.log('added task:', text, '->', category);
}



  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask(e);
  });

  // Today's Work Done button
  const todayDoneBtn = document.getElementById('todayDoneBtn');
  if (todayDoneBtn) {
    todayDoneBtn.addEventListener('click', () => {
      // Mark all as completed
      tasks.today.forEach(task => task.completed = true);
      saveTasks();
      renderTasks();

      const todayItems = lists.today.querySelectorAll('li');
      todayItems.forEach(item => {
        item.style.transition = "opacity 1s";
        setTimeout(() => {
          item.style.opacity = "0";
        }, 50);
      });

      // After 2 seconds, delete all tasks from today
      setTimeout(() => {
        // tasks.today.forEach(task => decreaseTaskCount(task.text));
        tasks.today = [];
        saveTasks();
        renderTasks();
      }, 2000);
    });
  }

  let lastDeleted = null; // stores last deleted tasks for undo

  const completeAllBtn = document.getElementById('completeAllBtn');
  const undoBtn = document.getElementById('undoBtn');

  function fireConfettiAllOver() {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
            clearInterval(interval);
            return;
            }

            const particleCount = 500 * (timeLeft / duration);

            confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random(), y: Math.random() * 0.6 }
            });
        }, 250);
    }



  if (completeAllBtn) {
  completeAllBtn.addEventListener('click', () => {
    // Show confetti
    fireConfettiAllOver();
    // rest of your code below...

    // Mark all tasks as completed
    Object.keys(tasks).forEach(category => {
      tasks[category].forEach(task => task.completed = true);
    });
    saveTasks();
    renderTasks();

    // Fade out all tasks after short delay
    Object.keys(lists).forEach(category => {
      const ul = lists[category];
      const items = ul.querySelectorAll('li');
      items.forEach(item => {
        item.style.transition = 'opacity 2s';
        setTimeout(() => {
          item.style.opacity = '0';
        }, 50);
      });
    });

    // Store copy of all tasks for undo and clear after 2s
    lastDeleted = JSON.parse(JSON.stringify(tasks));
    setTimeout(() => {
      // Clear all tasks now
      Object.keys(tasks).forEach(category => {
        tasks[category] = [];
      });
      saveTasks();
      renderTasks();
      if(undoBtn) undoBtn.disabled = false; // enable undo
    }, 2050);
  });
}


  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      if (!lastDeleted) return;
      // Restore last deleted tasks
      tasks = JSON.parse(JSON.stringify(lastDeleted));
      lastDeleted = null;
      saveTasks();
      renderTasks();
      undoBtn.disabled = true; // disable undo after restoring
    });
  }


  chatHeader.addEventListener('click', () => {
  if (chatMessages.style.display === 'none' || !chatMessages.style.display) {
    chatMessages.style.display = 'block';
    chatForm.style.display = 'flex';
  } else {
    chatMessages.style.display = 'none';
    chatForm.style.display = 'none';
  }
});

// Helper to add messages
function addMessage(text, sender) {
  const div = document.createElement('div');
  div.textContent = text;
  div.className = sender === 'user' ? 'chat-message-user' : 'chat-message-bot';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simple chat logic for demo
function botResponse(input) {
  const text = input.toLowerCase();

  // Show today's tasks
  if (text.includes('show') && text.includes('today')) {
    if (tasks && tasks.today && tasks.today.length > 0) {
      return 'Today’s tasks are:\n' + tasks.today.map(t => `- ${t.text} ${t.completed ? '(done)' : ''}`).join('\n');
    } else {
      return 'You have no tasks for today!';
    }
  }

  // Show tomorrow's tasks
  else if (text.includes('show') && text.includes('tomorrow')) {
    if (tasks && tasks.tomorrow && tasks.tomorrow.length > 0) {
      return 'Tomorrow’s tasks are:\n' + tasks.tomorrow.map(t => `- ${t.text} ${t.completed ? '(done)' : ''}`).join('\n');
    } else {
      return 'You have no tasks for tomorrow!';
    }
  }

  // Show later tasks
  else if (text.includes('show') && (text.includes('later') || text.includes('future'))) {
    if (tasks && tasks.later && tasks.later.length > 0) {
      return 'Later tasks are:\n' + tasks.later.map(t => `- ${t.text} ${t.completed ? '(done)' : ''}`).join('\n');
    } else {
      return 'You have no tasks for later!';
    }
  }

  // Show completed tasks for a category
  else if (text.includes('show') && text.includes('completed')) {
    let category = 'today';
    if (text.includes('tomorrow')) category = 'tomorrow';
    else if (text.includes('later') || text.includes('future')) category = 'later';

    const doneTasks = tasks[category].filter(t => t.completed);
    if (doneTasks.length > 0) {
      return `Completed tasks for ${category}:\n` + doneTasks.map(t => `- ${t.text}`).join('\n');
    } else {
      return `You have no completed tasks for ${category}.`;
    }
  }

  // Show pending tasks for a category
  else if (text.includes('show') && (text.includes('pending') || text.includes('incomplete'))) {
    let category = 'today';
    if (text.includes('tomorrow')) category = 'tomorrow';
    else if (text.includes('later') || text.includes('future')) category = 'later';

    const pendingTasks = tasks[category].filter(t => !t.completed);
    if (pendingTasks.length > 0) {
      return `Pending tasks for ${category}:\n` + pendingTasks.map(t => `- ${t.text}`).join('\n');
    } else {
      return `You have no pending tasks for ${category}.`;
    }
  }

  // Add a task to specific category
  else if (text.startsWith('add')) {
    let category = 'today';
    if (text.includes(' tomorrow')) category = 'tomorrow';
    else if (text.includes(' later') || text.includes(' future')) category = 'later';

    let taskText = input.substring(3).trim();
    taskText = taskText.replace(/tomorrow|later|future/gi, '').trim();

    if (taskText.length === 0) return 'Please tell me what task to add.';

    tasks[category].push({ text: taskText, completed: false, id: Date.now() });
    saveTasks();
    renderTasks();
    return `Added task: "${taskText}" to ${category} list.`;
  }

  // Delete a task from specific category
  else if (text.startsWith('delete')) {
    let category = 'today';
    if (text.includes(' tomorrow')) category = 'tomorrow';
    else if (text.includes(' later') || text.includes(' future')) category = 'later';

    let taskText = input.substring(6).trim();
    taskText = taskText.replace(/tomorrow|later|future/gi, '').trim();

    if (taskText.length === 0) return 'Please tell me which task to delete.';

    const index = tasks[category].findIndex(t => t.text.toLowerCase() === taskText.toLowerCase());
    if (index === -1) return `Task "${taskText}" not found in ${category} list.`;

    tasks[category].splice(index, 1);
    saveTasks();
    renderTasks();
    return `Deleted task: "${taskText}" from ${category} list.`;
  }

  // Mark a specific task as completed
  else if (text.startsWith('complete')) {
    let category = 'today';
    if (text.includes(' tomorrow')) category = 'tomorrow';
    else if (text.includes(' later') || text.includes(' future')) category = 'later';

    let taskText = input.substring(8).trim();
    taskText = taskText.replace(/tomorrow|later|future/gi, '').trim();

    if (taskText.length === 0) return 'Please tell me which task to complete.';

    const task = tasks[category].find(t => t.text.toLowerCase() === taskText.toLowerCase());
    if (!task) return `Task "${taskText}" not found in ${category} list.`;

    task.completed = true;
    saveTasks();
    renderTasks();
    return `Marked task "${taskText}" as completed in ${category} list.`;
  }

  // Undo completion of a task
  else if (text.startsWith('undo complete') || text.startsWith('mark incomplete')) {
    let category = 'today';
    if (text.includes(' tomorrow')) category = 'tomorrow';
    else if (text.includes(' later') || text.includes(' future')) category = 'later';

    let taskText = input.replace(/undo complete|mark incomplete/gi, '').trim();
    taskText = taskText.replace(/tomorrow|later|future/gi, '').trim();

    if (taskText.length === 0) return 'Please tell me which task to mark incomplete.';

    const task = tasks[category].find(t => t.text.toLowerCase() === taskText.toLowerCase());
    if (!task) return `Task "${taskText}" not found in ${category} list.`;

    task.completed = false;
    saveTasks();
    renderTasks();
    return `Marked task "${taskText}" as incomplete in ${category} list.`;
  }

  // Mark all tasks in a category as completed
  else if (text.includes('complete all')) {
    let category = 'today';
    if (text.includes('tomorrow')) category = 'tomorrow';
    else if (text.includes('later') || text.includes('future')) category = 'later';

    tasks[category].forEach(t => t.completed = true);
    saveTasks();
    renderTasks();
    return `All tasks in ${category} list marked as completed!`;
  }

  // Delete all tasks in a category
  else if (text.includes('delete all') || text.includes('clear all')) {
    let category = 'today';
    if (text.includes(' tomorrow')) category = 'tomorrow';
    else if (text.includes(' later') || text.includes(' future')) category = 'later';

    tasks[category] = [];
    saveTasks();
    renderTasks();
    return `Deleted all tasks from ${category} list.`;
  }

  // Clear all tasks in all categories
  else if (text.includes('clear all tasks') || text.includes('delete all tasks')) {
    Object.keys(tasks).forEach(cat => {
      tasks[cat] = [];
    });
    saveTasks();
    renderTasks();
    return 'All tasks in all categories have been deleted.';
  }

  // Suggest work time
  else if (text.includes('suggest') && text.includes('time')) {
    return 'I suggest working in focused 25-minute sessions with short 5-minute breaks (Pomodoro technique).';
  }

  // How many tasks are pending today
  else if ((text.includes('how many') || text.includes('count')) && text.includes('today')) {
    const count = tasks.today.filter(t => !t.completed).length;
    return `You have ${count} pending task${count !== 1 ? 's' : ''} for today.`;
  }

  // How many tasks are completed today
  else if ((text.includes('how many') || text.includes('count')) && text.includes('completed') && text.includes('today')) {
    const count = tasks.today.filter(t => t.completed).length;
    return `You have completed ${count} task${count !== 1 ? 's' : ''} today. Great job!`;
  }

  // How many total tasks in tomorrow category
  else if ((text.includes('how many') || text.includes('count')) && text.includes('tomorrow')) {
    const count = tasks.tomorrow.length;
    return `You have ${count} total task${count !== 1 ? 's' : ''} for tomorrow.`;
  }

  // Count all pending tasks in all categories
  else if ((text.includes('how many') || text.includes('count')) && text.includes('pending') && (text.includes('all') || text.includes('everything'))) {
    let totalPending = 0;
    Object.keys(tasks).forEach(cat => {
      totalPending += tasks[cat].filter(t => !t.completed).length;
    });
    return `You have ${totalPending} pending task${totalPending !== 1 ? 's' : ''} across all categories.`;
  }

  // Show all tasks across categories
  else if (text.includes('show all tasks') || (text.includes('show') && text.includes('all'))) {
    let result = '';
    ['today', 'tomorrow', 'later'].forEach(cat => {
      if (tasks[cat].length > 0) {
        result += `\n${cat.charAt(0).toUpperCase() + cat.slice(1)} tasks:\n` +
          tasks[cat].map(t => `- ${t.text} ${t.completed ? '(done)' : ''}`).join('\n') + '\n';
      } else {
        result += `\nNo tasks for ${cat}.\n`;
      }
    });
    return result.trim();
  }

  // Show tasks containing a word
  else if (text.startsWith('show tasks with') || text.startsWith('find tasks with')) {
    const keyword = input.toLowerCase().replace(/show tasks with|find tasks with/gi, '').trim();
    if (keyword.length === 0) return 'Please specify a word to search in tasks.';

    let matchedTasks = [];
    Object.keys(tasks).forEach(cat => {
      tasks[cat].forEach(t => {
        if (t.text.toLowerCase().includes(keyword)) {
          matchedTasks.push(`- ${t.text} (${cat}${t.completed ? ', done' : ', pending'})`);
        }
      });
    });

    if (matchedTasks.length > 0) {
      return `Tasks containing "${keyword}":\n` + matchedTasks.join('\n');
    } else {
      return `No tasks found containing "${keyword}".`;
    }
  }

  // Remind about overdue tasks (placeholder example)
  else if (text.includes('remind') && text.includes('overdue')) {
    // Assuming tasks have a 'dueDate' property (you can implement this later)
    const overdueTasks = [];
    const now = new Date();
    Object.keys(tasks).forEach(cat => {
      tasks[cat].forEach(t => {
        if (t.dueDate && new Date(t.dueDate) < now && !t.completed) {
          overdueTasks.push(`- ${t.text} (${cat})`);
        }
      });
    });
    if (overdueTasks.length > 0) {
      return `You have overdue tasks:\n` + overdueTasks.join('\n');
    } else {
      return 'No overdue tasks found. Keep it up!';
    }
  }

  // Encouragement if no pending tasks
  else if (text.includes('am i done') || text.includes('any tasks left') || text.includes('tasks left')) {
    let pendingCount = 0;
    Object.keys(tasks).forEach(cat => {
      pendingCount += tasks[cat].filter(t => !t.completed).length;
    });
    if (pendingCount === 0) {
      return "You have no pending tasks. Great job! Take a break or add new tasks.";
    } else {
      return `You still have ${pendingCount} pending task${pendingCount !== 1 ? 's' : ''}. Keep going!`;
    }
  }

  // Respond to thanks
  else if (text.includes('thank') || text.includes('thanks')) {
    return "You're welcome! Happy to help 😊";
  }

  // Tell the bot your mood and get task suggestions
  else if (text.includes('i am feeling') || text.includes('my mood is')) {
    if (text.includes('happy')) {
      return "Great to hear you're happy! Maybe add some fun tasks or rewards today.";
    } else if (text.includes('stressed')) {
      return "Take deep breaths and try focusing on small tasks one by one. You got this!";
    } else if (text.includes('tired')) {
      return "Try taking short breaks between tasks. Rest helps productivity!";
    } else if (text.includes('motivated')) {
      return "Awesome! Use this energy to finish those tasks fast.";
    } else {
      return "Thanks for sharing your mood! Let me know if I can help with your tasks.";
    }
  }

  // Check if a task exists
  else if (text.startsWith('do i have') || text.startsWith('is there')) {
    let foundTasks = [];
    ['today', 'tomorrow', 'later'].forEach(cat => {
      tasks[cat].forEach(t => {
        if (text.includes(t.text.toLowerCase())) {
          foundTasks.push(`${t.text} (${cat}${t.completed ? ', done' : ', pending'})`);
        }
      });
    });
    if (foundTasks.length > 0) {
      return `Yes, you have these tasks:\n- ${foundTasks.join('\n- ')}`;
    } else {
      return "No, you don't have that task in any category.";
    }
  }

  // Greetings
  else if (/(hello|hi|hey|greetings)/.test(text)) {
    return "Hello! How can I help you with your tasks today?";
  }

  // Ask how the bot is doing
  else if (text.includes('how are you')) {
    return "I'm just a bot, but I'm doing great! Thanks for asking 😊";
  }

  // Motivational responses
  else if (text.includes('motivate me') || text.includes('inspire me')) {
    const quotes = [
      "Keep pushing, you're doing great!",
      "Every small step counts.",
      "Believe in yourself!",
      "You can do it, one task at a time.",
      "Stay focused and never give up.",
      "Small progress is still progress.",
      "Focus on your goals, not your fears."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // Ask what the bot can do
  else if (text.includes('what can you do')) {
    return "I can show your tasks, add or delete tasks in any category, mark tasks as done, undo completion, clear tasks, suggest work times, and much more!";
  }

  // Ask for help
  else if (text.includes('help')) {
    return `Try commands like:
- Show me today's tasks
- Add meeting tomorrow
- Delete meeting later
- Complete homework today
- Undo complete meeting today
- Complete all tasks later
- Delete all tasks tomorrow
- Show all tasks
- How many tasks are pending today
- Show tasks with project
- Remind me about overdue tasks
- Suggest time to finish project`;
  }

  // Default fallback
  else {
    return "Sorry, I didn't understand that. Try commands like:\n- Show me today's tasks\n- Add meeting tomorrow\n- Delete meeting later\n- Suggest time to finish project";
  }
}

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const userText = chatInput.value.trim();
  if (!userText) return;
  addMessage(userText, 'user');
  chatInput.value = '';

  const response = botResponse(userText);
  setTimeout(() => {
    addMessage(response, 'bot');
  }, 500);
});
  // ---- initial render ----
  renderTasks();
  renderSuggestions();
  log('loaded tasks on page load:', tasks);

  // --- Optional: helpful note if old bad data exists ---
  // localStorage.removeItem('tasks');
  // localStorage.removeItem('taskCounts');
  // then refresh the page to clear old data
});
