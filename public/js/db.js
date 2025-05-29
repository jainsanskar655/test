// Firestore Database Operations
const db = firebase.firestore();

// Users Collection
const usersCollection = db.collection('users');

// Messages Collection
const messagesCollection = db.collection('messages');

// POCs Collection
const pocsCollection = db.collection('pocs');

// Tasks Collection
const tasksCollection = db.collection('tasks');

// Activities Collection
const activitiesCollection = db.collection('activities');

// Get all users
function getAllUsers() {
    return usersCollection.get().then(snapshot => {
        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return users;
    });
}

// Get user by ID
function getUserById(userId) {
    return usersCollection.doc(userId).get().then(doc => {
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        }
        return null;
    });
}

// Send a message
function sendMessage(senderId, receiverId, content) {
    return messagesCollection.add({
        senderId,
        receiverId,
        content,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        read: false
    });
}

// Get conversation between two users
function getConversation(user1Id, user2Id) {
    return messagesCollection
        .where('senderId', 'in', [user1Id, user2Id])
        .where('receiverId', 'in', [user1Id, user2Id])
        .orderBy('timestamp')
        .get()
        .then(snapshot => {
            const messages = [];
            snapshot.forEach(doc => {
                messages.push({ id: doc.id, ...doc.data() });
            });
            return messages;
        });
}

// Get all POCs
function getAllPOCs() {
    return pocsCollection
        .orderBy('createdAt', 'desc')
        .get()
        .then(snapshot => {
            const pocs = [];
            snapshot.forEach(doc => {
                pocs.push({ id: doc.id, ...doc.data() });
            });
            return pocs;
        });
}

// Add a new POC
function addPOC(pocData) {
    return pocsCollection.add({
        ...pocData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Update a POC
function updatePOC(pocId, updateData) {
    return pocsCollection.doc(pocId).update({
        ...updateData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Delete a POC
function deletePOC(pocId) {
    return pocsCollection.doc(pocId).delete();
}

// Get tasks for a user
function getUserTasks(userId) {
    return tasksCollection
        .where('assignedTo', '==', userId)
        .orderBy('dueDate')
        .get()
        .then(snapshot => {
            const tasks = [];
            snapshot.forEach(doc => {
                tasks.push({ id: doc.id, ...doc.data() });
            });
            return tasks;
        });
}

// Add a new task
function addTask(taskData) {
    return tasksCollection.add({
        ...taskData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Update a task
function updateTask(taskId, updateData) {
    return tasksCollection.doc(taskId).update({
        ...updateData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Delete a task
function deleteTask(taskId) {
    return tasksCollection.doc(taskId).delete();
}

// Get recent activities
function getRecentActivities(limit = 10) {
    return activitiesCollection
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get()
        .then(snapshot => {
            const activities = [];
            snapshot.forEach(doc => {
                activities.push({ id: doc.id, ...doc.data() });
            });
            return activities;
        });
}

// Log an activity
function logActivity(activityData) {
    return activitiesCollection.add({
        ...activityData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Export functions
export {
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
};