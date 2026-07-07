# ╔══════════════════════════════════════════════════════════════╗
# ║  🧬 PHASE 9: THE EVOLUTIONARY METHOD                       ║
# ║  Spawn. Test. Score. Select. Branch. Grow.                  ║
# ╚══════════════════════════════════════════════════════════════╝

# ┌─────────────────────────────────────┐
# │  📖 TABLE OF CONTENTS               │
# └─────────────────────────────────────┘
- [9.1 The Evaluation Framework](#91-the-evaluation-framework)
- [9.2 The Selection Algorithm](#92-the-selection-algorithm)
- [9.3 The Growth Cycle](#93-the-growth-cycle)
- [9.4 When To Stop Evolving](#94-when-to-stop-evolving)

---

## 9.1 The Evaluation Framework

Every module implementation scored on 6 dimensions (1-10 each):

| Dimension | What It Measures | How To Test |
|-----------|-----------------|-------------|
| Correctness | Full interface implemented? All tests pass? | Run validation suite. 100% = 10 |
| Performance | Speed, memory, FPS impact | Automated benchmarks. Relative to best option |
| Simplicity | Lines of code, cognitive complexity | Count LOC. Lower = better |
| Resilience | Error handling, bad input recovery | Inject failures. Score on graceful degradation |
| Flexibility | Easy to configure, extend, adapt | Count lines changed for 3 hypothetical mods |
| Swap Cost | Does rest of system need to change? | MUST be 0. Non-zero = interface violation |

---

## 9.2 The Selection Algorithm

```typescript
function selectBest(implementations: Implementation[]): Implementation {
  // Step 1: Eliminate interface violations
  const valid = implementations.filter(i => i.scores.swapCost === 0);
  
  // Step 2: Eliminate broken implementations
  const correct = valid.filter(i => i.scores.correctness >= 8);
  
  // Step 3: Weighted score
  const scored = correct.map(i => ({
    ...i,
    totalScore: 
      (i.scores.correctness * 3) +
      (i.scores.performance * 3) +
      (i.scores.simplicity * 2) +
      (i.scores.resilience * 2) +
      (i.scores.flexibility * 1)
  }));
  
  // Step 4: Highest score wins. Ties broken by simplicity.
  return scored.sort((a, b) => 
    b.totalScore - a.totalScore || b.scores.simplicity - a.scores.simplicity
  )[0];
}
```

---

## 9.3 The Growth Cycle

After selecting a winner:
1. **WINNER** → current module implementation
2. **LOSERS** → archived in /docs/alternatives/ with full score reports
3. **NEXT ROUND** → spawn 2-3 variants of winner (optimizations, tweaks)
4. **TEST** again with same framework
5. **SELECT** new best
6. **REPEAT** until scores plateau

---

## 9.4 When To Stop Evolving

Module scores 9+ on all dimensions AND two consecutive rounds produce <5% improvement → module is **stable**. Move on.

Track improvement rate. Diminishing returns = maturity.

---

# ┌─────────────────────────────────────┐
# │  📖 TABLE OF CONTENTS (BOTTOM)      │
# └─────────────────────────────────────┘
- [9.1 The Evaluation Framework](#91-the-evaluation-framework)
- [9.2 The Selection Algorithm](#92-the-selection-algorithm)
- [9.3 The Growth Cycle](#93-the-growth-cycle)
- [9.4 When To Stop Evolving](#94-when-to-stop-evolving)
