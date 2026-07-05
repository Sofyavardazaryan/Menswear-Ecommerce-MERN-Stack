/**
 * Database seeder — run with: npm run seed
 *
 * To import products from a JSON file instead:
 *   import { readFileSync } from 'fs';
 *   const products = JSON.parse(readFileSync('./products.json', 'utf-8'));
 *   await Product.insertMany(products);
 */
import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import { sampleProducts } from './products.seed.js';

const seed = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB...');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Use create() so pre('save') middleware fires and slugs are generated
    const inserted = await Product.create(sampleProducts);
    console.log(`Inserted ${inserted.length} sample products`);

    // Create admin user if not exists
    const adminEmail = 'admin@edgers.am';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Edgers Admin',
        email: adminEmail,
        password: 'Admin@1234',
        role: 'admin',
      });
      console.log(`Admin created — email: ${adminEmail} | password: Admin@1234`);
      console.log('IMPORTANT: Change the admin password in production.');
    } else {
      console.log('Admin user already exists — skipped');
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
