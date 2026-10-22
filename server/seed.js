import 'dotenv/config';import mongoose from 'mongoose';import {seedResources,seedUser} from './seed-data.js';import {initIndexes} from './models.js';
if(!process.env.MONGODB_URI)throw new Error('Set MONGODB_URI.');
await mongoose.connect(process.env.MONGODB_URI);await initIndexes();await seedResources();
if(process.env.SEED_ADMIN_EMAIL&&process.env.SEED_ADMIN_PASSWORD){if(process.env.SEED_ADMIN_PASSWORD.length<12)throw new Error('Use a manager password of at least 12 characters.');await seedUser('Campus Manager',process.env.SEED_ADMIN_EMAIL.toLowerCase(),process.env.SEED_ADMIN_PASSWORD,'manager');}
console.log('Seed complete. Existing accounts and passwords were not changed.');await mongoose.disconnect();
