const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// YOUR EXACT RECOVERY STEPS - UNTOUCHED
const MART = [1, 2.2, 4.8, 10.5, 23, 51]; 
const PARO = [1, 2, 4];

app.post('/get-prediction', (req, res) => {
    const { history, martIdx, paroIdx, isLive } = req.body;

    let prediction = "P";
    let logicName = "ANALYSIS";
    let isConfident = true; // NEW: Confidence trigger for Ghost Mode

    if (history && history.length >= 4) {
        const h = history;
        
        // 1. PATTERN: STREAK (P-P-P-P)
        if (h[0] === h[1] && h[1] === h[2]) {
            prediction = h[0];
            logicName = "STREAK-MAX";
        }
        // 2. PATTERN: DOUBLETS (P-P-B-B) -> FIXES THE PPBB FAILURE
        // If last 3 are P-P-B, predict B to catch the second half of the pair
        else if (h[0] !== h[1] && h[1] === h[2]) {
            prediction = h[0]; 
            logicName = "DOUBLE-PAIR";
        }
        // 3. PATTERN: PURE CHOP (P-B-P-B)
        else if (h[0] !== h[1] && h[1] !== h[2] && h[2] !== h[3]) {
            prediction = (h[0] === 'P') ? 'B' : 'P';
            logicName = "PURE-CHOP";
        }
        // 4. PATTERN: THE JUMP (B-P-P-B) -> Detects end of a pair
        else if (h[0] !== h[1] && h[1] === h[2] && h[2] !== h[3]) {
            prediction = (h[0] === 'P') ? 'B' : 'P';
            logicName = "JUMP-AWAY";
        }
        // 5. CHAOS PROTECTION (Trigger Ghost Mode)
        else {
            prediction = h[0]; 
            logicName = "CHAOS-DETECTED";
            isConfident = false; // Signals UI to hide bet
        }
    } else if (history && history.length >= 2) {
        // Fallback for short history
        if (history[0] !== history[1]) {
            prediction = (history[0] === 'P') ? 'B' : 'P';
            logicName = "CHOP-INIT";
        } else {
            prediction = history[0];
            logicName = "STREAK-INIT";
        }
    }

    // --- KEEPING ALL YOUR EXACT PHASE LOGIC ---
    let phase = "ANALYZING";
    if (history.length >= 6) {
        // If logic is UNCERTAIN, we stay in VIRTUAL/GHOST even if isLive is true
        phase = (isLive && isConfident) ? "LIVE" : "GHOST_WAIT";
    }

    // --- KEEPING ALL YOUR EXACT MULTIPLIER LOGIC ---
    let multiplier = 0;
    if (phase === "LIVE") {
        multiplier = (martIdx > 0) ? MART[martIdx] : PARO[paroIdx];
    }

    res.json({
        side: prediction,
        amount: multiplier,
        phase: phase,
        logic: logicName,
        isConfident: isConfident // Send confidence to UI
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`spidy-pro-server: V16 Advanced Engine Active`));