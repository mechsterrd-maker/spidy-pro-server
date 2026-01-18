const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// YOUR EXACT RECOVERY STEPS
const MART = [1, 2.2, 4.8, 10.5, 23, 51]; 
const PARO = [1, 2, 4];

app.post('/get-prediction', (req, res) => {
    const { history, martIdx, paroIdx, isLive } = req.body;

    // 1. YOUR EXACT PATTERN LOGIC
    let prediction = "P";
    let logicName = "START";

    if (history && history.length >= 2) {
        if (history[0] !== history[1]) {
            // THE CHOP: If last two are different, predict the opposite of the last one
            prediction = (history[0] === 'P') ? 'B' : 'P';
            logicName = "CHOP";
        } else {
            // THE STREAK: If last two are same, follow the streak
            prediction = history[0];
            logicName = "STREAK";
        }
    } else if (history && history.length === 1) {
        // Fallback for very first hand
        prediction = (history[0] === 'P') ? 'P' : 'B';
    }

    // 2. YOUR EXACT PHASE LOGIC (Analysis -> Virtual -> Live)
    let phase = "ANALYZING";
    if (history.length >= 6) {
        phase = isLive ? "LIVE" : "VIRTUAL_WAIT";
    }

    // 3. YOUR EXACT MULTIPLIER LOGIC
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
app.listen(PORT, '0.0.0.0', () => console.log(`spidy-pro-server: Golden Logic Active`));