require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Category = require('./models/Category');

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for seeding');

  // Clear existing data
  await Ticket.deleteMany({});
  await User.deleteMany({});
  await Category.deleteMany({});

  // Create categories
  const catTech = await Category.create({ name: 'Technical' });
  const catBilling = await Category.create({ name: 'Billing' });
  const catGeneral = await Category.create({ name: 'General' });
  const catAccount = await Category.create({ name: 'Account' });

  // Use passwords from .env or fallback to defaults
  const adminPassword = process.env.ADMIN_PASSWORD || 'pass123';
  const agent1Password = process.env.AGENT1_PASSWORD || 'pass123';
  const agent2Password = process.env.AGENT2_PASSWORD || 'pass123';
  const user1Password = process.env.USER1_PASSWORD || 'pass123';
  const user2Password = process.env.USER2_PASSWORD || 'pass123';

  // Create users
  const admin = await User.create({ name: 'Admin User', email: 'admin@acompworld.com', password: await bcrypt.hash(adminPassword, 10), role: 'Admin' });
  const agent1 = await User.create({ name: 'Agent One', email: 'agent1@acompworld.com', password: await bcrypt.hash(agent1Password, 10), role: 'Agent' });
  const agent2 = await User.create({ name: 'Agent Two', email: 'agent2@acompworld.com', password: await bcrypt.hash(agent2Password, 10), role: 'Agent' });
  const user1 = await User.create({ name: 'User One', email: 'user1@acompworld.com', password: await bcrypt.hash(user1Password, 10), role: 'User' });
  const user2 = await User.create({ name: 'User Two', email: 'user2@acompworld.com', password: await bcrypt.hash(user2Password, 10), role: 'User' });

  // Create tickets
  await Ticket.create({
    title: 'Sample Ticket 1',
    description: 'This is a sample ticket 1.',
    category: catTech._id,
    status: 'Open',
    createdBy: user1._id,
    assignedTo: agent1._id,
    comments: [],
  });
  await Ticket.create({
    title: 'Sample Ticket 2',
    description: 'This is a sample ticket 2.',
    category: catBilling._id,
    status: 'Open',
    createdBy: user2._id,
    assignedTo: agent2._id,
    comments: [],
  });

  console.log('Seed data created!');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); }); 