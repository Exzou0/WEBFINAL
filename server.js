require('dotenv').config();

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { ObjectId } = require('mongodb');
const { connectDB, getProductsCollection, getUsersCollection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

//  PAGES 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});
app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'auth.html'));
});



function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.post('/auth/register', async (req, res) => {
  const { email, password, role } = req.body; 
  
  if (!email || !password)
    return res.status(400).json({ error: 'Missing credentials' });

  const users = getUsersCollection();
  if (await users.findOne({ email }))
    return res.status(400).json({ error: 'User exists' });

  const finalRole = (role === 'admin') ? 'admin' : 'user';

  const passwordHash = await bcrypt.hash(password, 10);
  await users.insertOne({ 
    email, 
    passwordHash, 
    role: finalRole
  });

  res.status(201).json({ message: 'User created' });
});

async function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const user = await getUsersCollection().findOne({ _id: new ObjectId(req.session.userId) });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
}

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await getUsersCollection().findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ error: 'Invalid credentials' });

  req.session.userId = user._id;
  res.json({ message: 'Logged in' });
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out' }));
});

app.get('/auth/me', async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ user: null });

  const user = await getUsersCollection().findOne({ _id: new ObjectId(req.session.userId) });
  if (!user) return res.status(401).json({ user: null });

  res.json({ 
    user: user._id, 
    role: user.role 
  });
});


app.get('/api/products', async (req, res) => {
  const products = await getProductsCollection().find({}).toArray();
  res.json(products);
});

app.post('/api/products', requireAdmin, async (req, res) => {
  const { name, price, brand, category, stock, description } = req.body;

  if (!name || price == null || !brand || !category || stock == null || !description)
    return res.status(400).json({ error: 'Missing fields' });

  const result = await getProductsCollection().insertOne({
    name, price, brand, category, stock, description,
    createdAt: new Date()
  });

  res.status(201).json({ id: result.insertedId });
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json({ error: 'Invalid id' });

  await getProductsCollection().updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body }
  );

  res.json({ message: 'Updated' });
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).json({ error: 'Invalid id' });

  await getProductsCollection().deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ message: 'Deleted' });
});
