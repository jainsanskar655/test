// Initialize Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkKHOVAopQ5Jrsp8EiCXsJS2Nzk2rCFHo",
  authDomain: "team-collab-platform-5869d.firebaseapp.com",
  projectId: "team-collab-platform-5869d",
  storageBucket: "team-collab-platform-5869d.firebasestorage.app",
  messagingSenderId: "208517151611",
  appId: "1:208517151611:web:a79abf92cd4d834c17dbde",
  measurementId: "G-ZKSWKTCZXM"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const authModal = document.getElementById('auth-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const app = document.getElementById('app');
const loadingScreen = document.getElementById('loading-screen');

// Auth State Listener
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        hideLoadingScreen();
        authModal.style.display = 'none';
        app.classList.remove('hidden');
        
        // Update UI with user info
        document.getElementById('username-display').textContent = user.displayName || user.email.split('@')[0];
        if (user.photoURL) {
            document.getElementById('user-avatar').src = user.photoURL;
        }
        
        // Initialize the rest of the app
        initializeApp(user);
    } else {
        // User is signed out
        hideLoadingScreen();
        app.classList.add('hidden');
        authModal.style.display = 'flex';
    }
});

// Login
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    showLoadingScreen();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            // Success handled by auth state listener
        })
        .catch(error => {
            hideLoadingScreen();
            showAlert(error.message, 'error');
        });
});

// Register
registerForm.addEventListener('submit', e => {
    e.preventDefault();
    showLoadingScreen();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    if (password !== confirm) {
        hideLoadingScreen();
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(cred => {
            return cred.user.updateProfile({
                displayName: name
            }).then(() => {
                // Create user document in Firestore
                return db.collection('users').doc(cred.user.uid).set({
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
        })
        .then(() => {
            // Success handled by auth state listener
        })
        .catch(error => {
            hideLoadingScreen();
            showAlert(error.message, 'error');
        });
});

// Logout
logoutBtn.addEventListener('click', e => {
    e.preventDefault();
    showLoadingScreen();
    auth.signOut();
});

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
        
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');
    });
});

// Close Modal
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        authModal.style.display = 'none';
    });
});

// Show loading screen
function showLoadingScreen() {
    loadingScreen.style.display = 'flex';
}

// Hide loading screen
function hideLoadingScreen() {
    loadingScreen.style.display = 'none';
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

// Initialize the rest of the app
function initializeApp(user) {
    // This will be called from main.js after auth is confirmed
    console.log('App initialized for user:', user.uid);
}