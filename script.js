document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const currentDateElement = document.getElementById('current-date');
    const currentTimeElement = document.getElementById('current-time');
    const newTaskInput = document.getElementById('new-task');
    const taskDateInput = document.getElementById('task-date');
    const taskTimeInput = document.getElementById('task-time');
    const taskPrioritySelect = document.getElementById('task-priority');
    const addTaskButton = document.getElementById('add-task');
    const pendingTasksContainer = document.getElementById('pending-tasks');
    const completedTasksContainer = document.getElementById('completed-tasks');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const viewButtons = document.querySelectorAll('.sidebar-menu button');
    const views = document.querySelectorAll('.view');
    const calendarMonthYear = document.getElementById('current-month-year');
    const calendarDays = document.getElementById('calendar-days');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const dateTasksContainer = document.getElementById('date-tasks');
    const selectedDateElement = document.getElementById('selected-date');
    const gameArea = document.getElementById('game-area');
    const startGameButton = document.getElementById('start-game');
    const scoreElement = document.getElementById('score');
    const timeElement = document.getElementById('time');
    const reminderModal = document.getElementById('reminder-modal');
    const reminderContent = document.getElementById('reminder-content');
    const dismissReminderButton = document.getElementById('dismiss-reminder');
    const snoozeReminderButton = document.getElementById('snooze-reminder');
    const closeModalButton = document.querySelector('.close-modal');
    const moodOptions = document.querySelectorAll('.mood-options span');
    const confettiCanvas = document.getElementById('confetti-canvas');
    const themeSwitch = document.getElementById('theme-switch');
    const dashboardView = document.getElementById('dashboard-view');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotBox = document.getElementById('chatbot-box');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    // App State
    const currentUser = sessionStorage.getItem('current_user');  // or localStorage.getItem('current_user')
    
    let tasks = getUserTasks(currentUser);
    let currentFilter = 'all';
    let currentView = 'tasks';
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = new Date();
    let gameInterval;
    let gameTime = 30;
    let gameScore = 0;
    let gameActive = false;
    let mood = localStorage.getItem('mood') || 'neutral';
    
    // Motivational Quotes
    const motivationalQuotes = [
        "The secret of getting ahead is getting started.",
        "You don't have to be great to start, but you have to start to be great.",
        "The future depends on what you do today.",
        "Success is the sum of small efforts, repeated day in and day out.",
        "The only limit to our realization of tomorrow is our doubts of today.",
        "Do something today that your future self will thank you for.",
        "Small steps every day lead to big results.",
        "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.",
        "You are capable of amazing things.",
        "Progress, not perfection."
    ];
    
    // Initialize the app
    init();
    handleAuth();

    // Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeSwitch.checked = true;
}

