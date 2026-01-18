const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// V16 RECOVERY STEPS
const MART = [1, 2.2, 4.8, 10.5, 23, 51]; 
const PARO = [1, 2, 4];

app.post('/get-prediction', (req, res) => {
    const { history, martIdx, paroIdx, isLive } = req.body;

    // TREND-SWITCHING LOGIC: Detects if table is ZIG-ZAG (Chop) or STREAKING
    let prediction = "P";
    let logicName = "START";

    if (history.length >= 2) {
        if (history[0] !== history[1]) {
            prediction = (history[0] === 'P') ? 'B' : 'P'; // Catch the Chop
            logicName = "CHOP";
        } else {
            prediction = history[0]; // Follow the Streak
            logicName = "STREAK";
        }
    }

    // PHASE CALCULATOR: Analysis (0-6) -> Virtual Wait -> Live
    let phase = "ANALYZING";
    if (history.length >= 6) {
        phase = isLive ? "LIVE" : "VIRTUAL_WAIT";
    }

    // MULTIPLIER: Paroli for wins, Martingale for recovery
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
app.listen(PORT, '0.0.0.0', () => console.log(`spidy-pro-server engine active`));