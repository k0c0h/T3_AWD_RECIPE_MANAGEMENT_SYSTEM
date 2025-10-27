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
        this.renderQuotesTable();
        this.attachEventListeners();
    }

    async fetchRecipes() {
        try {
            const res = await fetch(`${API_BASE}/recipes`);
            if (!res.ok) throw new Error('Recipes fetch error');
            const data = await res.json();
            // normalizar id (Mongo _id) a id (string)
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
                { id: '1', number: 'QUO-001', client: 'Maria González', date: '2025-10-15', total: 450.00, status: 'approved' },
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
            const client = (quote.client || '').toString().toLowerCase();
            const number = (quote.number || '').toString().toLowerCase();
            const matchesSearch = client.includes(searchTerm) || number.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        tbody.innerHTML = filteredQuotes.map(quote => `
            <tr>
                <td>${quote.number}</td>
                <td>${quote.client}</td>
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

        // recreate lucide icons inside table rows
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
                    <td>
                        <input type="checkbox" id="recipe-${rid}" onchange="quoteManager.toggleRecipe('${rid}')">
                    </td>
                    <td>${recipe.name}</td>
                    <td style="text-transform: capitalize;">${recipe.type}</td>
                    <td>
                        <input type="number" id="servings-${rid}" value="${servings}" min="1" onchange="quoteManager.updateServings('${rid}', this.value)">
                    </td>
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
        const clientName = document.getElementById('clientName')?.value;
        const eventDate = document.getElementById('eventDate')?.value;
        const numberOfPeople = parseInt(document.getElementById('numberOfPeople')?.value) || 50;
        const discountPercent = parseFloat(document.getElementById('discount')?.value) || 0;

        if (!clientName || !eventDate) {
            alert('Please fill in client name and event date');
            return;
        }

        if (this.selectedRecipes.size === 0) {
            alert('Please select at least one recipe');
            return;
        }

        // Obtener valores de cálculo
        const subtotalText = document.getElementById('subtotal')?.textContent || '$0.00';
        const discountAmountText = document.getElementById('discountAmount')?.textContent || '$0.00';
        const taxAmountText = document.getElementById('taxAmount')?.textContent || '$0.00';
        const totalText = document.getElementById('totalAmount')?.textContent || '$0.00';

        const subtotal = parseFloat(subtotalText.replace(/[^0-9.-]+/g, '')) || 0;
        const discountAmount = parseFloat(discountAmountText.replace(/[^0-9.-]+/g, '')) || 0;
        const taxAmount = parseFloat(taxAmountText.replace(/[^0-9.-]+/g, '')) || 0;
        const total = parseFloat(totalText.replace(/[^0-9.-]+/g, '')) || 0;

        const quoteNumber = `QUO-${Date.now().toString().slice(-6)}`;

        // Crear el PDF
        this.createPDFDocument(quoteNumber, clientName, eventDate, numberOfPeople, discountPercent, subtotal, discountAmount, taxAmount, total);

        // Guardar en el servidor
        const newQuote = {
            number: quoteNumber,
            client: clientName,
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
            const savedNorm = { ...saved, id: String(saved._id || saved.id) };
            this.quotes.unshift(savedNorm);
            this.renderQuotesTable();
            this.closeModal();
        } catch (err) {
            console.error(err);
            alert('Error guardando la cotización en el servidor.');
        }
    }

    

    createPDFDocument(quoteNumber, clientName, eventDate, numberOfPeople, discountPercent, subtotal, discountAmount, taxAmount, total) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const primaryColor = [232, 196, 216]; 
        const secondaryColor = [53, 80, 112];  // #ff6b6b
        const darkColor = [44, 62, 80]; // #2c3e50
        const lightGray = [236, 240, 241]; // #ecf0f1

        // Header con fondo de color
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');

        // Logo/Título "DishDash"
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('DishDash', 15, 20);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Catering & Event Planning', 15, 28);

        // Información de la cotización en el header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Quote #${quoteNumber}`, 150, 20);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${this.formatDate(new Date())}`, 150, 26);

        // Información del cliente
        doc.setTextColor(...darkColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Client Information', 15, 55);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Client: ${clientName}`, 15, 65);
        doc.text(`Event Date: ${this.formatDate(eventDate)}`, 15, 72);
        doc.text(`Number of People: ${numberOfPeople}`, 15, 79);

        // Línea divisoria
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.5);
        doc.line(15, 85, 195, 85);

        // Tabla de recetas seleccionadas
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Selected Items', 15, 95);

        const tableData = [];
        this.selectedRecipes.forEach((servings, recipeId) => {
            const recipe = this.recipes.find(r => String(r.id) === String(recipeId));
            if (recipe) {
                tableData.push([
                    recipe.name,
                    recipe.type.charAt(0).toUpperCase() + recipe.type.slice(1),
                    servings.toString(),
                    `$${recipe.pricePerServing.toFixed(2)}`,
                    `$${(recipe.pricePerServing * servings).toFixed(2)}`
                ]);
            }
        });

        doc.autoTable({
            startY: 100,
            head: [['Recipe', 'Type', 'Servings', 'Price/Serving', 'Total']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 9,
                textColor: darkColor
            },
            alternateRowStyles: {
                fillColor: [248, 249, 250]
            },
            margin: { left: 15, right: 15 }
        });

        // Resumen de costos
        const finalY = doc.lastAutoTable.finalY + 10;

        // Box para el resumen
        doc.setFillColor(...lightGray);
        doc.roundedRect(120, finalY, 75, 45, 2, 2, 'F');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkColor);

        doc.text('Subtotal:', 125, finalY + 8);
        doc.text(`$${subtotal.toFixed(2)}`, 185, finalY + 8, { align: 'right' });

        doc.text(`Discount (${discountPercent}%):`, 125, finalY + 16);
        doc.text(`-$${discountAmount.toFixed(2)}`, 185, finalY + 16, { align: 'right' });

        doc.text('Tax (15%):', 125, finalY + 24);
        doc.text(`$${taxAmount.toFixed(2)}`, 185, finalY + 24, { align: 'right' });

        // Línea antes del total
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.3);
        doc.line(125, finalY + 28, 190, finalY + 28);

        // Total
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...secondaryColor);
        doc.text('TOTAL:', 125, finalY + 37);
        doc.text(`$${total.toFixed(2)}`, 185, finalY + 37, { align: 'right' });

        // Footer con información del cotizador
        const footerY = 260;
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.3);
        doc.line(15, footerY, 195, footerY);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('Quoted by:', 15, footerY + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Rosi Cañarte Galarza', 15, footerY + 13);
        doc.text('ID: 1316848215', 15, footerY + 18);
        doc.text('Jipijapa, Manabí, Ecuador', 15, footerY + 23);

        // Firma decorativa
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(120, footerY + 15, 170, footerY + 15);
        doc.setFontSize(7);
        doc.setTextColor(...darkColor);
        doc.text('Authorized Signature', 135, footerY + 20, { align: 'center' });

        // Guardar el PDF
        doc.save(`Quote_${quoteNumber}_${clientName.replace(/\s+/g, '_')}.pdf`);
    }
       viewQuoteDetails(quoteId) {
        const quote = this.quotes.find(q => String(q.id) === String(quoteId));
        if (quote) {
            const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
            set('detailNumber', quote.number || '');
            set('detailClient', quote.client || '');
            set('detailDate', this.formatDate(quote.date));
            const ds = document.getElementById('detailStatus');
            if (ds) ds.innerHTML = `<span class="status-badge status-${quote.status}">${quote.status}</span>`;
            set('detailTotal', `$${(quote.total || 0).toFixed(2)}`);
            this.showDetailModal();
        }
    }
    
    showModal() {
        document.getElementById('quoteModal')?.classList.add('active');
    }

    closeModal() {
        document.getElementById('quoteModal')?.classList.remove('active');
        this.resetForm();
    }

    showDetailModal() {
        document.getElementById('detailModal')?.classList.add('active');
    }

    closeDetailModal() {
        document.getElementById('detailModal')?.classList.remove('active');
    }
        resetForm() {
        if (document.getElementById('clientName')) document.getElementById('clientName').value = '';
        if (document.getElementById('eventDate')) document.getElementById('eventDate').value = '';
        if (document.getElementById('numberOfPeople')) document.getElementById('numberOfPeople').value = 50;
        if (document.getElementById('discount')) document.getElementById('discount').value = 0;
        this.selectedRecipes.clear();
        this.calculateTotal();
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
}

const quoteManager = new QuoteManager();
