const quotesData = {
    1: {
        id: 'QT-2024-001',
        status: 'Approved',
        requestDate: 'October 15, 2024',
        eventDate: 'November 25, 2024',
        location: 'Grand Hotel Ballroom',
        guests: 50,
        products: [
            { name: 'Grilled Ribeye Steak', quantity: 50, price: 28.00 },
            { name: 'Chocolate Lava Cake', quantity: 50, price: 12.00 }
        ],
        total: 2000.00,
        notes: "Your quote has been approved! We've applied a 10% discount for groups over 40 people. We'll contact you 3 days before the event to confirm final details. Looking forward to serving you!"
    },
    2: {
        id: 'QT-2024-002',
        status: 'Pending Review',
        requestDate: 'November 8, 2024',
        eventDate: 'December 15, 2024',
        location: 'Beach Club Resort',
        guests: 20,
        products: [
            { name: 'Cuba Libre', quantity: 20, price: 8.50 },
            { name: 'Grilled Ribeye Steak', quantity: 15, price: 28.00 },
            { name: 'Chocolate Lava Cake', quantity: 20, price: 12.00 }
        ],
        total: 830.00,
        notes: "We need vegetarian options for 3 guests. Also, please confirm if the cocktails can be made sugar-free for diabetic guests."
    }
};

function viewDetails(quoteId) {
    const quote = quotesData[quoteId];
    const productsList = quote.products.map(p =>
        `${p.name} (${p.quantity}x) - ${(p.price * p.quantity).toFixed(2)}`
    ).join('\n');

    alert(`Quote Details: ${quote.id}\n\nStatus: ${quote.status}\nEvent Date: ${quote.eventDate}\nLocation: ${quote.location}\nGuests: ${quote.guests}\n\nProducts:\n${productsList}\n\nTotal: ${quote.total.toFixed(2)}\n\nNotes:\n${quote.notes}`);
}

function editQuote(quoteId) {
    const quote = quotesData[quoteId];
    if (quote.status === 'Approved') {
        alert('Cannot edit an approved quote. Please contact us directly for changes.');
        return;
    }

    openEditModal(quote, quoteId);
}

let currentEditingQuoteId = null;

function openEditModal(quote, quoteId) {
    currentEditingQuoteId = quoteId;

    document.getElementById('editModalTitle').textContent = `Edit Quote ${quote.id}`;

    const dateMatch = quote.eventDate.match(/(\w+) (\d+), (\d+)/);
    const months = {
        'January': '01', 'February': '02', 'March': '03', 'April': '04',
        'May': '05', 'June': '06', 'July': '07', 'August': '08',
        'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    const dateValue = `${dateMatch[3]}-${months[dateMatch[1]]}-${dateMatch[2].padStart(2, '0')}`;

    document.getElementById('editEventDate').value = dateValue;
    document.getElementById('editLocation').value = quote.location;
    document.getElementById('editGuests').value = quote.guests;
    document.getElementById('editNotes').value = quote.notes;

    document.getElementById('editModal').classList.add('show');
    lucide.createIcons();
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    currentEditingQuoteId = null;
}

document.getElementById('editForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const quote = quotesData[currentEditingQuoteId];
    const newDate = new Date(document.getElementById('editEventDate').value);

    quote.eventDate = newDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    quote.location = document.getElementById('editLocation').value;
    quote.guests = parseInt(document.getElementById('editGuests').value);
    quote.notes = document.getElementById('editNotes').value;

    closeEditModal();
    alert('Quote updated successfully! The chef will review your changes.');
    location.reload();
});

document.getElementById('editModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeEditModal();
    }
});

function cancelQuote(quoteId) {
    const quote = quotesData[quoteId];

    if (quote.status === 'Approved') {
        alert('Cannot cancel an approved quote. Please contact us directly.');
        return;
    }

    if (confirm(`Are you sure you want to cancel ${quote.id}?\n\nThis action cannot be undone.`)) {
        const quoteCards = document.querySelectorAll('.quote-card');
        quoteCards[quoteId - 1].style.display = 'none';

        updateStats();

        alert(`Quote ${quote.id} has been cancelled successfully.`);
    }
}

function updateStats() {
    const visibleQuotes = document.querySelectorAll('.quote-card:not([style*="display: none"])').length;
    const pendingQuotes = Array.from(document.querySelectorAll('.status-pending')).filter(
        badge => badge.closest('.quote-card').style.display !== 'none'
    ).length;

    document.querySelector('.stats-cards .stat-card:nth-child(1) .stat-value').textContent = visibleQuotes;
    document.querySelector('.stats-cards .stat-card:nth-child(2) .stat-value').textContent = pendingQuotes;
    let total = 0;
    document.querySelectorAll('.quote-card:not([style*="display: none"]) .total-amount').forEach(el => {
        const amount = parseFloat(el.textContent.replace('').replace(',', ''));
        total += amount;
    });
    document.querySelector('.stats-cards .stat-card:nth-child(4) .stat-value').textContent = `${total.toFixed(2)}`;
}

lucide.createIcons();