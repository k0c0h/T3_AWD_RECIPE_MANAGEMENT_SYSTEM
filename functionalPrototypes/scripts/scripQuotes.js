const API_BASE = window.API_URL || 'http://localhost:5000/api';
const TAX_RATE = 0.15;

class QuoteManager {
    constructor() {
        this.quotes = [];
        this.recipes = [];
        this.selectedRecipes = new Map();
        this.init();
    }

    async init() {
        await this.fetchRecipes();
        await this.fetchQuotes();
        await this.fetchClients(); 
        this.renderQuotesTable();
        this.attachEventListeners();
    }


    async fetchRecipes() {
        try {
            const res = await fetch(`${API_BASE}/recipes`);
            if (!res.ok) throw new Error('Recipes fetch error');
            const data = await res.json();
            this.recipes = data.map(r => ({ ...r, id: String(r._id || r.id) }));
        } catch (e) {
            console.warn('Falling back to local recipes. Error:', e);
            this.recipes = [
                { id: '1', name: 'Pasta Carbonara', type: 'main', costPerServing: 1.13, pricePerServing: 3.50 },
                { id: '2', name: 'Caesar Salad', type: 'appetizer', costPerServing: 2.10, pricePerServing: 4.20 },
                { id: '3', name: 'Cheesecake', type: 'dessert', costPerServing: 1.50, pricePerServing: 2.75 },
            ];
        }
    }

    async fetchQuotes() {
        try {
            const res = await fetch(`${API_BASE}/quotes`);
            if (!res.ok) throw new Error('Quotes fetch error');
            const data = await res.json();
            this.quotes = data.map(q => ({ ...q, id: String(q._id || q.id) }));
        } catch (e) {
            console.warn('Falling back to local quotes. Error:', e);
            this.quotes = [
                { id: '1', number: 'QUO-001', client: { name: 'María González' }, date: '2025-10-15', total: 450.00, status: 'approved' },
            ];
        }
    }

    attachEventListeners() {
        const si = document.getElementById('searchInput');
        const sf = document.getElementById('statusFilter');
        const nop = document.getElementById('numberOfPeople');
        const disc = document.getElementById('discount');

        if (si) si.addEventListener('input', () => this.filterQuotes());
        if (sf) sf.addEventListener('change', () => this.filterQuotes());
        if (nop) nop.addEventListener('input', () => this.updateAllServings());
        if (disc) disc.addEventListener('input', () => this.calculateTotal());
    }

