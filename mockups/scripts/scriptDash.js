const SECTION_FILES = {
    recipes: 'recipes.html',
    ingredients: 'ingredients.html',
    conversion: 'conversion.html',
    scaling: 'scaling.html',
    costs: 'costs.html',
    quotes: 'quotes.html',
    profile: 'profile.html'
};

const DOM = {
    contentArea: document.getElementById('contentArea'),
    menuItems: document.querySelectorAll('.menu-item'),
    profileSection: document.getElementById('profileSection')
};

let activeSection = null;

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
    loadSection('profile');
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

// Initialize Lucide icons
lucide.createIcons();

initializeEventListeners();