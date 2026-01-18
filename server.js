const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Multipliers for 3-step Martingale
const MART_3 = [1, 2.2, 4.8]; 

app.post('/get-prediction', (req, res) => {
    const { history, martIdx, paroIdx, isLive, progMode, failedMartingales, shoeProfit } = req.body;

    let prediction = "P";
    let logicName = "WAITING";
    let isConfident = false;

    // --- EVIDENCE LOGIC (UNCHANGED) ---
    if (history && history.length >= 4) {
        const h = history;
        if (h[0] === h[1] && h[1] === h[2]) { prediction = h[0]; logicName = "CONFIRMED-STREAK"; isConfident = true; }
        else if (h[0] === h[1] && h[1] !== h[2] && h[2] === h[3]) { prediction = (h[0] === 'P') ? 'B' : 'P'; logicName = "CONFIRMED-DOUBLE"; isConfident = true; }
        else if (h[0] !== h[1] && h[1] !== h[2]) { prediction = (h[0] === 'P') ? 'B' : 'P'; logicName = "CONFIRMED-CHOP"; isConfident = true; }
        else { prediction = h[0]; logicName = "GHOST-WAIT"; isConfident = false; }
    }

    // --- PROGRESSION MULTIPLIER LOGIC ---
    let multiplier = 0;
    let currentBase = 1 + failedMartingales; // If 3-step fails, base becomes 2x, then 3x, etc.

    if (isLive && isConfident) {
        if (martIdx > 0) {
            // In Martingale Recovery
            multiplier = currentBase * MART_3[martIdx];
        } else {
            // Initial Bet / Paroli Logic
            if (progMode === "CLASSIC") {
                const PARO_CLASSIC = [1, 2, 4];
                multiplier = currentBase * PARO_CLASSIC[paroIdx];
            } else if (progMode === "PARO_45") {
                // 45% Paroli: 1 -> 1.45 -> 2.1
                const PARO_45 = [1, 1.45, 2.1];
                multiplier = currentBase * PARO_45[paroIdx];
            } else if (progMode === "PARO_100") {
                // 100% Paroli (Aggressive): 1 -> 2 -> 4
                const PARO_100 = [1, 2, 4];
                multiplier = currentBase * PARO_100[paroIdx];
            }
        }
    }

    res.json({
        side: prediction,
        amount: multiplier,
        isConfident: isConfident,
        logic: logicName
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server: Multi-Progression Active`));