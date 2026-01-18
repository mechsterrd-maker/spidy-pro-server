const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// RESTORED 6-STEP RECOVERY + PAROLI
const MART = [1, 2.2, 4.8, 10.5, 23, 51]; 
const PARO = [1, 2, 4];

app.get('/', (req, res) => res.send("✅ SPIDY V15 PRO ENGINE ACTIVE"));

app.post('/get-bet', (req, res) => {
    const { history, martIdx, paroIdx, isLive } = req.body;

    // RESTORED V15 PATTERN LOGIC
    let prediction = "P";
    let logicName = "START";
    if (history.length >= 2) {
        if (history[0] !== history[1]) {
            prediction = (history[0] === 'P') ? 'B' : 'P'; // CHOP
            logicName = "CHOP";
        } else {
            prediction = history[0]; // STREAK
            logicName = "STREAK";
        }
    }

    let phase = history.length < 6 ? "ANALYZING" : (isLive ? "LIVE" : "VIRTUAL_WAIT");
    let multiplier = (phase === "LIVE") ? ((martIdx > 0) ? MART[martIdx] : PARO[paroIdx]) : 0;

    res.json({
        side: prediction,
        amount: multiplier,
        phase: phase,
        logic: logicName
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`V15 Server Active`));