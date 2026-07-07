# ╔══════════════════════════════════════════════════════════════╗

# ║ ⛓️ PHASE 8: THE LEDGER LAYER ║

# ║ Immutable records. Provenance. Visual blockchain. ║

# ╚══════════════════════════════════════════════════════════════╝

# ┌─────────────────────────────────────┐

# │ 📖 TABLE OF CONTENTS │

# └─────────────────────────────────────┘

- [8.1 Ledger Engine Interface](#81-ledger-engine-interface)
- [8.2 The Chain Structure](#82-the-chain-structure)
- [8.3 Visual Ledger on Canvas](#83-visual-ledger)
- [8.4 Build Instructions](#84-build-instructions)
- [8.5 Validation Criteria](#85-validation-criteria)

---

## 8.1 Ledger Engine Interface

```typescript
interface LedgerEngine extends Module {
  type: "ledger";

  record(transfer: Transfer): Receipt;
  getChain(entityId: string): LedgerEntry[];
  getReceipt(transferId: string): Receipt;
  verify(entry: LedgerEntry): boolean;
  trace(artifactId: string): ProvenanceChain;

  ports: {
    transfers: Port<Transfer>; // IN
    receipts: Port<Receipt>; // OUT
    chains: Port<LedgerEntry[]>; // OUT
  };
}
```

---

## 8.2 The Chain Structure

![Immutable Transfer Chain](./diagrams/ledger.png)

```typescript
interface LedgerEntry {
  id: string;
  timestamp: number;
  from: string; // Source entity
  to: string; // Destination entity
  contentHash: string; // SHA-256 of transferred data
  previousHash: string; // Hash of previous entry (the chain)
  metadata: {
    type: string; // 'task_output' | 'data_transfer' | 'financial' | etc
    size: number;
    description: string;
  };
}
```

Append-only. Each entry links to the previous via hash. Tampering breaks the chain and verification fails.

---

## 8.3 Visual Ledger

Renders as a chain of blocks on canvas. Each block = one transfer. Click any block to see: who, what, when, content hash, and link to the data at that moment (via timeline).

Provenance trace: select any artifact → see its complete chain of custody through all agents that touched it.

---

## 8.4 Build Instructions

```
IN /packages/ledger:
  1. Implement LedgerEngine conforming to Module interface
  2. Append-only log with SHA-256 content hashing
  3. Chain linking (each entry references previous hash)
  4. Provenance tracing (follow chain backwards to origin)
  5. Verification (check all hashes in chain)
  6. Visual: chain of blocks renderer on canvas
  7. Storage: SQLite for persistence (swappable to in-memory for testing)
```

---

## 8.5 Validation Criteria

```
✅ Record 10 transfers. Chain links are valid (hashes connect)
✅ Trace artifact through 3 agents. Full provenance chain returned
✅ Modify a historical entry. Verification fails correctly
✅ Visual chain renders on canvas with clickable blocks
✅ Receipt returned for each recorded transfer
```

---

# ┌─────────────────────────────────────┐

# │ 📖 TABLE OF CONTENTS (BOTTOM) │

# └─────────────────────────────────────┘

- [8.1 Ledger Engine Interface](#81-ledger-engine-interface)
- [8.2 The Chain Structure](#82-the-chain-structure)
- [8.3 Visual Ledger on Canvas](#83-visual-ledger)
- [8.4 Build Instructions](#84-build-instructions)
- [8.5 Validation Criteria](#85-validation-criteria)
