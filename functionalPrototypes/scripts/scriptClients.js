const API_URL = '/api/clients';
let clients = [];
let currentClient = null;

// DOM elements
const clientsBody = document.getElementById('clientsBody');
const clientModal = document.getElementById('clientModal');
const clientForm = document.getElementById('clientForm');
const searchClient = document.getElementById('searchClient');

// Event listeners
document.getElementById('btnNewClient').addEventListener('click', () => openClientModal());
document.getElementById('btnCloseModal').addEventListener('click', closeClientModal);
document.getElementById('btnCancel').addEventListener('click', closeClientModal);
clientForm.addEventListener('submit', saveClient);
searchClient.addEventListener('input', filterClients);

// Load data
document.addEventListener('DOMContentLoaded', loadClients);

async function loadClients() {
  try {
    const res = await fetch(API_URL);
    clients = await res.json();
    renderClients(clients);
  } catch (error) {
    console.error('Error loading clients:', error);
  }
}

function renderClients(list = clients) {
  clientsBody.innerHTML = list.map(client => `
    <tr>
      <td>${client.name}</td>
      <td>${client.email || '-'}</td>
      <td>${client.phone || '-'}</td>
      <td>${client.address || '-'}</td>
      <td>
        <button class="btn-icon" onclick="editClient('${client._id}')"><i data-lucide="edit"></i></button>
        <button class="btn-icon btn-danger" onclick="deleteClient('${client._id}')"><i data-lucide="trash-2"></i></button>
      </td>
    </tr>
  `).join('');
  lucide.createIcons();
}

function openClientModal(client = null) {
  currentClient = client;
  const modalTitle = document.getElementById('modalTitle');

  if (client) {
    modalTitle.textContent = 'Edit Client';
    document.getElementById('clientName').value = client.name;
    document.getElementById('clientEmail').value = client.email || '';
    document.getElementById('clientPhone').value = client.phone || '';
    document.getElementById('clientAddress').value = client.address || '';
  } else {
    modalTitle.textContent = 'New Client';
    clientForm.reset();
  }
  clientModal.classList.add('active');
}

function closeClientModal() {
  clientModal.classList.remove('active');
  currentClient = null;
}

async function saveClient(e) {
  e.preventDefault();
  const clientData = {
    name: document.getElementById('clientName').value,
    email: document.getElementById('clientEmail').value,
    phone: document.getElementById('clientPhone').value,
    address: document.getElementById('clientAddress').value
  };

  try {
    if (currentClient) {
      // Update
      const res = await fetch(`${API_URL}/${currentClient._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      const updated = await res.json();
      const idx = clients.findIndex(c => c._id === currentClient._id);
      clients[idx] = updated;
    } else {
      // Create
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      const newClient = await res.json();
      clients.push(newClient);
    }
    closeClientModal();
    renderClients();
  } catch (error) {
    console.error('Error al guardar al cliente:', error);
  }
}

function filterClients() {
  const term = searchClient.value.toLowerCase();
  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(term) ||
    (c.email && c.email.toLowerCase().includes(term))
  );
  renderClients(filtered);
}

function editClient(id) {
  const client = clients.find(c => c._id === id);
  if (client) openClientModal(client);
}

async function deleteClient(id) {
  if (!confirm('Estas seguro de eliminar al cliente?')) return;
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    clients = clients.filter(c => c._id !== id);
    renderClients();
  } catch (error) {
    console.error('Error eliminando cliente:', error);
  }
}
