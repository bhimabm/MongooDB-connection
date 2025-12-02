// Contoh koneksi menggunakan MongoDB native driver (mongodb)
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb';

let client = null;
let db = null;

/**
 * Connect ke MongoDB dan kembalikan instance db
 */
async function connect() {
  if (db) return db; // sudah terkoneksi
  client = new MongoClient(uri, { maxPoolSize: 10 });
  await client.connect();
  // Jika URI memiliki database di dalamnya, client.db() akan menggunakannya.
  // Untuk memastikan database tertentu, bisa panggil client.db('nama_db')
  db = client.db();
  console.log('MongoDB native driver connected to', db.databaseName);
  // tangani shutdown
  process.on('SIGINT', close);
  process.on('SIGTERM', close);
  return db;
}

function getDb() {
  if (!db) throw new Error('MongoDB belum terhubung. Panggil connect() dulu.');
  return db;
}

async function close() {
  try {
    if (client) {
      await client.close();
      console.log('MongoDB native driver connection closed');
    }
  } catch (err) {
    console.error('Error closing MongoDB connection', err);
  } finally {
    client = null;
    db = null;
    // hanya untuk proses demo (jika dipanggil saat run langsung)
    if (require.main === module) process.exit(0);
  }
}

/**
 * Jika file ini dijalankan langsung, lakukan demo kecil:
 * - connect
 * - tampilkan koleksi yang ada
 */
if (require.main === module) {
  (async () => {
    try {
      const db = await connect();
      const cols = await db.listCollections().toArray();
      console.log('Collections:', cols.map(c => c.name));
      // contoh operasi sederhana
      const coll = db.collection('demo');
      await coll.insertOne({ hello: 'world', createdAt: new Date() });
      console.log('Inserted demo document');
    } catch (err) {
      console.error(err);
    } finally {
      await close();
    }
  })();
}

module.exports = { connect, getDb, close };