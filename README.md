# 🛒 Grocery Tracker

A beautiful, simple grocery inventory tracking system that helps you never run out of essentials again! Get automatic email notifications when items are running low or expired.

![Grocery Tracker Demo](https://img.shields.io/badge/Status-Ready%20to%20Use-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## Features

-  **Smart Inventory Management** - Add items with quantities, units, purchase dates, and expiration dates
-  **Automatic Calculations** - Tracks remaining quantities as you log usage
-  **Status Indicators** - Visual alerts for low stock (≤2 units) and expired items
-  **Weekly Email Alerts** - Get shopping lists every Friday at 8 AM
-  **Item Management** - Delete items and their usage history with confirmation
-  **Mobile Responsive** - Works perfectly on phones, tablets, and desktops
-  **Beautiful UI** - Clean, modern design with smooth animations

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js + Express
- **Database**: SQLite (zero configuration)
- **Email**: Nodemailer (Gmail, Outlook, SMTP)
- **Scheduling**: node-cron for automated emails

---

## Installation

### **From GitHub**

#### **Windows Installation**
```powershell
# Clone the repository
git clone https://github.com/yourusername/grocery-tracker.git
cd grocery-tracker

# Install Node.js dependencies
npm install

# Start the application
npm start
```

#### **Linux/Mac Installation**
```bash
# Clone the repository
git clone https://github.com/yourusername/grocery-tracker.git
cd grocery-tracker

# Install Node.js dependencies
npm install

# Start the application
npm start
```

### **Prerequisites**
- **Node.js 14+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Gmail account** (optional, for email notifications)

---

## Quick Start

1. **Install & Start**
   ```bash
   git clone https://github.com/yourusername/grocery-tracker.git
   cd grocery-tracker
   npm install
   npm start
   ```

2. **Open Application**
   - Navigate to `http://localhost:3000`

3. **Add Your First Item**
   - Use the "➕ Add New Item" form
   - Enter name, quantity, unit, dates

4. **Set Up Email** (Optional)
   - Configure Gmail app password (see below)
   - Enter your email in settings
   - Test with "Test Email" button

---

## Email Setup (Gmail)

### **Step 1: Enable 2-Factor Authentication**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"

### **Step 2: Generate App Password**
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" → "Windows Computer" (or your OS)
3. Copy the 16-character password (like: `abcd efgh ijkl mnop`)

### **Step 3: Start with Email**
```powershell
# Windows PowerShell
$env:EMAIL_USER="your-email@gmail.com"
$env:EMAIL_PASS="yourapppasswordhere"  # No spaces!
npm start

# Linux/Mac
EMAIL_USER="your-email@gmail.com" EMAIL_PASS="yourapppasswordhere" npm start
```

### **Step 4: Test Email**
1. Open http://localhost:3000
2. Enter your email address in "📧 Email Settings"
3. Click "Test Email" - should arrive within 30 seconds

---

## How to Use

### **Adding Items**
1. Fill out the "Add New Item" form:
   - **Name**: e.g., "Greek Yogurt"
   - **Quantity**: e.g., "12" 
   - **Unit**: Select from dropdown (servings, pieces, grams, etc.)
   - **Date Bought**: Purchase date
   - **Expiration Date**: When it expires

2. Click "Add Item"

### **Logging Usage**
1. When you consume something:
   - Select the item from "Log Usage" dropdown
   - Enter quantity used (e.g., "2" servings)
   - Click "Log Usage"

2. Remaining quantity updates automatically

### **Monitoring Inventory**
Items are color-coded in the inventory:
- 🟢 **Green (Good)**: Adequate stock, not expired
- 🟡 **Orange (Low)**: 2 or fewer units remaining
- 🔴 **Red (Expired)**: Past expiration date

### **Deleting Items**
1. Find the item in "Current Inventory"
2. Click the red "Delete Item" button
3. Confirm deletion (removes item AND all usage logs)

### **Email Notifications**
- **Automatic**: Every Friday at 8:00 AM
- **Manual**: Click "Test Email" anytime
- **Content**: Lists items needing restocking with reasons

---

## Stopping Services

Use these scripts to cleanly shut down all processes:

### **Windows**
```bash
# Double-click or run:
stop-services.bat

# Or PowerShell version:
.\stop-services.ps1
```

### **Linux/Mac**
```bash
# Make executable and run:
chmod +x stop-services.sh
./stop-services.sh
```

---

## Development

### **Project Structure**
```
grocery-tracker/
├── server/
│   └── app.js              # Express server & API
├── public/
│   ├── index.html          # Main interface
│   ├── styles.css          # Styling
│   └── script.js           # Frontend logic
├── stop-services.bat       # Windows shutdown
├── stop-services.ps1       # PowerShell shutdown  
├── stop-services.sh        # Linux/Mac shutdown
├── package.json            # Dependencies
├── grocery.db              # SQLite database (auto-created)
└── README.md              # This file
```

### **Available Scripts**
```bash
npm start          # Start production server
npm run dev        # Start with auto-restart (nodemon)
```

### **Database Schema**
```sql
-- Items table
CREATE TABLE items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  quantity_total INTEGER NOT NULL,
  unit TEXT NOT NULL,
  date_bought DATE NOT NULL,
  expiration_date DATE NOT NULL
);

-- Usage logs table  
CREATE TABLE usage_logs (
  id INTEGER PRIMARY KEY,
  item_id INTEGER,
  quantity_used INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(item_id) REFERENCES items(id)
);

-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
);
```

---

## ⚙️ Configuration

### **Email Schedule**
Edit `server/app.js` to change email timing:
```javascript
// Current: Friday 8 AM
cron.schedule('0 8 * * 5', () => {
  sendWeeklyEmail();
});

// Examples:
// '0 20 * * 0'  = Sunday 8 PM  
// '0 9 * * 1'   = Monday 9 AM
// '0 18 * * 5'  = Friday 6 PM
```

### **Low Stock Threshold**
Change the "2 units" threshold in the SQL queries in `server/app.js`:
```sql
-- Change this line:
HAVING remaining_quantity <= 2 OR date(i.expiration_date) <= date('now')

-- To (for example, 5 units):
HAVING remaining_quantity <= 5 OR date(i.expiration_date) <= date('now')
```

### **Custom SMTP (Advanced)**
Replace Gmail config in `server/app.js`:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

---

##  Troubleshooting

### **Common Issues**

**Port 3000 in use**
```bash
# Windows
stop-services.bat

# Linux/Mac  
./stop-services.sh
```

**Email not working**
- Check Gmail 2FA is enabled
- Use App Password (16 chars, no spaces)
- Check spam folder
- Try "Test Email" button

**Items not saving**
- Check all form fields are filled
- Check browser console for errors
- Restart server: `npm start`

**Database issues**
- Delete `grocery.db` file to reset
- Restart application to recreate tables

---

## Contributing

This is a simple, educational project perfect for:
- Learning Node.js/Express
- Adding new features
- Customizing for your needs

### **Enhancement Ideas**
-  Item categories
-  Photo attachments  
-  Mobile app version
-  Multi-household support
-  Usage analytics
-  Shopping list export

---

## License

MIT License - Feel free to use and modify!

---

## Enjoy!

Never run out of groceries again! Your Friday morning emails will keep you stocked and organized. 

**Questions?** Check the troubleshooting section or open an issue on GitHub.

**Happy grocery tracking!** 