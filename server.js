require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve new portfolio static files
app.use(express.static(path.join(__dirname, 'public')));
// Serve original images
app.use('/img', express.static(path.join(__dirname, 'img')));
// Serve portafolio pages and shared styles
app.use('/portafolio', express.static(path.join(__dirname, 'portafolio')));
app.use('/style', express.static(path.join(__dirname, 'style')));

// Contact form endpoint
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address' });
  }

  const submission = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    timestamp: new Date().toISOString(),
  };

  console.log('\n📬 New contact submission:');
  console.log('  Name   :', submission.name);
  console.log('  Email  :', submission.email);
  console.log('  Message:', submission.message.substring(0, 120) + (submission.message.length > 120 ? '...' : ''));
  console.log('  Time   :', submission.timestamp);

  // Persist to data/contacts.json
  const dataDir = path.join(__dirname, 'data');
  const dataFile = path.join(dataDir, 'contacts.json');

  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    let contacts = [];
    if (fs.existsSync(dataFile)) {
      try { contacts = JSON.parse(fs.readFileSync(dataFile, 'utf8')); } catch { contacts = []; }
    }
    contacts.push(submission);
    fs.writeFileSync(dataFile, JSON.stringify(contacts, null, 2));
  } catch (err) {
    console.error('⚠️  Could not save contact:', err.message);
  }

  res.json({
    success: true,
    message: `Thanks ${submission.name}! Your message has been received. I'll get back to you soon! 🚀`,
  });
});

// Fallback: serve the portfolio for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀  Portfolio running  →  http://localhost:${PORT}`);
  console.log(`📁  Static files from  →  ./public`);
  console.log(`🖼️   Images from        →  ./img\n`);
});
