const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const db = new sqlite3.Database('subscriptions.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS subscriptions (uuid TEXT PRIMARY KEY, email TEXT, newsletter TEXT)');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/subscribe', (req, res) => {
  const { email, newsletter } = req.body;

  if (!email || !newsletter) {
    return res.status(400).send('Email and newsletter URL are required.');
  } 

  const uuid = uuidv4();

  db.run('INSERT INTO subscriptions (uuid, email, newsletter) VALUES (?, ?, ?)', [uuid, email, newsletter], (err) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    res.status(201).send('Subscription saved.');
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
