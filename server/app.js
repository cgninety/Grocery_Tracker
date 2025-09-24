const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Database connection
const db = new sqlite3.Database('./grocery.db');

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity_total INTEGER NOT NULL,
    unit TEXT NOT NULL,
    date_bought DATE NOT NULL,
    expiration_date DATE NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    quantity_used INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(item_id) REFERENCES items(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL
  )`);
});

// Routes

// Get all items with remaining quantities
app.get('/api/items', (req, res) => {
  const query = `
    SELECT 
      i.*,
      COALESCE(SUM(ul.quantity_used), 0) as used_quantity,
      (i.quantity_total - COALESCE(SUM(ul.quantity_used), 0)) as remaining_quantity,
      CASE 
        WHEN date(i.expiration_date) <= date('now') THEN 'expired'
        WHEN (i.quantity_total - COALESCE(SUM(ul.quantity_used), 0)) <= 2 THEN 'low'
        ELSE 'good'
      END as status
    FROM items i
    LEFT JOIN usage_logs ul ON i.id = ul.item_id
    GROUP BY i.id
    ORDER BY i.name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new item
app.post('/api/items', (req, res) => {
  const { name, quantity_total, unit, date_bought, expiration_date } = req.body;
  
  db.run(
    'INSERT INTO items (name, quantity_total, unit, date_bought, expiration_date) VALUES (?, ?, ?, ?, ?)',
    [name, quantity_total, unit, date_bought, expiration_date],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Item added successfully' });
    }
  );
});

// Delete item and all its usage logs
app.delete('/api/items/:id', (req, res) => {
  const itemId = req.params.id;
  
  // Start a transaction to delete both usage logs and the item
  db.serialize(() => {
    db.run('DELETE FROM usage_logs WHERE item_id = ?', [itemId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.run('DELETE FROM items WHERE id = ?', [itemId], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        if (this.changes === 0) {
          res.status(404).json({ error: 'Item not found' });
          return;
        }
        
        res.json({ message: 'Item and usage logs deleted successfully' });
      });
    });
  });
});

// Log usage
app.post('/api/usage', (req, res) => {
  const { item_id, quantity_used } = req.body;
  
  db.run(
    'INSERT INTO usage_logs (item_id, quantity_used) VALUES (?, ?)',
    [item_id, quantity_used],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Usage logged successfully' });
    }
  );
});

// Add/update user email
app.post('/api/user', (req, res) => {
  const { email } = req.body;
  
  db.run(
    'INSERT OR REPLACE INTO users (id, email) VALUES (1, ?)',
    [email],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Email updated successfully' });
    }
  );
});

// Get user email
app.get('/api/user', (req, res) => {
  db.get('SELECT email FROM users WHERE id = 1', [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || { email: '' });
  });
});

// Email configuration (you'll need to set these environment variables)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // For Gmail, this must be an App Password, not your regular password
  }
});

// Test email configuration on startup
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Email configuration error:', error.message);
      console.log('📧 For Gmail: Make sure you use an App Password, not your regular password');
      console.log('📧 Enable 2FA and generate App Password at: https://myaccount.google.com/apppasswords');
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
} else {
  console.log('📧 Email not configured. Set EMAIL_USER and EMAIL_PASS environment variables to enable notifications.');
}

// Function to send shopping list email
function sendWeeklyEmail() {
  const query = `
    SELECT 
      i.*,
      COALESCE(SUM(ul.quantity_used), 0) as used_quantity,
      (i.quantity_total - COALESCE(SUM(ul.quantity_used), 0)) as remaining_quantity
    FROM items i
    LEFT JOIN usage_logs ul ON i.id = ul.item_id
    GROUP BY i.id
    HAVING remaining_quantity <= 2 OR date(i.expiration_date) <= date('now')
    ORDER BY i.name
  `;
  
  db.all(query, [], (err, items) => {
    if (err) {
      console.error('Database error:', err);
      return;
    }
    
    if (items.length === 0) {
      console.log('No items need restocking');
      return;
    }
    
    db.get('SELECT email FROM users WHERE id = 1', [], (err, user) => {
      if (err || !user) {
        console.log('No user email configured');
        return;
      }
      
      let emailBody = 'Weekly Grocery Shopping List:\n\n';
      items.forEach(item => {
        const reason = item.remaining_quantity <= 0 ? 'Out of stock' :
                      item.remaining_quantity <= 2 ? `Low stock (${item.remaining_quantity} ${item.unit} left)` :
                      'Expired';
        emailBody += `• ${item.name} - ${reason}\n`;
      });
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Weekly Grocery Shopping List',
        text: emailBody
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Email error:', error);
        } else {
          console.log('Email sent successfully');
        }
      });
    });
  });
}

// Schedule weekly email (every Friday at 8 AM)
cron.schedule('0 8 * * 5', () => {
  console.log('Running weekly email check...');
  sendWeeklyEmail();
});

// Manual trigger for testing
app.post('/api/send-email', (req, res) => {
  sendWeeklyEmail();
  res.json({ message: 'Email sent (if items need restocking)' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});