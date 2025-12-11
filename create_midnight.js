const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://DatabaseUser:HdB83kq92FzL6h29@classicdb.oe57qrb.mongodb.net/StumbleClassic?retryWrites=true&w=majority';
const dbName = 'ClassicDB';
(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection('Tournaments');

    const now = new Date();
    const parisNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    let target = new Date(parisNow);
    target.setHours(0, 59, 0, 0);
    if (target <= parisNow) {
      target.setDate(target.getDate() + 1);
    }
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    const offsetMinutes = -target.getTimezoneOffset();
    const offsetSign = offsetMinutes >= 0 ? '+' : '-';
    const offsetH = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0');
    const offsetM = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');
    const isoLocal = `${yyyy}-${mm}-${dd}T00:59:00${offsetSign}${offsetH}:${offsetM}`;
    const startTime = new Date(isoLocal);
    const regOpens = new Date(startTime.getTime() - 15 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    const doc = {
      id: 't_midnight_59_eu',
      name: 'Midnight 59 EU',
      description: 'Tournoi test minuit 59 Europe',
      region: 'eu',
      startTime,
      endTime,
      registrationOpensAt: regOpens,
      maxPlayers: 16,
      currentPlayers: 0,
      logo: '',
      imageUrl: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existing = await col.findOne({ id: doc.id });
    if (existing) {
      await col.updateOne({ id: doc.id }, { $set: doc });
      console.log('Updated tournament', doc.id, 'startTime', startTime.toISOString());
    } else {
      await col.insertOne(doc);
      console.log('Inserted tournament', doc.id, 'startTime', startTime.toISOString());
    }
  } catch (e) {
    console.error('Insert/update failed', e);
  } finally {
    await client.close();
  }
})();
