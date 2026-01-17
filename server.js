const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

// For Render, the database file should be in a writable directory
// but for simple testing, ./database.json works.
const DB_FILE = './database.json';

// --- DATABASE HELPER FUNCTIONS ---
function loadDB() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            const initialData = {
                "TRIAL-FREE": { deviceId: null, expiry: null, type: "trial" },
                "ADMIN-999": { deviceId: null, expiry: null, type: "paid" }
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        return JSON.parse(fs.readFileSync(DB_FILE));
    } catch (e) {
        console.error("DB Load Error:", e);
        return {};
    }
}

function saveDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("DB Save Error:", e);
    }
}

// --- BETTING LOGIC CONFIG ---
// We use whole numbers here so your units remain clean (1x, 2x, 5x, 11x, etc.)
const MART_STEPS = [1, 2, 5, 11, 24, 50]; 

app.post('/get-bet', (req, res) => {
    let db = loadDB();
    const { history, martIdx, key, deviceId, isLive } = req.body;

    // 1. License Check
    if (!db[key]) {
        return res.status(403).json({ error: "INVALID_LICENSE_KEY" });
    }

    let user = db[key];

    // 2. HWID Device Locking
    if (!user.deviceId) {
        user.deviceId = deviceId;
        saveDB(db);
    } else if (user.deviceId !== deviceId) {
        return res.status(403).json({ error: "KEY_LOCKED_TO_OTHER_DEVICE" });
    }

    // 3. Expiry Logic
    const now = Date.now();
    if (user.type === "trial") {
        if (!user.expiry) {
            user.expiry = now + (3 * 24 * 60 * 60 * 1000); // 3 Days
            saveDB(db);
        }
        if (now > user.expiry) {
            return res.status(403).json({ error: "TRIAL_EXPIRED" });
        }
    }

    // 4. Prediction Logic
    let prediction = "P";
    if (history && history.length >= 2) {
        prediction = (history[0] === history[1]) ? history[0] : (history[0] === 'P' ? 'B' : 'P');
    }

    // 5. Response
    // Math.round ensures that even if you change steps to decimals, the UI gets a whole number
    res.json({
        side: prediction,
        amount: isLive ? Math.round(MART_STEPS[martIdx] || 1) : 0,
        phase: (!history || history.length < 6) ? "ANALYZING" : (isLive ? "LIVE" : "VIRTUAL_WAIT")
    });
});

// --- CLOUD DEPLOYMENT PORT ---
// This allows Render/Heroku to tell the app which port to use
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ SPIDY V1 PRO: Online on Port ${PORT}`);
});