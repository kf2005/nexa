// Initialize variables
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let userName = localStorage.getItem('userName') || 'Guest';
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { name: 'work', display: 'Work', color: '#d147a3' },        // strong pinkish-purple
    { name: 'personal', display: 'Personal', color: '#f72585' }, // keep vivid pink
    { name: 'shopping', display: 'Shopping', color: '#ff6fa3' }, // warm pink
    { name: 'health', display: 'Health', color: '#ff9ac1' },    // light pastel pink
    { name: 'study', display: 'Study', color: '#a3337d' }       // deeper magenta

];

// DOM elements
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const totalTasks = document.getElementById('total-tasks');
const completedTasks = document.getElementById('completed-tasks');
const pendingTasks = document.getElementById('pending-tasks');
const categoriesCount = document.getElementById('categories-count');
const usernameSpan = document.getElementById('username');
const categorySelect = document.getElementById('category-select');
const taskCounter = document.getElementById('task-counter');
const newCategoryInput = document.getElementById('new-category');
const addCategoryBtn = document.getElementById('add-category-btn');
const categoryTags = document.getElementById('category-tags');
const nameModal = document.getElementById('name-modal');
const nameInput = document.getElementById('name-input');
const saveNameBtn = document.getElementById('save-name');
const cancelNameBtn = document.getElementById('cancel-name');
const closeModalBtn = document.querySelector('.close-modal');
const editNameBtn = document.getElementById('edit-name-btn');

let categoryChart = null;
let completionChart = null;

// Initialize the application
function init() {
    // Set user name
    usernameSpan.textContent = userName;
    
    // Render categories
    renderCategories();

    document.getElementById('filter-category').addEventListener('change', renderTodoList);
    
    // Render todos
    renderTodoList();
    updateStats();
    renderCharts();
    
    // Event listeners
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    
    addCategoryBtn.addEventListener('click', addCategory);
    newCategoryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCategory();
    });
    
    // Name modal events
    editNameBtn.addEventListener('click', () => {
        nameInput.value = userName;
        nameModal.style.display = 'flex';
    });
    
    saveNameBtn.addEventListener('click', saveName);
    cancelNameBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === nameModal) {
            closeModal();
        }
    });

}
// Add a new todo
function addTodo() {
    const text = todoInput.value.trim();
    const category = categorySelect.value;
    
    if (text) {
        const newTodo = {
            id: Date.now(),
            text: text,
            category: category,
            completed: false,
            timestamp: new Date().toISOString()
        };
        
        todos.push(newTodo);
        saveToLocalStorage();
        renderTodoList();
        updateStats();
        renderCharts();
        todoInput.value = '';
        todoInput.focus();
    }
}

// Delete a todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveToLocalStorage();
    renderTodoList();
    updateStats();
    renderCharts();
}

// Toggle completion status
function toggleComplete(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return {...todo, completed: !todo.completed};
        }
        return todo;
    });
    
    saveToLocalStorage();
    updateStats();
    renderCharts();
}

// Add a new category
function addCategory() {
    const name = newCategoryInput.value.trim();
    if (name) {
        // Check if category already exists
        if (categories.some(cat => cat.name === name.toLowerCase())) {
            alert('Category already exists!');
            return;
        }
        
        // Generate random color from palette
        let colorPalette = [
            '#f8bbd0', // pastel pink
            '#ffcccb', // pastel rose
            '#ffd1dc', // pastel blush
            '#c1f0f6', // pastel aqua blue
            '#b5ead7', // pastel mint green
            '#c7ceea', // pastel lavender
            '#fdfd96', // pastel yellow
            '#ffdac1', // pastel peach
            '#e2f0cb', // pastel lime green
            '#aec6cf', // pastel blue-gray
            '#ffe4e1', // pastel coral
            '#e0bbf5', // pastel purple
            '#d5a6bd', // pastel mauve
            '#f6eac2', // pastel cream
            '#b4a7d6', // pastel periwinkle
            '#a2d2ff', // pastel sky blue
        ];

        const usedColors = categories.map(cat => cat.color);
        colorPalette = colorPalette.filter(color => !usedColors.includes(color));

        const color = colorPalette.length
        ? colorPalette[Math.floor(Math.random() * colorPalette.length)]
        : '#' + Math.floor(Math.random()*16777215).toString(16); 
        
        const newCategory = {
            name: name.toLowerCase(),
            display: name,
            color: color
        };
        
        categories.push(newCategory);
        saveCategoriesToLocalStorage();
        renderCategories();
        newCategoryInput.value = '';
    }
}

// Delete a category
function deleteCategory(name) {
    // Don't allow deletion if there are tasks in this category
    const tasksInCategory = todos.filter(todo => todo.category === name);
    if (tasksInCategory.length > 0) {
        alert(`Cannot delete category with ${tasksInCategory.length} tasks assigned!`);
        return;
    }
    
    categories = categories.filter(cat => cat.name !== name);
    saveCategoriesToLocalStorage();
    renderCategories();
}

