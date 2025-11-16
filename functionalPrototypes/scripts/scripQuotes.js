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

    // helper to convert hex to [r,g,b]
    _hexToRgb(hex) {
        const h = hex.replace('#', '');
        return [parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)];
    }

    async generatePDF() {
        const clientSelect = document.getElementById('clientSelect');
        const clientId = clientSelect?.value;
        const clientName = clientSelect?.selectedOptions?.[0]?.textContent || '';
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

        // Build rows and compute totals
        let subtotal = 0;
        const rows = [];
        this.selectedRecipes.forEach((servings, recipeId) => {
            const recipe = this.recipes.find(r => String(r.id) === String(recipeId));
            if (recipe) {
                const lineTotal = (recipe.pricePerServing || 0) * servings;
                subtotal += lineTotal;
                rows.push([recipe.name, String(servings), `$${(recipe.pricePerServing || 0).toFixed(2)}`, `$${lineTotal.toFixed(2)}`]);
            }
        });

        const discountAmount = subtotal * (discountPercent / 100);
        const subtotalAfterDiscount = subtotal - discountAmount;
        const taxAmount = subtotalAfterDiscount * TAX_RATE;
        const total = subtotalAfterDiscount + taxAmount;

        // style color (match page pink)
        const PINK = '#e91e63';
        const pinkRgb = this._hexToRgb(PINK);

        // robust jsPDF ctor lookup
        const jsPDFCtor = (window.jspdf && (window.jspdf.jsPDF || window.jspdf.default)) || window.jsPDF || null;
        if (!jsPDFCtor) {
            alert('jsPDF not available. Cannot generate PDF.');
            return;
        }

        try {
            const doc = new jsPDFCtor();
            doc.setTextColor(...pinkRgb);
            doc.setFontSize(16);
            doc.text('Quote', 14, 22);
            doc.setTextColor(0,0,0);
            doc.setFontSize(11);

            const quoteNumber = `QUO-${Date.now().toString().slice(-6)}`;
            doc.text(`Number: ${quoteNumber}`, 14, 34);
            doc.text(`Client: ${clientName}`, 14, 40);
            doc.text(`Event Date: ${eventDate}`, 14, 46);
            doc.text(`People: ${numberOfPeople}`, 14, 52);

            if (typeof doc.autoTable === 'function') {
                doc.autoTable({
                    startY: 60,
                    head: [['Recipe', 'Servings', 'Price/Serving', 'Total']],
                    body: rows,
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: pinkRgb, textColor: 255 }
                });

                const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 8 : 60;
                doc.setFontSize(11);
                doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 14, finalY);
                doc.text(`Discount: -$${discountAmount.toFixed(2)}`, 14, finalY + 6);
                doc.text(`Tax: $${taxAmount.toFixed(2)}`, 14, finalY + 12);
                doc.setFontSize(12);
                doc.setTextColor(...pinkRgb);
                doc.text(`TOTAL: $${total.toFixed(2)}`, 14, finalY + 20);
            } else {
                // fallback simple layout
                let y = 60;
                rows.forEach(r => {
                    doc.text(`${r[0]} — ${r[1]} x ${r[2]} = ${r[3]}`, 14, y);
                    y += 6;
                });
                doc.setFontSize(11);
                doc.text(`TOTAL: $${total.toFixed(2)}`, 14, y + 6);
            }

            const filename = `${quoteNumber}.pdf`;
            doc.save(filename);
        } catch (pdfErr) {
            console.error('PDF generation failed:', pdfErr);
            alert('PDF generation failed. The quote will still be saved.');
        }

        // Save quote to server (existing behavior)
        const newQuote = {
            number: `QUO-${Date.now().toString().slice(-6)}`,
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
            this.currentDetailQuote = quote; // <-- store current detail quote
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

    // Generate a PDF for the quote currently shown in the detail modal
    async generateDetailPDF() {
        const quote = this.currentDetailQuote;
        if (!quote) {
            alert('No quote selected to generate PDF.');
            return;
        }

        const jsPDFCtor = (window.jspdf && (window.jspdf.jsPDF || window.jspdf.default)) || window.jsPDF || null;
        if (!jsPDFCtor) {
            alert('jsPDF not available. Cannot generate PDF.');
            return;
        }

        const PINK = '#e91e63';
        const pinkRgb = this._hexToRgb(PINK);

        try {
            const doc = new jsPDFCtor();
            doc.setTextColor(...pinkRgb);
            doc.setFontSize(14);
            doc.text(`Quote ${quote.number || quote.id || ''}`, 14, 20);
            doc.setTextColor(0,0,0);
            doc.setFontSize(11);
            doc.text(`Status: ${quote.status || ''}`, 14, 30);
            doc.text(`Event Date: ${this.formatDate(quote.date) || quote.eventDate || ''}`, 14, 36);
            doc.text(`Client: ${quote.client?.name || quote.client || ''}`, 14, 42);

            const items = (quote.recipes || quote.products || []);
            const body = items.map(item => {
                const name = item.name || item.recipeName || '';
                const qty = item.quantity || item.servings || 1;
                const unit = item.pricePerServing || item.price || 0;
                const lineTotal = (unit || 0) * qty;
                return [name, String(qty), `$${(unit || 0).toFixed(2)}`, `$${lineTotal.toFixed(2)}`];
            });

            if (body.length && typeof doc.autoTable === 'function') {
                doc.autoTable({
                    startY: 54,
                    head: [['Item', 'Qty', 'Unit Price', 'Total']],
                    body,
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: pinkRgb, textColor: 255 }
                });
                const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 8 : 54;
                doc.setFontSize(11);
                doc.setTextColor(...pinkRgb);
                doc.text(`Total: $${(quote.total || 0).toFixed(2)}`, 14, finalY);
            } else {
                let y = 54;
                body.forEach(row => {
                    doc.text(`${row[0]}  ${row[1]} x ${row[2]} = ${row[3]}`, 14, y);
                    y += 6;
                });
                doc.setTextColor(...pinkRgb);
                doc.text(`Total: $${(quote.total || 0).toFixed(2)}`, 14, y + 6);
            }

            const filename = `${quote.number || quote.id || 'quote'}.pdf`;
            doc.save(filename);
        } catch (err) {
            console.error('Error generating detail PDF:', err);
            alert('Failed to generate PDF.');
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

// instantiate only on pages that include the Quotes UI to avoid breaking other pages
if (typeof document !== 'undefined' && (document.getElementById('quotesTableBody') || document.getElementById('quoteModal') || document.getElementById('clientSelect'))) {
    const qm = new QuoteManager();
    window.quoteManager = qm;
}
