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

// helper: hex -> [r,g,b]
function _hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)];
}

function downloadPDF(quoteId) {
    const quote = quotesData[quoteId];
    if (!quote) return;

    const jsPDFCtor = (window.jspdf && (window.jspdf.jsPDF || window.jspdf.default)) || window.jsPDF || null;
    if (!jsPDFCtor) {
        alert('jsPDF not available. Cannot generate PDF.');
        return;
    }

    const PINK = '#e91e63';
    const pinkRgb = _hexToRgb(PINK);

    // helper: infer type from name
    function inferType(name) {
        const n = name.toLowerCase();
        if (n.includes('cake') || n.includes('cheesecake') || n.includes('dessert') || n.includes('lava')) return 'Dessert';
        if (n.includes('cocktail') || n.includes('cuba') || n.includes('drink')) return 'Drink';
        return 'Main';
    }

    try {
        const doc = new jsPDFCtor({unit: 'pt', format: 'a4'});
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header background
        doc.setFillColor(pinkRgb[0], pinkRgb[1], pinkRgb[2]);
        doc.rect(30, 30, pageWidth - 60, 70, 'F');

        // Header text
        doc.setTextColor(255,255,255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('DishDash', 40, 60);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Catering & Event Planning', 40, 78);

        // Quote id and date (right aligned on header)
        doc.setFontSize(10);
        doc.text(`Quote ${quote.id}`, pageWidth - 40, 52, {align: 'right'});
        const now = new Date();
        const creationDate = now.toLocaleDateString('en-US');
        doc.text(`Date: ${creationDate}`, pageWidth - 40, 68, {align: 'right'});

        // Client Information box
        const infoY = 110;
        doc.setDrawColor(pinkRgb[0], pinkRgb[1], pinkRgb[2]);
        doc.setFillColor(242,242,242);
        doc.rect(30, infoY, pageWidth - 60, 60, 'F');
        doc.setFontSize(14);
        doc.setTextColor(30,40,50);
        doc.setFont('helvetica', 'bold');
        doc.text('Client Information', 40, infoY + 18);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const clientName = quote.client || quote.clientName || 'Client';
        const eventDate = quote.eventDate || '';
        const guests = (quote.guests !== undefined) ? String(quote.guests) : '';
        doc.text(`Client: ${clientName}`, 40, infoY + 36);
        doc.text(`Event Date: ${eventDate}`, 220, infoY + 36);
        doc.text(`Number of People: ${guests}`, 40, infoY + 52);

        // Selected Items title
        const itemsY = infoY + 80;
        doc.setFontSize(14);
        doc.setTextColor(30,40,50);
        doc.setFont('helvetica', 'bold');
        doc.text('Selected Items', 40, itemsY);

        // Prepare table data: Recipe, Type, Servings, Price/Serving, Total
        const body = (quote.products || []).map(p => {
            const qty = p.quantity || 1;
            const unit = (p.price || 0);
            const lineTotal = unit * qty;
            return [
                p.name || '',
                inferType(p.name || ''),
                String(qty),
                `$${unit.toFixed(2)}`,
                `$${lineTotal.toFixed(2)}`
            ];
        });

        // autoTable if available
        if (typeof doc.autoTable === 'function') {
            doc.autoTable({
                startY: itemsY + 8,
                margin: {left: 40, right: 40},
                head: [['Recipe','Type','Servings','Price/Serving','Total']],
                body: body,
                styles: { font: 'helvetica', fontSize: 10, textColor: [40,40,40] },
                headStyles: { fillColor: pinkRgb, textColor: [255,255,255] },
                columnStyles: {
                    0: {cellWidth: 180},
                    1: {cellWidth: 80},
                    2: {cellWidth: 60, halign: 'right'},
                    3: {cellWidth: 80, halign: 'right'},
                    4: {cellWidth: 80, halign: 'right'}
                },
                styles: {overflow: 'linebreak'}
            });

            // Totals block below table
            const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 12 : itemsY + 120;

            // calculate totals
            const subtotal = (quote.products || []).reduce((s, p) => s + ((p.price || 0) * (p.quantity || 1)), 0);
            const discount = quote.discount || 0; // assume absolute value or percentage? use absolute amount here
            const tax = subtotal * 0.15;
            const total = subtotal - (discount || 0) + tax;

            // Totals panel
            const panelX = 40;
            const panelW = pageWidth - 80;
            doc.setFillColor(245,245,245);
            doc.rect(panelX, finalY, panelW, 80, 'F');

            doc.setFontSize(10);
            doc.setTextColor(60,70,80);
            doc.text('Subtotal:', panelX + panelW - 160, finalY + 20, {align: 'left'});
            doc.text(`$${subtotal.toFixed(2)}`, panelX + panelW - 40, finalY + 20, {align: 'right'});

            doc.text('Discount (0%):', panelX + panelW - 160, finalY + 36, {align: 'left'});
            doc.text(`-$${(discount || 0).toFixed(2)}`, panelX + panelW - 40, finalY + 36, {align: 'right'});

            doc.text('Tax (15%):', panelX + panelW - 160, finalY + 52, {align: 'left'});
            doc.text(`$${tax.toFixed(2)}`, panelX + panelW - 40, finalY + 52, {align: 'right'});

            // TOTAL
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(pinkRgb[0], pinkRgb[1], pinkRgb[2]);
            doc.text('TOTAL:', panelX + panelW - 160, finalY + 72, {align: 'left'});
            doc.text(`$${total.toFixed(2)}`, panelX + panelW - 40, finalY + 72, {align: 'right'});

            // Footer: Quoted by
            const footerY = finalY + 100;
            doc.setFontSize(9);
            doc.setTextColor(60,70,80);
            const quotedBy = quote.quotedBy || 'Rosi Caárte Galarza';
            doc.text('Quoted by:', 40, footerY);
            doc.text(quotedBy, 40, footerY + 12);
            doc.text(`ID: ${quote.quotedId || '1316848215'}`, 40, footerY + 26);
            doc.text('Jipijapa, Manabí, Ecuador', 40, footerY + 40);

        } else {
            // Fallback simple listing
            let y = itemsY + 20;
            doc.setFontSize(10);
            (quote.products || []).forEach(p => {
                const qty = p.quantity || 1;
                const unit = (p.price || 0);
                const lineTotal = unit * qty;
                doc.text(`${p.name} — ${qty} x $${unit.toFixed(2)} = $${lineTotal.toFixed(2)}`, 40, y);
                y += 12;
            });
            const subtotal = (quote.products || []).reduce((s, p) => s + ((p.price || 0) * (p.quantity || 1)), 0);
            const tax = subtotal * 0.15;
            const total = subtotal + tax;
            doc.setTextColor(pinkRgb[0], pinkRgb[1], pinkRgb[2]);
            doc.text(`Total: $${total.toFixed(2)}`, 40, y + 12);
        }

        const filename = `${quote.id}.pdf`;
        doc.save(filename);
    } catch (e) {
        console.error('Error generating PDF for history:', e);
        alert('Failed to generate PDF.');
    }
}

lucide.createIcons();