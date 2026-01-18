const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// V16 CONFIGURATION
const MART = [1, 2.2, 4.8, 10.5, 23, 51]; 
const PARO = [1, 2, 4];

app.post('/get-prediction', (req, res) => {
    const { history, martIdx, paroIdx, isLive } = req.body;

    // 1. TREND-SWITCHING LOGIC
    let prediction = "P";
    let logicName = "ANALYSIS";

    if (history.length >= 2) {
        if (history[0] !== history[1]) {
            prediction = (history[0] === 'P') ? 'B' : 'P'; // CHOP
            logicName = "CHOP";
        } else {
            prediction = history[0]; // STREAK
            logicName = "STREAK";
        }
    }

    // 2. PHASE CALCULATOR
    let phase = "ANALYZING";
    if (history.length >= 6) {
        phase = isLive ? "LIVE" : "VIRTUAL_WAIT";
    }

    // 3. MULTIPLIER CALCULATOR
    let multiplier = 0;
    if (phase === "LIVE") {
        multiplier = (martIdx > 0) ? MART[martIdx] : PARO[paroIdx];
    }

    res.json({
        side: prediction,
        amount: multiplier,
        phase: phase,
        logic: logicName
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`V16 PRO Server Engine Active`));