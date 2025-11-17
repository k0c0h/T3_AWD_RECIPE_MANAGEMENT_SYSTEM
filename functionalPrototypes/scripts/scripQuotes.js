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
            console.log('✅ Recipes loaded:', this.recipes.length);
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
            console.log('✅ Quotes loaded:', this.quotes.length);
        } catch (e) {
            console.warn('Falling back to local quotes. Error:', e);
            this.quotes = [];
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
                <td>${this.formatDate(quote.eventInfo?.eventDate || quote.date)}</td>
                <td>$${(quote.pricing?.total || quote.total || 0).toFixed(2)}</td>
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
        this.resetForm();
        this.renderRecipesTable();
        this.calculateTotal();
        this.showModal();
    }

    renderRecipesTable() {
        const tbody = document.getElementById('recipesTableBody');
        if (!tbody) return;

        const numberOfPeople = parseInt(document.getElementById('numberOfPeople')?.value) || 50;

        tbody.innerHTML = this.recipes.map(recipe => {
            const rid = String(recipe.id);
            const isChecked = this.selectedRecipes.has(rid);
            const servings = isChecked ? this.selectedRecipes.get(rid) : numberOfPeople;

            return `
                <tr>
                    <td><input type="checkbox" id="recipe-${rid}" ${isChecked ? 'checked' : ''} onchange="quoteManager.toggleRecipe('${rid}')"></td>
                    <td>${recipe.name}</td>
                    <td style="text-transform: capitalize;">${recipe.type}</td>
                    <td><input type="number" id="servings-${rid}" value="${servings}" min="1" onchange="quoteManager.updateServings('${rid}', this.value)" ${!isChecked ? 'disabled' : ''}></td>
                    <td>$${(recipe.costPerServing || 0).toFixed(2)}</td>
                    <td class="price-per-serving">$${(recipe.pricePerServing || 0).toFixed(2)}</td>
                </tr>
            `;
        }).join('');
    }

    toggleRecipe(recipeId) {
        const checkbox = document.getElementById(`recipe-${recipeId}`);
        const servingsInput = document.getElementById(`servings-${recipeId}`);
        if (!servingsInput) return;

        if (checkbox && checkbox.checked) {
            servingsInput.disabled = false;
            const servings = parseInt(servingsInput.value, 10) || 1;
            this.selectedRecipes.set(String(recipeId), servings);
        } else {
            servingsInput.disabled = true;
            this.selectedRecipes.delete(String(recipeId));
        }
        this.calculateTotal();
    }

    updateServings(recipeId, servings) {
        const parsed = parseInt(servings, 10) || 1;
        const servingsInput = document.getElementById(`servings-${recipeId}`);
        if (servingsInput) {
            servingsInput.value = parsed;
        }

        if (this.selectedRecipes.has(String(recipeId))) {
            this.selectedRecipes.set(String(recipeId), parsed);
            this.calculateTotal();
        }
    }

    updateAllServings() {
        const numberOfPeople = parseInt(document.getElementById('numberOfPeople')?.value) || 50;

        this.recipes.forEach(recipe => {
            const rid = String(recipe.id);
            const servingsInput = document.getElementById(`servings-${rid}`);
            const checkbox = document.getElementById(`recipe-${rid}`);

            if (servingsInput) {
                if (checkbox && checkbox.checked) {
                    servingsInput.value = numberOfPeople;
                    this.selectedRecipes.set(rid, numberOfPeople);
                } else {
                    servingsInput.value = numberOfPeople;
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

        return { subtotal, discountPercent, discountAmount, taxAmount, total };
    }

    _hexToRgb(hex) {
        const h = hex.replace('#', '');
        return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
    }

    async generatePDF() {
        const clientSelect = document.getElementById('clientSelect');
        const clientId = clientSelect?.value;
        const clientName = clientSelect?.selectedOptions?.[0]?.textContent || '';
        const eventDate = document.getElementById('eventDate')?.value;
        const numberOfPeople = parseInt(document.getElementById('numberOfPeople')?.value) || 50;

        if (!clientId || !eventDate) {
            alert('Please select a client and event date');
            return;
        }

        if (this.selectedRecipes.size === 0) {
            alert('Please select at least one recipe');
            return;
        }

        // Recalcular totales
        const totals = this.calculateTotal();

        // Build items array SIN recipeId - solo snapshot
        const items = [];
        const pdfRows = [];

        this.selectedRecipes.forEach((servings, recipeId) => {
            const recipe = this.recipes.find(r => String(r.id) === String(recipeId));
            if (recipe) {
                const lineTotal = (recipe.pricePerServing || 0) * servings;

                items.push({
                    recipeName: recipe.name,
                    type: recipe.type,
                    servings: servings,
                    pricePerServing: recipe.pricePerServing || 0,
                    subtotal: lineTotal
                });

                pdfRows.push([
                    recipe.name,
                    recipe.type,
                    String(servings),
                    `$${(recipe.pricePerServing || 0).toFixed(2)}`,
                    `$${lineTotal.toFixed(2)}`
                ]);
            }
        });

        const quoteNumber = `QT-${Date.now().toString().slice(-6)}`;

        // ---- 🎀 PDF ELEGANTE ----
        const PINK = '#e91e63';
        const HEADER_BG = [255, 235, 240]; // rosado pastel
        const pinkRgb = this._hexToRgb(PINK);

        const jsPDFCtor =
            (window.jspdf && (window.jspdf.jsPDF || window.jspdf.default)) ||
            window.jsPDF || null;

        if (jsPDFCtor) {
            try {
                const doc = new jsPDFCtor("p", "mm", "a4");

                // --- HEADER ---
                doc.setFillColor(...HEADER_BG);
                doc.rect(0, 0, 210, 35, "F");

                doc.setTextColor(...pinkRgb);
                doc.setFontSize(22);
                doc.text("DishDash Catering & Event Planning", 14, 20);

                doc.setTextColor(60, 60, 60);
                doc.setFontSize(12);
                doc.text("Quote / Cotización", 14, 28);

                // --- CAJA DE INFORMACIÓN ---
                doc.setFillColor(255, 248, 250);
                doc.roundedRect(10, 40, 190, 40, 3, 3, "F");

                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);

                doc.text(`Quote Number:`, 14, 48);
                doc.text(`${quoteNumber}`, 60, 48);

                doc.text(`Client:`, 14, 54);
                doc.text(`${clientName}`, 60, 54);

                doc.text(`Event Date:`, 14, 60);
                doc.text(`${eventDate}`, 60, 60);

                doc.text(`Number of People:`, 14, 66);
                doc.text(`${numberOfPeople}`, 60, 66);

                doc.text(`Quote Date:`, 14, 72);
                doc.text(`${new Date().toLocaleDateString()}`, 60, 72);

                // --- TABLA DE ITEMS ---
                doc.autoTable({
                    startY: 86,
                    head: [['Recipe', 'Type', 'Servings', 'Price/Serving', 'Total']],
                    body: pdfRows,
                    styles: { fontSize: 10, cellPadding: 2 },
                    headStyles: {
                        fillColor: pinkRgb,
                        textColor: 255,
                        fontSize: 11,
                    },
                    alternateRowStyles: { fillColor: [255, 245, 248] },
                    margin: { left: 10, right: 10 }
                });

                const finalY = doc.lastAutoTable.finalY + 10;

                // --- TOTALES BONITOS ---
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);

                const rightX = 160;

                doc.text(`Subtotal:`, rightX, finalY);
                doc.text(`$${totals.subtotal.toFixed(2)}`, rightX + 30, finalY);

                doc.text(`Discount (${totals.discountPercent}%):`, rightX, finalY + 6);
                doc.text(`-$${totals.discountAmount.toFixed(2)}`, rightX + 30, finalY + 6);

                doc.text(`Tax (15%):`, rightX, finalY + 12);
                doc.text(`$${totals.taxAmount.toFixed(2)}`, rightX + 30, finalY + 12);

                // TOTAL FINAL
                doc.setFontSize(14);
                doc.setTextColor(...pinkRgb);
                doc.text(`TOTAL: $${totals.total.toFixed(2)}`, rightX, finalY + 22);

                // --- FOOTER ---
                doc.setFontSize(10);
                doc.setTextColor(120, 120, 120);
                doc.text("Quoted by: Rosi Caárte Galarza", 14, finalY + 40);
                doc.text("ID: 1316848215", 14, finalY + 45);
                doc.text("Jipijapa, Manabí, Ecuador", 14, finalY + 50);

                const filename = `${quoteNumber}.pdf`;
                doc.save(filename);
            } catch (pdfErr) {
                console.error("PDF generation failed:", pdfErr);
            }
        }

        // Guardar en el backend
        const newQuote = {
            number: quoteNumber,
            clientId: clientId,
            eventInfo: {
                numberOfPeople: numberOfPeople,
                eventDate: eventDate
            },
            items: items,
            pricing: {
                subtotal: totals.subtotal,
                discountPercentage: totals.discountPercent,
                discountAmount: totals.discountAmount,
                taxPercentage: 15,
                taxAmount: totals.taxAmount,
                total: totals.total
            },
            total: totals.total,
            date: new Date().toISOString(),
            status: "pending"
        };

        try {
            const res = await fetch(`${API_BASE}/quotes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newQuote)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Save quote failed");
            }

            await res.json();
            await this.fetchQuotes();
            this.renderQuotesTable();
            this.closeModal();
            alert("Quote saved successfully!");
        } catch (err) {
            alert(`Error saving quote: ${err.message}`);
        }
    }

    viewQuoteDetails(quoteId) {
        const quote = this.quotes.find(q => String(q.id) === String(quoteId));
        if (quote) {
            this.currentDetailQuote = quote;
            const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

            set('detailNumber', quote.number || '');
            set('detailClient', quote.client?.name || quote.client || '');
            set('detailDate', this.formatDate(quote.eventInfo?.eventDate || quote.date));

            const ds = document.getElementById('detailStatus');
            if (ds) ds.innerHTML = `<span class="status-badge status-${quote.status}">${quote.status}</span>`;

            set('detailTotal', `$${(quote.pricing?.total || quote.total || 0).toFixed(2)}`);

            this.showDetailModal();
        }
    }

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
            doc.setFontSize(18);
            doc.text('DishDash Catering & Event Planning', 14, 20);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.text(`Quote ${quote.number || quote.id || ''}`, 14, 30);

            doc.setFontSize(10);
            doc.text(`Status: ${quote.status || ''}`, 14, 40);
            doc.text(`Client: ${quote.client?.name || quote.client || ''}`, 14, 46);
            doc.text(`Event Date: ${this.formatDate(quote.eventInfo?.eventDate || quote.date)}`, 14, 52);
            doc.text(`Number of People: ${quote.eventInfo?.numberOfPeople || '—'}`, 14, 58);

            const items = quote.items || [];
            const body = items.map(item => [
                item.recipeName || '',
                item.type || '',
                String(item.servings || 0),
                `$${(item.pricePerServing || 0).toFixed(2)}`,
                `$${(item.subtotal || 0).toFixed(2)}`
            ]);

            if (body.length && typeof doc.autoTable === 'function') {
                doc.autoTable({
                    startY: 66,
                    head: [['Recipe', 'Type', 'Servings', 'Price/Serving', 'Total']],
                    body,
                    styles: { fontSize: 9 },
                    headStyles: { fillColor: pinkRgb, textColor: 255 }
                });

                const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : 66;
                doc.setFontSize(10);

                if (quote.pricing) {
                    doc.text(`Subtotal: $${quote.pricing.subtotal.toFixed(2)}`, 14, finalY);
                    doc.text(`Discount (${quote.pricing.discountPercentage}%): -$${quote.pricing.discountAmount.toFixed(2)}`, 14, finalY + 6);
                    doc.text(`Tax (${quote.pricing.taxPercentage}%): $${quote.pricing.taxAmount.toFixed(2)}`, 14, finalY + 12);
                }

                doc.setFontSize(12);
                doc.setTextColor(...pinkRgb);
                doc.text(`TOTAL: $${(quote.pricing?.total || quote.total || 0).toFixed(2)}`, 14, finalY + 20);

                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                doc.text('Quoted by: Rosi Caárte Galarza', 14, finalY + 32);
                doc.text('ID: 1316848215', 14, finalY + 37);
                doc.text('Jipijapa, Manabí, Ecuador', 14, finalY + 42);
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

            console.log(`✅ Clients loaded: ${clients.length}`);
        } catch (e) {
            console.error('❌ Error loading clients:', e);
        }
    }
}

if (typeof document !== 'undefined' && (document.getElementById('quotesTableBody') || document.getElementById('quoteModal') || document.getElementById('clientSelect'))) {
    const qm = new QuoteManager();
    window.quoteManager = qm;
}