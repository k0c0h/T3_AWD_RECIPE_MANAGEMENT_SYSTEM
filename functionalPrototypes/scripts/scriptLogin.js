const USERS = {
    chef: {
        username: 'chef',
        password: 'chef123',
        role: 'chef',
        name: 'Chef Principal',
        permissions: ['calendar', 'clients','recipes', 'ingredients', 'conversion', 'scaling', 'costs', 'quotes']
    },
    cliente: {
        username: 'cliente',
        password: 'cliente123',
        role: 'client',
        name: 'Cliente',
        permissions: ['quoterequest', 'history']  // Solo estas dos secciones
    }
};

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', handleLogin);

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    const user = USERS[username];
    
    if (!user || user.password !== password) {
        showError('Invalid username or password');
        return;
    }
    
    // Guardar sesión
    const sessionData = {
        username: user.username,
        role: user.role,
        name: user.name,
        permissions: user.permissions,
        loginTime: new Date().toISOString()
    };
    
    sessionStorage.setItem('userSession', JSON.stringify(sessionData));
    
    // Redireccionar al dashboard
    window.location.href = 'index.html';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// Verificar si ya hay sesión activa
function checkExistingSession() {
    const session = sessionStorage.getItem('userSession');
    if (session) {
        window.location.href = 'index.html';
    }
}

checkExistingSession();
