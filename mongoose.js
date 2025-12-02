// Contoh koneksi menggunakan Mongoose
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb';

async function connect() {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose;
  }
  // beberapa option tidak lagi diperlukan di versi terbaru, tapi menambah kompatibilitas
  await mongoose.connect(uri, {
    // options are okay to include; mongoose may ignore deprecated ones
    maxPoolSize: 10
  });
  console.log('Mongoose connected to', mongoose.connection.name);

  // contoh model sederhana (untuk demo)
  const DemoSchema = new mongoose.Schema({ hello: String, createdAt: Date });
  const Demo = mongoose.models.Demo || mongoose.model('Demo', DemoSchema);

  // jika dijalankan langsung, buat dokumen demo
  if (require.main === module) {
    const doc = new Demo({ hello: 'world', createdAt: new Date() });
    await doc.save();
    console.log('Saved demo doc via mongoose:', doc._id);
    await disconnect();
  }

  // tangani shutdown
  process.on('SIGINT', disconnect);
  process.on('SIGTERM', disconnect);

  return mongoose;
}

async function disconnect() {
  try {
    await mongoose.disconnect();
    console.log('Mongoose disconnected');
  } catch (err) {
    console.error('Error disconnecting mongoose', err);
  } finally {
    if (require.main === module) process.exit(0);
  }
}

if (require.main === module) {
  connect().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { connect, disconnect, mongoose };