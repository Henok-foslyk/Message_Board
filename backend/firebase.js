const admin = require('firebase-admin');
const serviceAccount = require('./permissions.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const FieldValue = admin.firestore.FieldValue;

module.exports = { db, FieldValue };
