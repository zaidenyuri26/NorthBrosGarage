import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import fs from 'fs';

// Read config
const configPath = './firebase-applet-config.json';
if (!fs.existsSync(configPath)) {
  console.log("No config found, skipping DB update.");
  process.exit(0);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  try {
    const buildsSnap = await getDocs(collection(db, 'builds'));
    let updated = 0;
    for (const d of buildsSnap.docs) {
      const data = d.data();
      if (data.name === 'Toyota GR86 stage 3') {
        await updateDoc(doc(db, 'builds', d.id), { name: 'Toyota GR86' });
        console.log(`Updated build: ${d.id}`);
        updated++;
      }
    }
    console.log(`Finished checking builds. Updated: ${updated}`);
    process.exit(0);
  } catch (err) {
    console.error("Error updating DB:", err);
    process.exit(1);
  }
}

run();
