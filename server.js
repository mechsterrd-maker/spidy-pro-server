const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

// Global Security & Cloud Port
app.use(cors({ origin: '*' }));
app.use(express.json());
const PORT = process.env.PORT || 10000;
const DB_FILE = './database.json';

// --- DATABASE HELPERS ---
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
    } catch (e) { return {}; }
}

function saveDB(data) {
    try { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); } catch (e) {}
}

// --- CLOUD HEALTH CHECK ---
app.get('/', (req, res) => {
    res.send("<body style='background:#000;color:#10b981;font-family:sans-serif;text-align:center;padding-top:100px;'><h1>✅ SPIDY GLOBAL SERVER ACTIVE</h1><p style='color:#fff'>Your Pattern Logic is Restored & Live.</p></body>");
});

// --- RESTORED ORIGINAL LOGIC ---
const MART_STEPS = [1, 2, 5, 11, 24, 50]; 

app.post('/get-bet', (req, res) => {
    let db = loadDB();
    const { history, martIdx, key, deviceId, isLive } = req.body;

    if (!db[key]) return res.status(403).json({ error: "INVALID_LICENSE" });
    let user = db[key];

    if (!user.deviceId) {
        user.deviceId = deviceId;
        saveDB(db);
    } else if (user.deviceId !== deviceId) {
        return res.status(403).json({ error: "LOCKED_DEVICE" });
    }

    // --- YOUR PERFECT LOGIC RESTORED ---
    let prediction = "P";
    if (history && history.length >= 2) {
        // Matches your original pattern exactly
        prediction = (history[0] === history[1]) ? history[0] : (history[0] === 'P' ? 'B' : 'P');
    }

    res.json({
        side: prediction,
        amount: isLive ? Math.round(MART_STEPS[martIdx] || 1) : 0,
        phase: (!history || history.length < 6) ? "ANALYZING" : (isLive ? "LIVE" : "VIRTUAL_WAIT")
    });
});

app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server Active on Port ${PORT}`));