function renderCategories() {
    // Clear existing options
    categorySelect.innerHTML = '';
    const filterSelect = document.getElementById('filter-category');
    filterSelect.innerHTML = '<option value="all">All</option>'; // Default

    categories.forEach(category => {
        // Add to task creation dropdown
        const option1 = document.createElement('option');
        option1.value = category.name;
        option1.textContent = category.display;
        categorySelect.appendChild(option1);

        // Add to filter dropdown
        const option2 = document.createElement('option');
        option2.value = category.name;
        option2.textContent = category.display;
        filterSelect.appendChild(option2);
    });

    // Render category tags (your existing code stays)
    categoryTags.innerHTML = '';
    categories.forEach(category => {
        const tag = document.createElement('div');
        tag.className = 'category-tag';
        tag.style.background = category.color;
        tag.innerHTML = `
            ${category.display}
            <span class="delete-category" onclick="deleteCategory('${category.name}')">&times;</span>
        `;
        categoryTags.appendChild(tag);
    });

    categoriesCount.textContent = categories.length;
}


function renderTodoList() {
    const filterValue = document.getElementById('filter-category').value;

    const filteredTodos = filterValue === "all"
        ? todos
        : todos.filter(todo => todo.category === filterValue);

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-state"><div style="font-size: 3rem; margin-bottom: 15px;">📝</div><h3>No Tasks Found</h3><p>Try adding one!</p></div>';
        renderCharts();
        return;
    }

    todoList.innerHTML = '';

    filteredTodos.forEach(todo => {
        const category = categories.find(cat => cat.name === todo.category);

        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleComplete(${todo.id})">
            <div class="todo-text">${todo.text}</div>
            ${category ? `<span class="todo-category" style="background: ${category.color}">${category.display}</span>` : ''}
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">×</button>
        `;
        todoList.appendChild(li);
    });

    renderCharts();
    updateCategoryTextColors();
}

// Update statistics
function updateStats() {
    totalTasks.textContent = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    completedTasks.textContent = completed;
    pendingTasks.textContent = todos.length - completed;
    
    // Update footer counter
    taskCounter.textContent = todos.length;
}

// Render charts
function renderCharts() {
    const filterValue = document.getElementById('filter-category').value;
    renderCategoryChart(filterValue);
    renderCompletionChart(filterValue);
}

// Render category distribution chart
// Render category distribution chart
function renderCategoryChart(filterValue = "all") {
    const ctx = document.getElementById('category-chart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    // Calculate data for the chart
    const categoryData = {};
    todos.forEach(todo => {
        if (filterValue === "all" || todo.category === filterValue) {
            if (categoryData[todo.category]) {
                categoryData[todo.category]++;
            } else {
                categoryData[todo.category] = 1;
            }
        }
    });
    
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    categories.forEach(category => {
        if (categoryData[category.name] > 0) {
            labels.push(category.display);
            data.push(categoryData[category.name]);
            backgroundColors.push(category.color);
        }
    });
    
    // Create new chart
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 16
                    },
                    bodyFont: {
                        size: 14
                    },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.chart.getDatasetMeta(0).total;
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} tasks (${percentage}%)`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: filterValue === "all" 
                        ? "Tasks by Category" 
                        : `Tasks in ${labels[0]}`, // show specific category name
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            },
            cutout: '55%',
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });
}


// Render completion chart
function renderCompletionChart(filterValue = "all") {
    const ctx = document.getElementById('completion-chart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (completionChart) {
        completionChart.destroy();
    }

    const filteredTodos = filterValue === "all"
    ? todos
    : todos.filter(todo => todo.category === filterValue);

    // Calculate data
    const completed = filteredTodos.filter(todo => todo.completed).length;
    const pending = filteredTodos.length - completed;

    // Create new chart
    completionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                label: 'Tasks',
                data: [completed, pending],
                backgroundColor: ['#fc8eac', '#f72585'],
                borderColor: ['#3a9fc4', '#c41e66'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Completion Status',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Name modal functions
function saveName() {
    const newName = nameInput.value.trim();
    if (newName) {
        userName = newName;
        localStorage.setItem('userName', newName);
        usernameSpan.textContent = newName;
        closeModal();
    }
}

function closeModal() {
    nameModal.style.display = 'none';
}

// Save todos to localStorage
function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Save categories to localStorage
function saveCategoriesToLocalStorage() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

function updateCategoryTextColors() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    document.querySelectorAll('.todo-category').forEach(tag => {
        // Get the background color
        const bgColor = window.getComputedStyle(tag).backgroundColor;
        // Convert to RGB numbers
        const rgb = bgColor.match(/\d+/g);
        if (rgb) {
            const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
            // If brightness is low, use light text, else dark text
            tag.style.color = (brightness < 125) ? '#fff' : '#000';
        }
    });
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Apply saved mode on load
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
}

// Toggle on change
darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
});

// Call this whenever dark mode is toggled
darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
    updateCategoryTextColors(); // Fix category text color after mode change
});

// Initialize the app when the page loads
window.onload = init;

// Expose functions to global scope for HTML event handlers
window.deleteTodo = deleteTodo;
window.toggleComplete = toggleComplete;
window.deleteCategory = deleteCategory;