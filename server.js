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

    let prediction = "P";
    let logicName = "WAITING";
    let isConfident = false; // Default to false: Evidence required

    if (history && history.length >= 4) {
        const h = history;
        
        // 1. EVIDENCE: STREAK (Confirmed after 3 of a kind)
        // Table showed P-P-P. Evidence says it's a streak. Predict P.
        if (h[0] === h[1] && h[1] === h[2]) {
            prediction = h[0];
            logicName = "CONFIRMED-STREAK";
            isConfident = true;
        }
        // 2. EVIDENCE: DOUBLETS (Confirmed after PPBB)
        // Table showed P-P-B-B. Evidence says it's 2-2. Predict next P.
        else if (h[0] === h[1] && h[1] !== h[2] && h[2] === h[3]) {
            prediction = (h[0] === 'P') ? 'B' : 'P';
            logicName = "CONFIRMED-DOUBLE";
            isConfident = true;
        }
        // 3. EVIDENCE: PURE CHOP (Confirmed after P-B-P)
        // Table showed P-B-P. Evidence says it's 1-1. Predict next B.
        else if (h[0] !== h[1] && h[1] !== h[2]) {
            prediction = (h[0] === 'P') ? 'B' : 'P';
            logicName = "CONFIRMED-CHOP";
            isConfident = true;
        }
        // 4. EVIDENCE: 2-1-2 (Confirmed after P-P-B-P)
        else if (h[0] !== h[1] && h[1] !== h[2] && h[2] === h[3]) {
            prediction = h[0];
            logicName = "CONFIRMED-2-1";
            isConfident = true;
        }
        // NO EVIDENCE: Enter Ghost Mode
        else {
            prediction = h[0]; 
            logicName = "GHOST-CONFIRMING";
            isConfident = false;
        }
    }

    // PHASE LOGIC
    let phase = "ANALYZING";
    if (history.length >= 6) {
        // If we are Live but no pattern is confirmed, we go to GHOST_WAIT (resuming Martingale later)
        phase = (isLive && isConfident) ? "LIVE" : "GHOST_WAIT";
    }

    // MULTIPLIER LOGIC (Resumes Martingale step when Confident returns)
    let multiplier = 0;
    if (phase === "LIVE") {
        multiplier = (martIdx > 0) ? MART[martIdx] : PARO[paroIdx];
    }

    res.json({
        side: prediction,
        amount: multiplier,
        phase: phase,
        logic: logicName,
        isConfident: isConfident
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`spidy-pro-server: Evidence-Based Active`));