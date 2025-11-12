const SECTION_FILES = {
    calendar: './panels/calendar.html',
    clients: './panels/clients.html',
    recipes: './panels/recipes.html',
    ingredients: './panels/ingredients.html',
    conversion: './panels/conversion.html',
    scaling: './panels/scaling.html',
    costs: './panels/costs.html',
    quotes: './panels/quotes.html',
    quoterequest: './panels/quoterequest.html', 
    history: './panels/history.html', 
    profile: './panels/profile.html'
};

const DOM = {
    contentArea: document.getElementById('contentArea'),
    menuItems: document.querySelectorAll('.menu-item'),
    profileSection: document.getElementById('profileSection')
};

let activeSection = null;
let currentUser = null;

// Verificar sesión al cargar
function checkSession() {
    const session = sessionStorage.getItem('userSession');
    
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }
    
    currentUser = JSON.parse(session);
    updateProfileInfo();
    filterMenuByPermissions();
    return true;
}

function updateProfileInfo() {
    const profileName = document.querySelector('.profile-name');
    const profileRole = document.querySelector('.profile-role');
    
    if (profileName) profileName.textContent = currentUser.name;
    if (profileRole) {
        profileRole.textContent = currentUser.role === 'chef' ? 'Chef' : 'Client';
    }
}

function filterMenuByPermissions() {
    DOM.menuItems.forEach(item => {
        const section = item.dataset.section;
        
        if (!currentUser.permissions.includes(section)) {
            item.style.display = 'none';
        }
    });
    
    // Ocultar categorías si no tienen items visibles
    hideEmptyCategories();
    
    // Cargar primera sección disponible
    const firstAvailable = currentUser.permissions[0];
    if (firstAvailable) {
        loadSection(firstAvailable);
    }
}

function hideEmptyCategories() {
    const categories = document.querySelectorAll('.menu-category');
    
    categories.forEach(category => {
        let nextElement = category.nextElementSibling;
        let hasVisibleItems = false;
        
        while (nextElement && !nextElement.classList.contains('menu-category')) {
            if (nextElement.classList.contains('menu-item') && 
                nextElement.style.display !== 'none') {
                hasVisibleItems = true;
                break;
            }
            nextElement = nextElement.nextElementSibling;
        }
        
        if (!hasVisibleItems) {
            category.style.display = 'none';
        }
    });
}

function removeActiveClass() {
    DOM.menuItems.forEach(item => item.classList.remove('active'));
}

function addActiveClassToSection(section) {
    DOM.menuItems.forEach(item => {
        if (item.dataset.section === section) {
            item.classList.add('active');
        }
    });
}

function createIframe(filePath, sectionName) {
    return `<iframe src="${filePath}" title="${sectionName}"></iframe>`;
}

function createFileNotFoundMessage(section) {
    return `
        <div class="welcome-message">
            <h2>File Not Found</h2>
            <p>The file for <strong>${section}</strong> doesn't exist yet. Create the corresponding file to view it here.</p>
        </div>
    `;
}

function renderSection(section) {
    const filePath = SECTION_FILES[section];
    
    if (filePath) {
        DOM.contentArea.innerHTML = createIframe(filePath, section);
        activeSection = section;
    } else {
        DOM.contentArea.innerHTML = createFileNotFoundMessage(section);
    }
}

function loadSection(section) {
    // Verificar permisos
    if (!currentUser.permissions.includes(section)) {
        DOM.contentArea.innerHTML = `
            <div class="welcome-message">
                <h2>Access Denied</h2>
                <p>You don't have permission to access this section.</p>
            </div>
        `;
        return;
    }
    
    removeActiveClass();
    addActiveClassToSection(section);
    renderSection(section);
}

function handleMenuItemClick(event) {
    event.preventDefault();
    const section = event.currentTarget.dataset.section;
    loadSection(section);
}

function handleProfileClick() {
    const profileMenu = document.createElement('div');
    profileMenu.className = 'profile-menu';
    profileMenu.innerHTML = `
        <div class="profile-menu-content">
            <div class="profile-menu-header">
                <strong>${currentUser.name}</strong>
                <span>${currentUser.role === 'chef' ? 'Chef Account' : 'Client Account'}</span>
            </div>
            <button class="btn-logout" onclick="logout()">
                <i data-lucide="log-out"></i>
                Sign Out
            </button>
        </div>
    `;
    
    // Remover menú existente si hay
    const existing = document.querySelector('.profile-menu');
    if (existing) {
        existing.remove();
        return;
    }
    
    document.body.appendChild(profileMenu);
    lucide.createIcons();
    
    // Cerrar al hacer click fuera
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!e.target.closest('.profile-section') && !e.target.closest('.profile-menu')) {
                profileMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

function logout() {
    sessionStorage.removeItem('userSession');
    window.location.href = 'login.html';
}

function handleIframeError(event) {
    if (event.target.tagName === 'IFRAME') {
        const section = activeSection || 'this section';
        DOM.contentArea.innerHTML = createFileNotFoundMessage(section);
    }
}

function initializeEventListeners() {
    DOM.menuItems.forEach(item => {
        item.addEventListener('click', handleMenuItemClick);
    });

    DOM.profileSection.addEventListener('click', handleProfileClick);

    document.addEventListener('error', handleIframeError, true);
}

// Inicializar
if (checkSession()) {
    lucide.createIcons();
    initializeEventListeners();
}