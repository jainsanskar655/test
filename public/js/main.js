import { 
    getAllUsers, 
    getUserById, 
    sendMessage, 
    getConversation, 
    getAllPOCs, 
    addPOC, 
    updatePOC, 
    deletePOC, 
    getUserTasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    getRecentActivities, 
    logActivity 
} from './db.js';

// Initialize the app after authentication
function initializeApp(user) {
    // Load all sections
    loadDashboard(user);
    loadMessages(user);
    loadPOCTracker(user);
    loadTaskManager(user);
    
    // Set up event listeners
    setupEventListeners(user);
    
    // Set up theme toggle
    setupThemeToggle();
    
    // Set up navigation
    setupNavigation();
}

// Load dashboard data
async function loadDashboard(user) {
    try {
        // Get recent activities
        const activities = await getRecentActivities();
        displayActivities(activities);
        
        // Get user tasks for stats
        const tasks = await getUserTasks(user.uid);
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        document.getElementById('completed-tasks').textContent = completedTasks;
        
        // Calculate completion percentage
        const completionPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
        document.querySelector('.progress-text').textContent = `${completionPercentage}%`;
        
        // Set up progress ring
        const circle = document.querySelector('.progress-ring-circle');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference - (completionPercentage / 100) * circumference;
        
        // Initialize charts
        initializeCharts(tasks, []);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Failed to load dashboard data', 'error');
    }
}

// Load messages section
async function loadMessages(user) {
    try {
        // Get all users for conversation list
        const users = await getAllUsers();
        displayUsersList(users.filter(u => u.id !== user.uid));
        
        // Set up message event listeners
        setupMessageListeners(user);
    } catch (error) {
        console.error('Error loading messages:', error);
        showAlert('Failed to load messages', 'error');
    }
}

// Load POC Tracker section
async function loadPOCTracker(user) {
    try {
        // Get all POCs
        const pocs = await getAllPOCs();
        displayPOCsDaily(pocs);
        
        // Set up POC event listeners
        setupPOCListeners(user);
    } catch (error) {
        console.error('Error loading POC tracker:', error);
        showAlert('Failed to load POC tracker', 'error');
    }
}

// Load Task Manager section
async function loadTaskManager(user) {
    try {
        // Get user tasks
        const tasks = await getUserTasks(user.uid);
        displayTasks(tasks);
        
        // Set up task event listeners
        setupTaskListeners(user);
    } catch (error) {
        console.error('Error loading task manager:', error);
        showAlert('Failed to load tasks', 'error');
    }
}

// Set up event listeners
function setupEventListeners(user) {
    // Section navigation
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    // Add POC button
    document.getElementById('add-poc-btn').addEventListener('click', () => {
        showPOCModal();
    });
    
    // Add task button
    document.getElementById('add-task-btn').addEventListener('click', () => {
        showTaskModal();
    });
    
    // View toggle for POC tracker
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const view = btn.getAttribute('data-view');
            document.querySelectorAll('.poc-view').forEach(v => v.classList.remove('active'));
            document.getElementById(`poc-${view}-view`).classList.add('active');
        });
    });
    
    // Task filters
    document.getElementById('task-filter').addEventListener('change', async () => {
        const filter = document.getElementById('task-filter').value;
        const tasks = await getUserTasks(user.uid);
        displayTasks(tasks, filter);
    });
    
    // Task sort
    document.getElementById('task-sort').addEventListener('change', async () => {
        const sort = document.getElementById('task-sort').value;
        const tasks = await getUserTasks(user.uid);
        displayTasks(tasks, null, sort);
    });
}

// Set up theme toggle
function setupThemeToggle() {
    const themeSwitch = document.getElementById('theme-switch');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeSwitch.checked = savedTheme === 'dark';
    
    // Toggle theme on switch
    themeSwitch.addEventListener('change', () => {
        const newTheme = themeSwitch.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Set up navigation
function setupNavigation() {
    // Show dashboard by default
    showSection('dashboard');
}

// Show a specific section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelector(`.main-nav a[data-section="${sectionId}"]`).classList.add('active');
}

// Display activities
function displayActivities(activities) {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-${activity.icon || 'bell'}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-user">${activity.userName}</div>
                <div class="activity-action">${activity.action}</div>
                <div class="activity-time">${formatDate(activity.timestamp?.toDate())}</div>
            </div>
        `;
        activityList.appendChild(li);
    });
}

// Format date
function formatDate(date) {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Show alert message
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Initialize the app when auth is ready
window.initializeApp = initializeApp;