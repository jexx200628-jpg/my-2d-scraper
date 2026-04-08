const axios = require('axios');
const admin = require('firebase-admin');

// Key ဖိုင်ကို ဖတ်မယ့်အစား Environment Variable ကနေ ယူမယ်
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://leebl-ad3ee-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

async function fetchAndUpload() {
    try {
        const url = "https://query1.finance.yahoo.com/v8/finance/chart/^SET";
        const res = await axios.get(url);
        const meta = res.data.chart.result[0].meta;

        const set = meta.regularMarketPrice;
        const val = meta.regularMarketVolume;

        const sStr = set.toFixed(2).toString();
        const vStr = val.toString();
        const twoD = sStr.charAt(sStr.length - 1) + vStr.charAt(vStr.length - 1);

        await db.ref('live_data').update({
            last_result: twoD,
            set: set.toFixed(2),
            value: (val / 1000000).toFixed(2),
            full_date: new Date().toLocaleString('en-US', { timeZone: 'Asia/Yangon' })
        });
        console.log(`Updated: ${twoD}`);
    } catch (e) {
        console.log("Waiting for Market...");
    }
}

setInterval(fetchAndUpload, 5000);

