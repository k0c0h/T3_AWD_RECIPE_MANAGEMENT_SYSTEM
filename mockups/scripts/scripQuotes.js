        const MOCK_RECIPES = [
            { id: 1, name: 'Pasta Carbonara', type: 'main', costPerServing: 1.13, pricePerServing: 3.50 },
            { id: 2, name: 'Caesar Salad', type: 'appetizer', costPerServing: 2.10, pricePerServing: 4.20 },
            { id: 3, name: 'Cheesecake', type: 'dessert', costPerServing: 1.50, pricePerServing: 2.75 },
            { id: 4, name: 'Grilled Chicken', type: 'main', costPerServing: 2.80, pricePerServing: 6.00 },
            { id: 5, name: 'Tiramisu', type: 'dessert', costPerServing: 1.80, pricePerServing: 3.50 }
        ];

        const MOCK_QUOTES = [
            { id: 1, number: 'QUO-001', client: 'Maria González', date: '2025-10-15', total: 450.00, status: 'approved' },
            { id: 2, number: 'QUO-002', client: 'Corporate Events', date: '2025-10-16', total: 1200.00, status: 'pending' },
            { id: 3, number: 'QUO-003', client: 'John Smith', date: '2025-10-17', total: 890.00, status: 'rejected' }
        ];

        const TAX_RATE = 0.15;

        class QuoteManager {
            constructor() {
                this.quotes = [...MOCK_QUOTES];
                this.recipes = [...MOCK_RECIPES];
                this.selectedRecipes = new Map();
                this.init();
            }

            init() {
                this.renderQuotesTable();
                this.attachEventListeners();
            }

            attachEventListeners() {
                document.getElementById('searchInput').addEventListener('input', () => this.filterQuotes());
                document.getElementById('statusFilter').addEventListener('change', () => this.filterQuotes());
                document.getElementById('numberOfPeople').addEventListener('input', () => this.updateAllServings());
                document.getElementById('discount').addEventListener('input', () => this.calculateTotal());
            }

            renderQuotesTable() {
                const tbody = document.getElementById('quotesTableBody');
                const searchTerm = document.getElementById('searchInput').value.toLowerCase();
                const statusFilter = document.getElementById('statusFilter').value;

                const filteredQuotes = this.quotes.filter(quote => {
                    const matchesSearch = quote.client.toLowerCase().includes(searchTerm) || 
                                         quote.number.toLowerCase().includes(searchTerm);
                    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
                    return matchesSearch && matchesStatus;
                });

                tbody.innerHTML = filteredQuotes.map(quote => `
                    <tr>
                        <td>${quote.number}</td>
                        <td>${quote.client}</td>
                        <td>${this.formatDate(quote.date)}</td>
                        <td>$${quote.total.toFixed(2)}</td>
                        <td><span class="status-badge status-${quote.status}">${quote.status}</span></td>
                        <td>
                            <button class="btn-secondary btn-small" onclick="quoteManager.viewQuoteDetails(${quote.id})">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                View
                            </button>
                        </td>
                    </tr>
                `).join('');
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
                const numberOfPeople = parseInt(document.getElementById('numberOfPeople').value) || 50;

                tbody.innerHTML = this.recipes.map(recipe => {
                    const servings = this.selectedRecipes.get(recipe.id) || numberOfPeople;
                    return `
                        <tr>
                            <td>
                                <input type="checkbox" 
                                       id="recipe-${recipe.id}" 
                                       onchange="quoteManager.toggleRecipe(${recipe.id})">
                            </td>
                            <td>${recipe.name}</td>
                            <td style="text-transform: capitalize;">${recipe.type}</td>
                            <td>
                                <input type="number" 
                                       id="servings-${recipe.id}" 
                                       value="${servings}" 
                                       min="1"
                                       onchange="quoteManager.updateServings(${recipe.id}, this.value)">
                            </td>
                            <td>$${recipe.costPerServing.toFixed(2)}</td>
                            <td>$${recipe.pricePerServing.toFixed(2)}</td>
                        </tr>
                    `;
                }).join('');
            }

            toggleRecipe(recipeId) {
                const checkbox = document.getElementById(`recipe-${recipeId}`);
                const servingsInput = document.getElementById(`servings-${recipeId}`);
                
                if (checkbox.checked) {
                    this.selectedRecipes.set(recipeId, parseInt(servingsInput.value));
                } else {
                    this.selectedRecipes.delete(recipeId);
                }
                
                this.calculateTotal();
            }

            updateServings(recipeId, servings) {
                const checkbox = document.getElementById(`recipe-${recipeId}`);
                if (checkbox.checked) {
                    this.selectedRecipes.set(recipeId, parseInt(servings));
                    this.calculateTotal();
                }
            }

            updateAllServings() {
                const numberOfPeople = parseInt(document.getElementById('numberOfPeople').value) || 50;
                
                this.recipes.forEach(recipe => {
                    const servingsInput = document.getElementById(`servings-${recipe.id}`);
                    if (servingsInput) {
                        servingsInput.value = numberOfPeople;
                        const checkbox = document.getElementById(`recipe-${recipe.id}`);
                        if (checkbox && checkbox.checked) {
                            this.selectedRecipes.set(recipe.id, numberOfPeople);
                        }
                    }
                });
                
                this.calculateTotal();
            }

            calculateTotal() {
                let subtotal = 0;

                this.selectedRecipes.forEach((servings, recipeId) => {
                    const recipe = this.recipes.find(r => r.id === recipeId);
                    if (recipe) {
                        subtotal += recipe.pricePerServing * servings;
                    }
                });

                const discountPercent = parseFloat(document.getElementById('discount').value) || 0;
                const discountAmount = subtotal * (discountPercent / 100);
                const subtotalAfterDiscount = subtotal - discountAmount;
                const taxAmount = subtotalAfterDiscount * TAX_RATE;
                const total = subtotalAfterDiscount + taxAmount;

                document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
                document.getElementById('discountPercent').textContent = discountPercent.toFixed(1);
                document.getElementById('discountAmount').textContent = `-$${discountAmount.toFixed(2)}`;
                document.getElementById('taxAmount').textContent = `$${taxAmount.toFixed(2)}`;
                document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
            }

            generatePDF() {
                const clientName = document.getElementById('clientName').value;
                const eventDate = document.getElementById('eventDate').value;

                if (!clientName || !eventDate) {
                    alert('Please fill in client name and event date');
                    return;
                }

                if (this.selectedRecipes.size === 0) {
                    alert('Please select at least one recipe');
                    return;
                }

                alert('PDF generation would happen here. In a real application, this would generate a PDF document.');
                this.closeModal();
            }

            viewQuoteDetails(quoteId) {
                const quote = this.quotes.find(q => q.id === quoteId);
                if (quote) {
                    document.getElementById('detailNumber').textContent = quote.number;
                    document.getElementById('detailClient').textContent = quote.client;
                    document.getElementById('detailDate').textContent = this.formatDate(quote.date);
                    document.getElementById('detailStatus').innerHTML = 
                        `<span class="status-badge status-${quote.status}">${quote.status}</span>`;
                    document.getElementById('detailTotal').textContent = `$${quote.total.toFixed(2)}`;
                    
                    this.showDetailModal();
                }
            }

            showModal() {
                document.getElementById('quoteModal').classList.add('active');
            }

            closeModal() {
                document.getElementById('quoteModal').classList.remove('active');
                this.resetForm();
            }

            showDetailModal() {
                document.getElementById('detailModal').classList.add('active');
            }

            closeDetailModal() {
                document.getElementById('detailModal').classList.remove('active');
            }

            resetForm() {
                document.getElementById('clientName').value = '';
                document.getElementById('eventDate').value = '';
                document.getElementById('numberOfPeople').value = 50;
                document.getElementById('discount').value = 0;
                this.selectedRecipes.clear();
                this.calculateTotal();
            }

            formatDate(dateString) {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit' 
                });
            }
        }

        const quoteManager = new QuoteManager();