// Listen for toggle
themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

    
    function init() {

        const currentUser = sessionStorage.getItem('current_user');
        tasks = currentUser ? getUserTasks(currentUser) : [];
    if (currentUser) {
        tasks = getUserTasks(currentUser);
    } else {
        tasks = [];
    }
        // Set current date and time
        updateDateTime();
        setInterval(updateDateTime, 1000);
        
        // Set default task date to today
        const today = new Date().toISOString().split('T')[0];
        taskDateInput.value = today;
        
        // Set default task time to next hour
        const nextHour = new Date();
        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
        taskTimeInput.value = nextHour.toTimeString().substring(0, 5);
        
        // Load tasks
        renderTasks();
        
        // Initialize calendar
        renderCalendar();
        
        // Set current mood
        setMood(mood);
        
        // Check for reminders
        checkReminders();
        setInterval(checkReminders, 60000); // Check every minute
        
        // Event listeners
        addTaskButton.addEventListener('click', addTask);
        newTaskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
            saveUserTasks(currentUser, tasks);

        });
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentFilter = button.dataset.filter;
                renderTasks();
            });
        });
      function showTaskSuggestion() {
    const suggestionBox = document.getElementById('suggestion-bot');
    const suggestionText = document.getElementById('suggestion-text');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000;

    const todayTasks = tasks.filter(t => t.dueDate >= todayStart && t.dueDate < todayEnd && !t.completed);
    const overdueTasks = tasks.filter(t => t.dueDate < now.getTime() && !t.completed);
    const allDone = tasks.length > 0 && tasks.every(t => t.completed);
    const noTasks = tasks.length === 0;

    let message = '';

    if (noTasks) {
        message = "🧠 I see no tasks. Want to start by adding your first one?";
    } else if (allDone) {
        message = "🎉 All tasks completed! Time to relax or plan tomorrow.";
    } else if (todayTasks.length === 0) {
        message = "📅 Nothing scheduled for today. How about planning a task?";
    } else if (overdueTasks.length >= 3) {
        message = "⚠️ You have multiple overdue tasks. Want to review them?";
    } else if (todayTasks.length >= 5) {
        message = "💪 Busy day ahead! Focus on high-priority tasks first.";
    }

    if (message) {
        suggestionText.textContent = message;
        suggestionBox.classList.remove('hidden');
    } else {
        suggestionBox.classList.add('hidden');
    }
}       
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                viewButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentView = button.dataset.view;
                
                
                views.forEach(view => view.classList.add('hidden'));
                document.getElementById(`${currentView}-view`).classList.remove('hidden');
                
                if (currentView === 'calendar') {
                    renderCalendar();
                }
                if (currentView === 'dashboard') {
                renderDashboard();
                }

                if (currentView === 'chat') {
  renderChatUI();
}
            });
        });
        
        prevMonthButton.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
        
        nextMonthButton.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
        
        startGameButton.addEventListener('click', startGame);
        
        dismissReminderButton.addEventListener('click', dismissReminder);
        snoozeReminderButton.addEventListener('click', snoozeReminder);
        closeModalButton.addEventListener('click', () => {
            reminderModal.classList.remove('show');
        });
        
        moodOptions.forEach(option => {
            option.addEventListener('click', () => {
                setMood(option.dataset.mood);
            });
        });
    }
    
    function getUserTasks(username) {
    const allTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    return allTasks[username] || [];
}