    renderQuotesTable() {
        const tbody = document.getElementById('quotesTableBody');
        if (!tbody) return;

        const searchTermEl = document.getElementById('searchInput');
        const statusFilterEl = document.getElementById('statusFilter');
        const searchTerm = searchTermEl ? searchTermEl.value.toLowerCase() : '';
        const statusFilter = statusFilterEl ? statusFilterEl.value : 'all';

        const filteredQuotes = this.quotes.filter(quote => {
            const clientName = quote.client?.name?.toLowerCase?.() || (quote.client || '').toString().toLowerCase();
            const number = (quote.number || '').toString().toLowerCase();
            const matchesSearch = clientName.includes(searchTerm) || number.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        tbody.innerHTML = filteredQuotes.map(quote => `
            <tr>
                <td>${quote.number}</td>
                <td>${quote.client?.name || quote.client || '—'}</td>
                <td>${this.formatDate(quote.date)}</td>
                <td>$${(quote.total || 0).toFixed(2)}</td>
                <td><span class="status-badge status-${quote.status}">${quote.status}</span></td>
                <td>
                    <button class="btn-secondary btn-small" onclick="quoteManager.viewQuoteDetails('${quote.id}')">
                        <i data-lucide="eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');

        if (window.lucide) lucide.createIcons();
    }

    filterQuotes() {
        this.renderQuotesTable();
    }

    showNewQuoteForm() {
        this.selectedRecipes.clear();
        this.renderRecipesTable();
        this.resetForm();
        this.showModal();
    }

    renderRecipesTable() {
        const tbody = document.getElementById('recipesTableBody');
        if (!tbody) return;

        const numberOfPeople = parseInt(document.getElementById('numberOfPeople')?.value) || 50;

        tbody.innerHTML = this.recipes.map(recipe => {
            const rid = String(recipe.id);
            const servings = this.selectedRecipes.get(rid) || numberOfPeople;
            return `
                <tr>
                    <td><input type="checkbox" id="recipe-${rid}" onchange="quoteManager.toggleRecipe('${rid}')"></td>
                    <td>${recipe.name}</td>
                    <td style="text-transform: capitalize;">${recipe.type}</td>
                    <td><input type="number" id="servings-${rid}" value="${servings}" min="1" onchange="quoteManager.updateServings('${rid}', this.value)"></td>
                    <td>$${(recipe.costPerServing || 0).toFixed(2)}</td>
                    <td>$${(recipe.pricePerServing || 0).toFixed(2)}</td>
                </tr>
            `;
        }).join('');
    }

    toggleRecipe(recipeId) {
        const checkbox = document.getElementById(`recipe-${recipeId}`);
        const servingsInput = document.getElementById(`servings-${recipeId}`);
        if (!servingsInput) return;

        if (checkbox && checkbox.checked) {
            this.selectedRecipes.set(String(recipeId), parseInt(servingsInput.value, 10));
        } else {
            this.selectedRecipes.delete(String(recipeId));
        }
        this.calculateTotal();
    }

    updateServings(recipeId, servings) {
        const checkbox = document.getElementById(`recipe-${recipeId}`);
        const parsed = parseInt(servings, 10) || 1;
        if (checkbox && checkbox.checked) {
            this.selectedRecipes.set(String(recipeId), parsed);
            this.calculateTotal();
        }
    }

    updateAllServings() {
        const numberOfPeople = parseInt(document.getElementById('numberOfPeople')?.value) || 50;
        this.recipes.forEach(recipe => {
            const rid = String(recipe.id);
            const servingsInput = document.getElementById(`servings-${rid}`);
            if (servingsInput) {
                servingsInput.value = numberOfPeople;
                const checkbox = document.getElementById(`recipe-${rid}`);
                if (checkbox && checkbox.checked) {
                    this.selectedRecipes.set(rid, numberOfPeople);
                }
            }
        });
        this.calculateTotal();
    }

    calculateTotal() {
        let subtotal = 0;
        this.selectedRecipes.forEach((servings, recipeId) => {
            const recipe = this.recipes.find(r => String(r.id) === String(recipeId));
            if (recipe) {
                subtotal += (recipe.pricePerServing || 0) * servings;
            }
        });

        const discountPercent = parseFloat(document.getElementById('discount')?.value) || 0;
        const discountAmount = subtotal * (discountPercent / 100);
        const subtotalAfterDiscount = subtotal - discountAmount;
        const taxAmount = subtotalAfterDiscount * TAX_RATE;
        const total = subtotalAfterDiscount + taxAmount;

        const setText = (id, txt) => {
            const el = document.getElementById(id);
            if (el) el.textContent = txt;
        };

        setText('subtotal', `$${subtotal.toFixed(2)}`);
        setText('discountPercent', `${discountPercent.toFixed(1)}`);
        setText('discountAmount', `-$${discountAmount.toFixed(2)}`);
        setText('taxAmount', `$${taxAmount.toFixed(2)}`);
        setText('totalAmount', `$${total.toFixed(2)}`);
    }

    async generatePDF() {
        const clientId = document.getElementById('clientSelect')?.value;
        const eventDate = document.getElementById('eventDate')?.value;
        const numberOfPeople = parseInt(document.getElementById('numberOfPeople')?.value) || 50;
        const discountPercent = parseFloat(document.getElementById('discount')?.value) || 0;

        if (!clientId || !eventDate) {
            alert('Please select a client and event date');
            return;
        }

        if (this.selectedRecipes.size === 0) {
            alert('Please select at least one recipe');
            return;
        }

        const subtotalText = document.getElementById('subtotal')?.textContent || '$0.00';
        const discountAmountText = document.getElementById('discountAmount')?.textContent || '$0.00';
        const taxAmountText = document.getElementById('taxAmount')?.textContent || '$0.00';
        const totalText = document.getElementById('totalAmount')?.textContent || '$0.00';

        const subtotal = parseFloat(subtotalText.replace(/[^0-9.-]+/g, '')) || 0;
        const discountAmount = parseFloat(discountAmountText.replace(/[^0-9.-]+/g, '')) || 0;
        const taxAmount = parseFloat(taxAmountText.replace(/[^0-9.-]+/g, '')) || 0;
        const total = parseFloat(totalText.replace(/[^0-9.-]+/g, '')) || 0;

        const quoteNumber = `QUO-${Date.now().toString().slice(-6)}`;

        const newQuote = {
            number: quoteNumber,
            clientId,
            date: eventDate,
            total,
            status: 'pending'
        };

        try {
            const res = await fetch(`${API_BASE}/quotes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newQuote)
            });
            if (!res.ok) throw new Error('Save quote failed');
            const saved = await res.json();
            this.quotes.unshift({ ...saved, id: String(saved._id || saved.id) });
            this.renderQuotesTable();
            this.closeModal();
        } catch (err) {
            console.error(err);
            alert('Error saving quote.');
        }
    }

    viewQuoteDetails(quoteId) {
        const quote = this.quotes.find(q => String(q.id) === String(quoteId));
        if (quote) {
            const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
            set('detailNumber', quote.number || '');
            set('detailClient', quote.client?.name || quote.client || '');
            set('detailDate', this.formatDate(quote.date));
            const ds = document.getElementById('detailStatus');
            if (ds) ds.innerHTML = `<span class="status-badge status-${quote.status}">${quote.status}</span>`;
            set('detailTotal', `$${(quote.total || 0).toFixed(2)}`);
            this.showDetailModal();
        }
    }

    showModal() { document.getElementById('quoteModal')?.classList.add('active'); }
    closeModal() { document.getElementById('quoteModal')?.classList.remove('active'); this.resetForm(); }
    showDetailModal() { document.getElementById('detailModal')?.classList.add('active'); }
    closeDetailModal() { document.getElementById('detailModal')?.classList.remove('active'); }

    resetForm() {
        if (document.getElementById('clientSelect')) document.getElementById('clientSelect').value = '';
        if (document.getElementById('eventDate')) document.getElementById('eventDate').value = '';
        if (document.getElementById('numberOfPeople')) document.getElementById('numberOfPeople').value = 50;
        if (document.getElementById('discount')) document.getElementById('discount').value = 0;
        this.selectedRecipes.clear();
        this.calculateTotal();
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    async fetchClients() {
        try {
            const res = await fetch(`${API_BASE}/clients`);
            if (!res.ok) throw new Error('Clients fetch error');
            const clients = await res.json();

            const select = document.getElementById('clientSelect');
            if (!select) return;

            select.innerHTML = '<option value="">-- Select client --</option>';

            clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client._id || client.id;
                option.textContent = client.name || `${client.firstName} ${client.lastName}` || 'Unnamed Client';
                select.appendChild(option);
            });

            console.log(`✅ Clientes cargados: ${clients.length}`);
        } catch (e) {
            console.error('❌ Error al cargar clientes:', e);
        }
    }

}

const quoteManager = new QuoteManager();
