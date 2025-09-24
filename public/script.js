const API_BASE = '';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadItems();
    loadUserEmail();
    setupEventListeners();
    setDefaultDates();
});

function setupEventListeners() {
    document.getElementById('addItemForm').addEventListener('submit', handleAddItem);
    document.getElementById('logUsageForm').addEventListener('submit', handleLogUsage);
}

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateBought').value = today;
    
    // Set expiration date to 1 week from now as default
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.getElementById('expirationDate').value = nextWeek.toISOString().split('T')[0];
}

async function loadItems() {
    try {
        const response = await fetch(`${API_BASE}/api/items`);
        const items = await response.json();
        displayItems(items);
        populateUsageSelect(items);
    } catch (error) {
        console.error('Error loading items:', error);
        showMessage('Error loading items', 'error');
    }
}

function displayItems(items) {
    const container = document.getElementById('inventoryList');
    
    if (items.length === 0) {
        container.innerHTML = '<div class="loading">No items in inventory yet. Add some items above!</div>';
        return;
    }
    
    container.innerHTML = items.map(item => {
        const daysUntilExpiration = Math.ceil((new Date(item.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
        const expirationText = daysUntilExpiration < 0 ? `Expired ${Math.abs(daysUntilExpiration)} days ago` :
                              daysUntilExpiration === 0 ? 'Expires today' :
                              `Expires in ${daysUntilExpiration} days`;
        
        return `
            <div class="inventory-item ${item.status}">
                <div class="item-header">
                    <span class="item-name">${item.name}</span>
                    <span class="item-status status-${item.status}">${item.status}</span>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <span>Remaining:</span>
                        <strong>${item.remaining_quantity} ${item.unit}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Total:</span>
                        <span>${item.quantity_total} ${item.unit}</span>
                    </div>
                    <div class="detail-item">
                        <span>Used:</span>
                        <span>${item.used_quantity} ${item.unit}</span>
                    </div>
                    <div class="detail-item">
                        <span>Bought:</span>
                        <span>${formatDate(item.date_bought)}</span>
                    </div>
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <span>Status:</span>
                        <span>${expirationText}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="delete-btn" onclick="deleteItem(${item.id}, '${item.name}')">Delete Item</button>
                </div>
            </div>
        `;
    }).join('');
}

function populateUsageSelect(items) {
    const select = document.getElementById('usageItem');
    const activeItems = items.filter(item => item.remaining_quantity > 0 && item.status !== 'expired');
    
    select.innerHTML = '<option value="">Select item...</option>' + 
        activeItems.map(item => 
            `<option value="${item.id}">${item.name} (${item.remaining_quantity} ${item.unit} left)</option>`
        ).join('');
}

async function handleAddItem(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('itemName').value,
        quantity_total: parseInt(document.getElementById('itemQuantity').value),
        unit: document.getElementById('itemUnit').value,
        date_bought: document.getElementById('dateBought').value,
        expiration_date: document.getElementById('expirationDate').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showMessage('Item added successfully!', 'success');
            document.getElementById('addItemForm').reset();
            setDefaultDates();
            loadItems();
        } else {
            throw new Error('Failed to add item');
        }
    } catch (error) {
        console.error('Error adding item:', error);
        showMessage('Error adding item', 'error');
    }
}

async function handleLogUsage(e) {
    e.preventDefault();
    
    const formData = {
        item_id: parseInt(document.getElementById('usageItem').value),
        quantity_used: parseInt(document.getElementById('usageQuantity').value)
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/usage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showMessage('Usage logged successfully!', 'success');
            document.getElementById('logUsageForm').reset();
            loadItems();
        } else {
            throw new Error('Failed to log usage');
        }
    } catch (error) {
        console.error('Error logging usage:', error);
        showMessage('Error logging usage', 'error');
    }
}

async function updateEmail() {
    const email = document.getElementById('userEmail').value;
    if (!email) {
        showMessage('Please enter an email address', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        if (response.ok) {
            showMessage('Email updated successfully!', 'success');
        } else {
            throw new Error('Failed to update email');
        }
    } catch (error) {
        console.error('Error updating email:', error);
        showMessage('Error updating email', 'error');
    }
}

async function loadUserEmail() {
    try {
        const response = await fetch(`${API_BASE}/api/user`);
        const user = await response.json();
        if (user.email) {
            document.getElementById('userEmail').value = user.email;
        }
    } catch (error) {
        console.error('Error loading user email:', error);
    }
}

async function testEmail() {
    try {
        const response = await fetch(`${API_BASE}/api/send-email`, {
            method: 'POST'
        });
        
        if (response.ok) {
            showMessage('Test email sent! Check your inbox.', 'success');
        } else {
            throw new Error('Failed to send email');
        }
    } catch (error) {
        console.error('Error sending test email:', error);
        showMessage('Error sending test email. Make sure email is configured.', 'error');
    }
}

async function deleteItem(itemId, itemName) {
    if (!confirm(`Are you sure you want to delete "${itemName}"? This will also remove all usage logs for this item.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/items/${itemId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage(`"${itemName}" deleted successfully!`, 'success');
            loadItems();
        } else {
            throw new Error('Failed to delete item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showMessage('Error deleting item', 'error');
    }
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    const firstSection = document.querySelector('section');
    firstSection.parentNode.insertBefore(messageDiv, firstSection);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}