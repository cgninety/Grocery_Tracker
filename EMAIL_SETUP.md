# Gmail Setup for Grocery Tracker

## Step-by-Step Gmail Configuration

### 1. Enable 2-Factor Authentication
- Go to your Google Account: https://myaccount.google.com/
- Click "Security" in the left sidebar
- Under "How you sign in to Google", click "2-Step Verification"
- Follow the setup process

### 2. Generate App Password
- After 2FA is enabled, go to: https://myaccount.google.com/apppasswords
- Select "Mail" as the app
- Select "Windows Computer" as the device
- Click "Generate"
- **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### 3. Start Server with Email
Replace the email and app password below with your actual credentials:

```powershell
$env:EMAIL_USER="your-email@gmail.com"
$env:EMAIL_PASS="your-16-char-app-password"
npm start
```

### 4. Test Email
- Open http://localhost:3000
- Enter your email in the Email Settings section
- Click "Test Email" to verify it works

## Alternative: Other Email Providers

### Outlook/Hotmail
```powershell
$env:EMAIL_USER="your-email@outlook.com"
$env:EMAIL_PASS="your-password"
npm start
```

### Custom SMTP (Advanced)
Edit `server/app.js` and replace the transporter configuration:
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

## Troubleshooting

- **"Invalid login"**: Use App Password, not regular password
- **"Authentication failed"**: Check 2FA is enabled and App Password is correct
- **"Connection timeout"**: Check your internet connection and firewall settings