let selectedProducts = [];
    let numberOfGuests = 0;
    let currentCategory = 'all';
    let currentSearchTerm = '';

    // Filter functions
    function filterByCategory(category) {
      currentCategory = category;
      
      // Update active button
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
          btn.classList.add('active');
        }
      });
      
      applyFilters();
    }

    function filterRecipes() {
      currentSearchTerm = document.getElementById('searchInput').value.toLowerCase();
      applyFilters();
    }

    function applyFilters() {
      const cards = document.querySelectorAll('.recipe-card');
      let visibleCount = 0;
      
      cards.forEach(card => {
        const category = card.dataset.category;
        const name = card.dataset.name.toLowerCase();
        const description = card.dataset.description.toLowerCase();
        
        const matchesCategory = currentCategory === 'all' || category === currentCategory;
        const matchesSearch = currentSearchTerm === '' || 
                             name.includes(currentSearchTerm) || 
                             description.includes(currentSearchTerm);
        
        if (matchesCategory && matchesSearch) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });
      
      updateResultsCount(visibleCount);
    }

    function updateResultsCount(count) {
      const resultsDiv = document.getElementById('resultsCount');
      if (currentSearchTerm || currentCategory !== 'all') {
        resultsDiv.textContent = `Showing ${count} ${count === 1 ? 'item' : 'items'}`;
      } else {
        resultsDiv.textContent = '';
      }
    }

    // Add event listeners for filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        filterByCategory(this.dataset.category);
      });
    });

    document.getElementById('searchInput').addEventListener('input', filterRecipes);

    function openQuoteModal(productName, category, price) {
      selectedProducts = [{
        name: productName,
        category: category,
        price: price,
        quantity: 1
      }];
      
      updateSelectedItems();
      document.getElementById('quoteModal').style.display = 'block';
      lucide.createIcons();
    }

    function closeModal() {
      document.getElementById('quoteModal').style.display = 'none';
      document.getElementById('quoteForm').reset();
      document.getElementById('addProductSection').classList.remove('show');
      numberOfGuests = 0;
    }

    function toggleAddProduct() {
      const section = document.getElementById('addProductSection');
      section.classList.toggle('show');
      lucide.createIcons();
    }

    // Update quantities when number of guests changes
    document.getElementById('eventGuests').addEventListener('input', function() {
      numberOfGuests = parseInt(this.value) || 0;
      
      if (numberOfGuests > 0 && selectedProducts.length > 0) {
        selectedProducts.forEach(product => {
          product.quantity = numberOfGuests;
        });
        updateSelectedItems();
      }
    });

    function addProduct() {
      const select = document.getElementById('additionalProduct');
      const value = select.value;
      
      if (!value) {
        alert('Please select a product');
        return;
      }

      const [name, price] = value.split('|');
      
      // Check if product already exists
      const existingIndex = selectedProducts.findIndex(p => p.name === name);
      if (existingIndex !== -1) {
        selectedProducts[existingIndex].quantity++;
      } else {
        selectedProducts.push({
          name: name,
          price: parseFloat(price),
          quantity: numberOfGuests > 0 ? numberOfGuests : 1
        });
      }

      updateSelectedItems();
      select.value = '';
      document.getElementById('addProductSection').classList.remove('show');
      lucide.createIcons();
    }

    function updateSelectedItems() {
      const container = document.getElementById('selectedItems');
      
      if (selectedProducts.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">No products selected</p>';
        document.getElementById('totalEstimate').style.display = 'none';
        return;
      }

      container.innerHTML = selectedProducts.map((product, index) => `
        <div class="item-row">
          <div class="item-info">
            <div class="item-name">${product.name}</div>
            <div style="color: #ba84a8b9; font-weight: 600;">$${product.price.toFixed(2)} per unit</div>
          </div>
          <div class="item-controls">
            <input type="number" class="qty-input" value="${product.quantity}" min="1" 
                   onchange="updateQuantity(${index}, this.value)">
            <button type="button" class="btn-remove" onclick="removeProduct(${index})">
              <i data-lucide="x"></i>
              Remove
            </button>
          </div>
        </div>
      `).join('');

      calculateTotal();
      lucide.createIcons();
    }

    function calculateTotal() {
      const total = selectedProducts.reduce((sum, product) => {
        return sum + (product.price * product.quantity);
      }, 0);

      document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
      document.getElementById('totalEstimate').style.display = 'block';
      lucide.createIcons();
    }

    function updateQuantity(index, quantity) {
      selectedProducts[index].quantity = parseInt(quantity) || 1;
      updateSelectedItems();
    }

    function removeProduct(index) {
      selectedProducts.splice(index, 1);
      updateSelectedItems();
    }

    document.getElementById('quoteForm').addEventListener('submit', function(e) {
      e.preventDefault();

      if (selectedProducts.length === 0) {
        alert('Please add at least one product to your quote');
        return;
      }

      const total = selectedProducts.reduce((sum, product) => {
        return sum + (product.price * product.quantity);
      }, 0);

      const quoteData = {
        client: {
          name: document.getElementById('clientName').value,
          email: document.getElementById('clientEmail').value,
          phone: document.getElementById('clientPhone').value
        },
        event: {
          date: document.getElementById('eventDate').value,
          location: document.getElementById('eventLocation').value,
          guests: document.getElementById('eventGuests').value
        },
        products: selectedProducts,
        estimatedTotal: total.toFixed(2),
        notes: document.getElementById('notes').value,
        requestDate: new Date().toISOString()
      };

      console.log('Quote Request:', quoteData);
      
      alert(`Quote request submitted successfully!\n\nEstimated Total: ${total.toFixed(2)}\n\nWe will contact you soon to finalize the details.`);
      closeModal();
    });

    // Close modal when clicking outside
    window.onclick = function(event) {
      const modal = document.getElementById('quoteModal');
      if (event.target === modal) {
        closeModal();
      }
    }

    // Initialize
    lucide.createIcons();
    updateResultsCount(document.querySelectorAll('.recipe-card').length);