function saveUserTasks(username, tasks) {
    const allTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    allTasks[username] = tasks;
    localStorage.setItem('tasks', JSON.stringify(allTasks));
}

    function updateDateTime() {
        const now = new Date();
        currentDateElement.textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        currentTimeElement.textContent = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', minute: '2-digit' 
        });
    }
    
    function addTask() {
    const currentUser = sessionStorage.getItem('current_user');
    if (!currentUser) return;
        const title = newTaskInput.value.trim();
        const date = taskDateInput.value;
        const time = taskTimeInput.value;
        const priority = taskPrioritySelect.value;
        
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        const dueDate = new Date(`${date}T${time}`);
        
        const task = {
            id: Date.now(),
            title,
            dueDate: dueDate.getTime(),
            priority,
            completed: false,
            createdAt: Date.now()
        };
        tasks.push(task);
    saveUserTasks(currentUser, tasks);
    renderTasks();
        
    
        // Reset input
        newTaskInput.value = '';
        newTaskInput.focus();
        
        // Show animation for new task
        const newTaskElement = document.querySelector(`[data-id="${task.id}"]`);
        if (newTaskElement) {
            newTaskElement.style.animation = 'none';
            void newTaskElement.offsetWidth; // Trigger reflow
            newTaskElement.style.animation = 'fadeIn 0.5s ease';
        }
        
        // If in calendar view, update it
        if (currentView === 'calendar') {
            renderCalendar();
        }
    }
    
    function saveTasks() {
    const currentUser = sessionStorage.getItem('current_user');
    if (currentUser) {
        saveUserTasks(currentUser, tasks);
    }
}
    
    function renderTasks() {

            const pendingList = document.getElementById('pending-tasks');
            const completedList = document.getElementById('completed-tasks');
        pendingTasksContainer.innerHTML = '';
        completedTasksContainer.innerHTML = '';
        
        let filteredTasks = [...tasks];
        
        // Apply filter
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const todayEnd = todayStart + 86400000;
        const weekEnd = todayStart + (86400000 * 7);
        
        switch (currentFilter) {
            case 'today':
                filteredTasks = filteredTasks.filter(task => 
                    task.dueDate >= todayStart && task.dueDate < todayEnd
                );
                break;
            case 'week':
                filteredTasks = filteredTasks.filter(task => 
                    task.dueDate >= todayStart && task.dueDate < weekEnd
                );
                break;
            case 'high':
                filteredTasks = filteredTasks.filter(task => 
                    task.priority === 'high'
                );
                break;
            case 'completed':
                filteredTasks = filteredTasks.filter(task => task.completed);
                break;
            // 'all' filter - no filtering needed
            showTaskSuggestion();
        }
        
        // Sort tasks by due date (earliest first)
        filteredTasks.sort((a, b) => a.dueDate - b.dueDate);
        
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            if (task.completed) {
                completedTasksContainer.appendChild(taskElement);
            } else {
                pendingTasksContainer.appendChild(taskElement);
            }
        });
        
            
    }
    
    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;
        
        const dueDate = new Date(task.dueDate);
        const dueDateString = dueDate.toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric' 
        });
        const dueTimeString = dueDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', minute: '2-digit' 
        });
        
        taskElement.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-due">
                    <i class="far fa-calendar-alt"></i>
                    ${dueDateString} at ${dueTimeString}
                    <span class="task-priority">${task.priority} priority</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-task"><i class="far fa-edit"></i></button>
                <button class="delete-task"><i class="far fa-trash-alt"></i></button>
            </div>
        `;
        
        // Add event listeners
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
        
        const editButton = taskElement.querySelector('.edit-task');
        editButton.addEventListener('click', () => editTask(task.id));
        
        const deleteButton = taskElement.querySelector('.delete-task');
        deleteButton.addEventListener('click', () => deleteTask(task.id));
        
        return taskElement;
    }
    
    function toggleTaskComplete(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
            
            // If task was completed, show confetti
            if (tasks[taskIndex].completed) {
                showConfetti();
                
                // Show motivational quote
                const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
                const notification = document.createElement('div');
                notification.className = 'notification';
                notification.textContent = `Great job! ${quote}`;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.remove();
                }, 5000);
            }
        }
    }
    
    function editTask(taskId) {
        const task = tasks.find(task => task.id === taskId);
        if (!task) return;
        
        newTaskInput.value = task.title;
        
        const dueDate = new Date(task.dueDate);
        taskDateInput.value = dueDate.toISOString().split('T')[0];
        taskTimeInput.value = dueDate.toTimeString().substring(0, 5);
        taskPrioritySelect.value = task.priority;
        
        // Remove the task
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        
        newTaskInput.focus();
    }
    
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
            
            // If in calendar view, update it
            if (currentView === 'calendar') {
                renderCalendar();
            }
        }
    }
    
    function renderCalendar() {

        const currentUser = sessionStorage.getItem('current_user');
    if (!currentUser) return;
    
    const userTasks = getUserTasks(currentUser);
        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        calendarMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        // Clear previous days
        calendarDays.innerHTML = '';
        
        // Get first day of month and total days in month
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Get days from previous month
        const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
        
        // Add days from previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = prevMonthDays - i;
            calendarDays.appendChild(dayElement);
        }
        
        // Add days from current month
        const today = new Date();
        const currentDate = new Date();
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = i;
            
            // Check if this day has tasks
            const dayStart = new Date(currentYear, currentMonth, i).getTime();
            const dayEnd = dayStart + 86400000;
            const hasTasks = tasks.some(task => 
                task.dueDate >= dayStart && task.dueDate < dayEnd
            );
            
            if (hasTasks) {
                dayElement.classList.add('has-tasks');
            }
            
            // Highlight today
            if (i === today.getDate() && 
                currentMonth === today.getMonth() && 
                currentYear === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            // Highlight selected date
            if (i === selectedDate.getDate() && 
                currentMonth === selectedDate.getMonth() && 
                currentYear === selectedDate.getFullYear()) {
                dayElement.classList.add('selected');
            }
            
            // Add click event
            dayElement.addEventListener('click', () => {
                selectedDate = new Date(currentYear, currentMonth, i);
                renderCalendar();
                showTasksForDate(selectedDate);
            });
            
            calendarDays.appendChild(dayElement);
        }
        
        // Add days from next month to fill the grid
        const totalDaysShown = firstDay + daysInMonth;
        const nextMonthDays = totalDaysShown <= 35 ? 35 - totalDaysShown : 42 - totalDaysShown;
        
        for (let i = 1; i <= nextMonthDays; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = i;
            calendarDays.appendChild(dayElement);
        }
        
        // Show tasks for selected date
        showTasksForDate(selectedDate);
    }
    
    function showTasksForDate(date) {
        selectedDateElement.textContent = date.toLocaleDateString('en-US', { 
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
        });
        
        dateTasksContainer.innerHTML = '';
        
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const dayEnd = dayStart + 86400000;
        
        const dayTasks = tasks.filter(task => 
            task.dueDate >= dayStart && task.dueDate < dayEnd
        );
        
        if (dayTasks.length === 0) {
            dateTasksContainer.innerHTML = '<p>No tasks for this day.</p>';
            return;
        }
        
        dayTasks.sort((a, b) => a.dueDate - b.dueDate).forEach(task => {
            const taskElement = createTaskElement(task);
            dateTasksContainer.appendChild(taskElement);
        });
    }
    
    function startGame() {
        if (gameActive) return;
        
        gameActive = true;
        gameScore = 0;
        gameTime = 30;
        scoreElement.textContent = gameScore;
        timeElement.textContent = gameTime;
        gameArea.innerHTML = '';
        startGameButton.disabled = true;
        
        // Create bubbles
        gameInterval = setInterval(() => {
            if (gameTime <= 0) {
                endGame();
                return;
            }
            
            gameTime--;
            timeElement.textContent = gameTime;
            
            // Create a new bubble every second
            createBubble();
        }, 1000);
        
        // Create initial bubbles
        for (let i = 0; i < 5; i++) {
            createBubble();
        }
    }
    
    function createBubble() {
        if (!gameActive) return;
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Random size between 30 and 80px
        const size = Math.floor(Math.random() * 50) + 30;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Random position
        const maxLeft = gameArea.offsetWidth - size;
        const maxTop = gameArea.offsetHeight - size;
        bubble.style.left = `${Math.floor(Math.random() * maxLeft)}px`;
        bubble.style.top = `${Math.floor(Math.random() * maxTop)}px`;
        
        // Random color tint
        const hue = Math.floor(Math.random() * 60) + 180; // Blue-green range
        bubble.style.backgroundColor = `hsla(${hue}, 80%, 70%, 0.7)`;
        
        // Click event
        bubble.addEventListener('click', () => {
            if (bubble.classList.contains('popped')) return;
            
            bubble.classList.add('popped');
            gameScore += Math.floor(100 - size); // Smaller bubbles give more points
            scoreElement.textContent = gameScore;
            
            setTimeout(() => {
                bubble.remove();
                createBubble(); // Replace popped bubble with new one
            }, 300);
        });
        
        gameArea.appendChild(bubble);
    }
    
    function endGame() {
        gameActive = false;
        clearInterval(gameInterval);
        startGameButton.disabled = false;
        
        // Show game over message
        const gameOver = document.createElement('div');
        gameOver.className = 'game-over';
        gameOver.innerHTML = `
            <h3>Game Over!</h3>
            <p>Your score: ${gameScore}</p>
        `;
        gameArea.appendChild(gameOver);
        
        // Show confetti if score is good
        if (gameScore > 500) {
            showConfetti();
        }
    }
    
    function checkReminders() {
            const currentUser = sessionStorage.getItem('current_user');
    if (!currentUser) return;
    
    const userTasks = getUserTasks(currentUser);
    const now = new Date().getTime();

    userTasks.forEach(task => {
        if (task.completed) return;

        const timeDiff = task.dueDate - now;
        const stage = task.reminderStage || 0;

        // Priority-based offset
        const offset = task.priority === 'high' ? 10 * 60000 : 0;

        if (stage === 0 && timeDiff <= 1800000 + offset) {
            showReminder(task, 'Reminder: 30 mins left!');
            task.reminderStage = 1;
        } else if (stage === 1 && timeDiff <= 900000 + offset) {
            showReminder(task, 'Just 15 mins left!');
            task.reminderStage = 2;
        } else if (stage === 2 && timeDiff <= 300000 + offset) {
            showReminder(task, '⚠️ Hurry! 5 mins left.');
            task.reminderStage = 3;
        }
    });

     saveUserTasks(currentUser, userTasks);
}

    
    function showReminder(task, message) {
        // Check if this task already has a reminder shown
        if (task.reminderShown) return;
        
        task.reminderShown = true;
        saveTasks();
        
        const dueDate = new Date(task.dueDate);
        const dueTimeString = dueDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', minute: '2-digit' 
        });
        
        reminderContent.innerHTML = `
        <p>${message}</p>
        <p>Task: <strong>${task.title}</strong></p>
        <p class="motivational-quote">${motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}</p>
    `;
    reminderModal.classList.add('show');
    }
    
    function dismissReminder() {
        reminderModal.classList.remove('show');
    }
    
    function snoozeReminder() {
        reminderModal.classList.remove('show');
        // In a real app, you would implement snooze functionality
        alert('Task reminder will pop up again in 5 minutes');
    }
    
    function setMood(selectedMood) {
        mood = selectedMood;
        localStorage.setItem('mood', mood);
        
        // Update UI
        moodOptions.forEach(option => {
            if (option.dataset.mood === mood) {
                option.style.transform = 'scale(1.3)';
                option.style.opacity = '1';
            } else {
                option.style.transform = 'scale(1)';
                option.style.opacity = '0.7';
            }
        });
        
        // Change background based on mood
        document.body.className = '';
        document.body.classList.add(`mood-${mood}`);
    }
    
    function showConfetti() {
        confettiCanvas.classList.remove('hidden');
        
        const canvas = confettiCanvas;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 150;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 10 + 5,
                speedX: Math.random() * 3 - 1.5,
                speedY: Math.random() * 3 + 2,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 5 - 2.5
            });
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let stillActive = false;
            
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                
                ctx.restore();
                
                p.x += p.speedX;
                p.y += p.speedY;
                p.rotation += p.rotationSpeed;
                
                if (p.y < canvas.height) {
                    stillActive = true;
                }
            }
            
            if (stillActive) {
                requestAnimationFrame(animate);
            } else {
                confettiCanvas.classList.add('hidden');
            }
        }
        
        animate();
    }
    function renderDashboard() {
        const currentUser = sessionStorage.getItem('current_user');
    if (!currentUser) return;
    
    const userTasks = getUserTasks(currentUser);
    const priorities = { low: 0, medium: 0, high: 0 };
    const status = { completed: 0, pending: 0 };
    const days = Array(7).fill(0); // last 7 days

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    tasks.forEach(task => {
        if (task.priority) priorities[task.priority]++;
        status[task.completed ? 'completed' : 'pending']++;

        const dayDiff = Math.floor((startOfToday - new Date(task.dueDate).setHours(0, 0, 0, 0)) / 86400000);
        if (dayDiff >= 0 && dayDiff < 7) {
            days[6 - dayDiff]++;
        }
    });

    new Chart(document.getElementById('tasks-by-priority'), {
        type: 'pie',
        data: {
            labels: ['Low', 'Medium', 'High'],
            datasets: [{
                label: 'Tasks by Priority',
                data: [priorities.low, priorities.medium, priorities.high],
                backgroundColor: ['#4bb543', '#f0ad4e', '#d9534f']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    new Chart(document.getElementById('tasks-per-day'), {
        type: 'bar',
        data: {
            labels: [...Array(7).keys()].map(i => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toLocaleDateString('en-US', { weekday: 'short' });
            }),
            datasets: [{
                label: 'Tasks per Day',
                data: days,
                backgroundColor: '#007dfa'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    new Chart(document.getElementById('task-status'), {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'Completed'],
            datasets: [{
                label: 'Task Status',
                data: [status.pending, status.completed],
                backgroundColor: ['#6c757d', '#4bb543']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}
function handleAuth() {
    const authScreen = document.getElementById('auth-screen');
    const authTitle = document.getElementById('auth-title');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const authSubmit = document.getElementById('auth-submit');
    const toggleLink = document.getElementById('toggle-auth-mode');
    const authMessage = document.getElementById('auth-message');
    const logoutBtn = document.getElementById('logout-btn');

    let mode = 'login'; // or 'register'

    function renderAuthScreen() {
        authTitle.textContent = mode === 'login' ? 'Login' : 'Register';
        authSubmit.textContent = mode === 'login' ? 'Login' : 'Register';
        toggleLink.textContent = mode === 'login' ? 'Register here' : 'Back to Login';
    }

    renderAuthScreen();

    toggleLink.onclick = (e) => {
        e.preventDefault();
        mode = mode === 'login' ? 'register' : 'login';
        renderAuthScreen();
        authMessage.textContent = '';
    };

    authSubmit.onclick = () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        if (!username || !password) {
            authMessage.textContent = "Username and password required.";
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');

        if (mode === 'register') {
            if (users[username]) {
                authMessage.textContent = "Username already exists.";
                return;
            }
            users[username] = { password };
            localStorage.setItem('users', JSON.stringify(users));
            authMessage.textContent = "Registered! You can now log in.";
            mode = 'login';
            renderAuthScreen();
        } else {
            if (!users[username] || users[username].password !== password) {
                authMessage.textContent = "Invalid credentials.";
                return;
            }

            // Login success
            sessionStorage.setItem('authenticated', 'true');
            sessionStorage.setItem('current_user', username);
            authScreen.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            document.getElementById('chat-tab-btn').classList.remove('hidden');
            renderChatUI();
        }
    };

    logoutBtn.onclick = () => {
  const currentUser = sessionStorage.getItem('current_user');
  if (currentUser && tasks.length) {
    // 💾 Make sure all tasks are saved before logging out
    saveUserTasks(currentUser, tasks);
  }
  sessionStorage.clear();
  location.reload();
};

    if (sessionStorage.getItem('authenticated') === 'true') {
        authScreen.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        document.getElementById('chat-tab-btn').classList.remove('hidden');
        renderChatUI();
    } else {
        authScreen.classList.remove('hidden');
    }
}

chatbotToggle.addEventListener('click', () => {
  const isOpen = !chatbotBox.classList.contains('hidden');
  chatbotBox.classList.toggle('hidden');
  chatbotToggle.textContent = isOpen ? '💬' : '❌';
});

chatbotInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const userMsg = chatbotInput.value.trim();
    if (!userMsg) return;
    chatbotInput.value = '';
    addMessage("user", userMsg);
    respondToMessage(userMsg.toLowerCase());
  }
});

function addMessage(sender, text) {
  const div = document.createElement('div');
  div.textContent = (sender === "user" ? "🧑 " : "🤖 ") + text;
  chatbotMessages.appendChild(div);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function respondToMessage(msg) {
  const knowledgeBase = {
    "how to add a task": "Use the input fields under 'Add a new task...' and click 'Add Task'.",
    "change password": "Click the 'Change Password' button on the bottom left if you're logged in.",
    "dark mode": "Use the toggle switch in the top-right to switch between dark and light themes.",
    "completed tasks": "Scroll down in the Tasks view — completed tasks appear under 'Completed Tasks'.",
    "mood": "Select how you're feeling in the sidebar under 'How are you feeling?'.",
    "dashboard": "Click the Dashboard button on the left sidebar to see charts and insights.",
    "reminder": "Tasks will show reminders 30, 15, and 5 mins before they're due.",
    "game": "Go to the 'Relax Game' section in the sidebar to play a bubble popper game.",
    "edit task": "Click the pencil icon next to a task to edit it.",
    "delete task": "Click the trash icon next to a task to delete it."
  };

  const found = Object.keys(knowledgeBase).find(k => msg.includes(k));
  if (found) {
    addMessage("bot", knowledgeBase[found]);
  } else {
    addMessage("bot", "🤖 Sorry, I didn't understand that. Try asking about 'add a task', 'dashboard', or 'dark mode'.");
  }
}

function loadUsers() {
  const userData = JSON.parse(localStorage.getItem('users') || '{}');
  return userData;
}

function getCurrentUser() {
  return sessionStorage.getItem('current_user');
}

function sendMessage(from, to, message) {
  const key = `chat_${from}_${to}`;
  const reverseKey = `chat_${to}_${from}`;
  const thread = JSON.parse(localStorage.getItem(key) || '[]');
  thread.push({ sender: from, message, timestamp: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(thread));
}

function loadThread(userA, userB) {
  const key = `chat_${userA}_${userB}`;
  const reverseKey = `chat_${userB}_${userA}`;
  const messages = JSON.parse(localStorage.getItem(key) || '[]');
  return messages;
}

    function renderChatUI() {
  const currentUser = sessionStorage.getItem('current_user');
  const users = JSON.parse(localStorage.getItem('users') || '{}');
  const userList = document.getElementById('chat-users');
  const thread = document.getElementById('chat-thread');
  const input = document.getElementById('chat-msg');
  const sendBtn = document.getElementById('chat-send');
  const chatWithLabel = document.getElementById('chat-with-label');

  userList.innerHTML = '';
  Object.keys(users).forEach(u => {
    if (u === currentUser) return;
    const btn = document.createElement('button');
    btn.textContent = u;
    btn.onclick = () => {
      sessionStorage.setItem('chat_with', u);
      chatWithLabel.textContent = `Chatting with ${u}`;
      loadChat(currentUser, u);
    };
    userList.appendChild(btn);
  });

  const currentChatWith = sessionStorage.getItem('chat_with');
  if (currentChatWith) {
    chatWithLabel.textContent = `Chatting with ${currentChatWith}`;
    loadChat(currentUser, currentChatWith);
  }

  sendBtn.onclick = () => {
    const msg = input.value.trim();
    const chatWith = sessionStorage.getItem('chat_with');
    if (!msg || !chatWith) return;
    const key = `chat_${currentUser}_${chatWith}`;
    const messages = JSON.parse(localStorage.getItem(key) || '[]');
    messages.push({ from: currentUser, msg, time: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(messages));
    input.value = '';
    loadChat(currentUser, chatWith);

    Object.keys(users).forEach(u => {
  if (u === currentUser) return;

  const key = `chat_${u}_${currentUser}`;
  const messages = JSON.parse(localStorage.getItem(key) || '[]');
  const seenKey = `seen_by_${currentUser}_${u}`;
  const lastSeen = new Date(localStorage.getItem(seenKey) || 0);

  const unreadCount = messages.filter(m => new Date(m.time) > lastSeen).length;

  const btn = document.createElement('button');
  btn.textContent = unreadCount > 0 ? `${u} (${unreadCount})` : u;
  btn.onclick = () => {
    sessionStorage.setItem('chat_with', u);
    document.getElementById('chat-with-label').textContent = `Chatting with ${u}`;
    loadChat(currentUser, u);
  };
  userList.appendChild(btn);
});

  };
}
function loadChat(from, to) {
  const keyA = `chat_${from}_${to}`;
  const keyB = `chat_${to}_${from}`;
  const messagesA = JSON.parse(localStorage.getItem(keyA) || '[]');
  const messagesB = JSON.parse(localStorage.getItem(keyB) || '[]');

  const allMessages = [...messagesA, ...messagesB].sort((a, b) =>
    new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  const thread = document.getElementById('chat-thread');
  thread.innerHTML = '';
  allMessages.forEach(m => {
    const div = document.createElement('div');
    div.className = m.from === from ? 'chat-bubble sent' : 'chat-bubble received';
    div.innerHTML = `<span class="chat-sender">${m.from}:</span> ${m.msg} <span class="chat-time">${new Date(m.time).toLocaleTimeString()}</span>`;
    thread.appendChild(div);
  });

  // Mark messages as seen by setting "seen_by_[user]_[chatWith]"
  const seenKey = `seen_by_${from}_${to}`;
  localStorage.setItem(seenKey, new Date().toISOString());
  thread.scrollTop = thread.scrollHeight;

}


if (sessionStorage.getItem('authenticated') === 'true') {
  document.getElementById('chat-inbox').classList.remove('hidden');
  renderChatUI();
}

// Optional: Esc key to close chatbot
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!chatbotBox.classList.contains('hidden')) {
      chatbotBox.classList.add('hidden');
      chatbotToggle.textContent = '💬';
    }
  }
});
    // Handle window resize
    window.addEventListener('resize', () => {
        if (currentView === 'calendar') {
            renderCalendar();
        }
    });

});