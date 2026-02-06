//
require('dotenv').config({ override: true });

//
console.log('ENV CHECK MONGO_URI =', process.env.MONGO_URI);




const express = require('express');
const path = require('path');
const fs = require('fs');
//
const bcrypt = require('bcrypt');
const session = require('express-session');
// NUR
const { ObjectId } = require('mongodb');
const { connectDB, getProductsCollection, getUsersCollection } = require('./db');



const app = express();
//
const PORT = process.env.PORT || 3000;


connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB connect error:', err.message);
    process.exit(1);
  });



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
//
app.use(
  session({
    secret: 'secret123', 
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true
    }
  })
);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* ---------------- PAGES ---------------- */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

/* ---------------- QUERY & PARAMS ---------------- */
app.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).send('Missing query parameter: q');
  res.send(`<h2>Search result for: ${q}</h2>`);
});

app.get('/item/:id', (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).send('Invalid ID');
  res.send(`<h2>Item ID: ${id}</h2>`);
});

/* ---------------- FORM (POST) ---------------- */
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).send('All fields are required');

  const data = { name, email, message, date: new Date() };
  fs.writeFile('messages.json', JSON.stringify(data, null, 2), (err) => {
    if (err) return res.status(500).send('Failed to save message');
    res.send(`<h2>Thanks, ${name}! Your message has been saved.</h2>`);
  });
});

/* ---------------- API INFO ---------------- */
app.get('/api/info', (req, res) => {
  res.json({
    project: 'Express Assignment',
    participant: 'Participant 2'
  });
});

/* ---------------- API + VALIDATION ---------------- */
function parsePrice(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function validateItemBody(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const price = parsePrice(body.price);

  if (!name) return { ok: false, error: 'Missing or empty field: name' };
  if (price === null) return { ok: false, error: 'Missing or invalid field: price' };
  if (price < 0) return { ok: false, error: 'price must be >= 0' };

  return { ok: true, data: { name, price } };
}


//
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}


// LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Missing credentials' });

  const user = await getUsersCollection().findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  req.session.userId = user._id;
  res.status(200).json({ message: 'Logged in' });
});

// LOGOUT
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: 'Logged out' });
  });
});

// ===== CRUD API /api/items =====

// GET all items
app.get('/api/products', async (req, res) => {
  const products = await getProductsCollection().find({}).toArray();
  res.status(200).json(products);
});


// GET item by id
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id))
    return res.status(400).json({ error: 'Invalid id' });

  const product = await getProductsCollection()
    .findOne({ _id: new ObjectId(id) });

  if (!product)
    return res.status(404).json({ error: 'Product not found' });

  res.status(200).json(product);
});


// CREATE item
app.post('/api/products', requireAuth, async (req, res) => {
  const { name, price, brand, category, stock, description } = req.body;

  if (!name || price === undefined || !brand || !category || stock === undefined || !description)
    return res.status(400).json({ error: 'Missing fields' });

  const result = await getProductsCollection().insertOne({
    name, price, brand, category, stock, description,
    createdAt: new Date()
  });

  res.status(201).json({ id: result.insertedId });
});


// UPDATE item
app.put('/api/products/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id))
    return res.status(400).json({ error: 'Invalid id' });

  const result = await getProductsCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: req.body }
  );

  if (result.matchedCount === 0)
    return res.status(404).json({ error: 'Product not found' });

  res.status(200).json({ message: 'Updated' });
});


// DELETE item
app.delete('/api/products/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id))
    return res.status(400).json({ error: 'Invalid id' });

  const result = await getProductsCollection()
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0)
    return res.status(404).json({ error: 'Product not found' });

  res.status(200).json({ message: 'Deleted' });
});


app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);
  await getUsersCollection().insertOne({ email, passwordHash });

  res.status(201).json({ message: 'User created' });
});

// API 404
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

/* ---------------- PAGE 404 ---------------- */
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

