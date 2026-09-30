require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const phone = '01302807788';
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const result = await db.collection('users').updateOne(
      { phone: phone },
      { $set: { password: hashedPassword } }
    );
    
    console.log(`Updated user ${phone} password to 123456. Modified count: ${result.modifiedCount}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
