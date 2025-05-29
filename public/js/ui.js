// Set up task listeners
function setupTaskListeners(user) {
    // Task form submission
    const taskForm = document.getElementById('task-form');
    taskForm.addEventListener('submit', async e => {
        e.preventDefault();
        
        const taskData = {
            title: taskForm.elements['task-title'].value,
            description: taskForm.elements['task-description'].value,
            priority: taskForm.elements['task-priority'].value,
            status: taskForm.elements['task-status'].value,
            dueDate: taskForm.elements['task-due-date'].value,
            assignedTo: user.uid
        };
        
        try {
            if (taskForm.elements['task-id'].value) {
                // Update existing task
                await updateTask(taskForm.elements['task-id'].value, taskData);
                showAlert('Task updated successfully');
            } else {
                // Add new task
                await addTask(taskData);
                showAlert('Task added successfully');
            }
            
            // Close modal and refresh
            document.getElementById('task-modal').style.display = 'none';
            loadTaskManager(user);
            
            // Log activity
            await logActivity({
                userId: user.uid,
                userName: user.displayName,
                action: taskForm.elements['task-id'].value ? 'updated a task' : 'added a new task',
                icon: 'tasks'
            });
        } catch (error) {
            console.error('Error saving task:', error);
            showAlert('Failed to save task', 'error');
        }
    });
    
    // Edit/delete task buttons
    document.addEventListener('click', async e => {
        if (e.target.classList.contains('edit-task') || e.target.closest('.edit-task')) {
            const taskId = e.target.dataset.id || e.target.closest('.edit-task').dataset.id;
            const tasks = await getUserTasks(user.uid);
            const task = tasks.find(t => t.id === taskId);
            if (task) showTaskModal(task);
        }
        
        if (e.target.classList.contains('delete-task') || e.target.closest('.delete-task')) {
            if (confirm('Are you sure you want to delete this task?')) {
                const taskId = e.target.dataset.id || e.target.closest('.delete-task').dataset.id;
                try {
                    await deleteTask(taskId);
                    showAlert('Task deleted successfully');
                    loadTaskManager(user);
                    
                    // Log activity
                    await logActivity({
                        userId: user.uid,
                        userName: user.displayName,
                        action: 'deleted a task',
                        icon: 'trash'
                    });
                } catch (error) {
                    console.error('Error deleting task:', error);
                    showAlert('Failed to delete task', 'error');
                }
            }
        }
    });
}

// Set up task drag and drop
function setupTaskDragAndDrop() {
    const taskItems = document.querySelectorAll('.task-item');
    const taskLists = document.querySelectorAll('.task-list');
    
    taskItems.forEach(task => {
        task.addEventListener('dragstart', () => {
            task.classList.add('dragging');
        });
        
        task.addEventListener('dragend', () => {
            task.classList.remove('dragging');
        });
    });
    
    taskLists.forEach(list => {
        list.addEventListener('dragover', e => {
            e.preventDefault();
            const draggingTask = document.querySelector('.dragging');
            const afterElement = getDragAfterElement(list, e.clientY);
            
            if (afterElement) {
                list.insertBefore(draggingTask, afterElement);
            } else {
                list.appendChild(draggingTask);
            }
        });
        
        list.addEventListener('drop', async e => {
            e.preventDefault();
            const taskId = document.querySelector('.dragging').dataset.id;
            const newStatus = list.dataset.status;
            
            try {
                await updateTask(taskId, { status: newStatus });
                
                // Log activity
                const user = firebase.auth().currentUser;
                await logActivity({
                    userId: user.uid,
                    userName: user.displayName,
                    action: `moved a task to ${newStatus}`,
                    icon: 'arrows-alt'
                });
            } catch (error) {
                console.error('Error updating task status:', error);
                showAlert('Failed to update task status', 'error');
            }
        });
    });
}

// Helper function for drag and drop
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Close modals when clicking outside
window.addEventListener('click', e => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Dashboard Charts
function initializeCharts(tasks, pocs) {
    // Tasks by Status Chart
    const tasksCtx = document.getElementById('tasks-chart').getContext('2d');
    
    const tasksByStatus = {
        todo: tasks.filter(t => t.status === 'todo').length,
        progress: tasks.filter(t => t.status === 'progress').length,
        completed: tasks.filter(t => t.status === 'completed').length
    };
    
    new Chart(tasksCtx, {
        type: 'doughnut',
        data: {
            labels: ['To Do', 'In Progress', 'Completed'],
            datasets: [{
                data: [tasksByStatus.todo, tasksByStatus.progress, tasksByStatus.completed],
                backgroundColor: [
                    '#ff6384',
                    '#36a2eb',
                    '#4bc0c0'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Tasks by Status',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // POCs by Status Chart
    const pocsCtx = document.getElementById('pocs-chart').getContext('2d');
    
    const pocsByStatus = {
        'not-started': pocs.filter(p => p.status === 'not-started').length,
        'in-progress': pocs.filter(p => p.status === 'in-progress').length,
        completed: pocs.filter(p => p.status === 'completed').length,
        'on-hold': pocs.filter(p => p.status === 'on-hold').length
    };
    
    new Chart(pocsCtx, {
        type: 'bar',
        data: {
            labels: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
            datasets: [{
                label: 'POCs',
                data: [pocsByStatus['not-started'], pocsByStatus['in-progress'], pocsByStatus.completed, pocsByStatus['on-hold']],
                backgroundColor: [
                    '#ffcd56',
                    '#36a2eb',
                    '#4bc0c0',
                    '#ff6384'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'POCs by Status',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}