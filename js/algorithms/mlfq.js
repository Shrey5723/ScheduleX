/**
 * mlfq.js — Multi-Level Feedback Queue Scheduling
 *
 * Architecture: 3 SEPARATE FIFO queues (0-indexed).
 *   Level 0 (High)   — RR with quantum Q1 (default 2)
 *   Level 1 (Medium)  — RR with quantum Q2 (default 4)
 *   Level 2 (Low)     — FCFS (Infinity quantum)
 *
 * Feedback rules:
 *   • New processes enter level 0.
 *   • Full quantum used → demote to next level.
 *   • Preempted by higher-level arrival → NO demotion, reinsert same level.
 *   • Level 2 is the bottom → FCFS, no further demotion.
 *
 * FIFO guaranteed by push() + shift() ONLY. Zero sorting anywhere.
 */

export const MLFQ = {
    name: "Multi-Level Feedback Queue",

    // Per-level quantums
    q1: 2,
    q2: 4,

    setQuantums(q1, q2) {
        this.q1 = q1;
        this.q2 = q2;
    },

    // Three separate FIFO queues
    _queues: [[], [], []],

    _reset() {
        this._queues = [[], [], []];
    },

    /** Push process into its current mlfqLevel queue. */
    _enqueue(p) {
        this._queues[p.mlfqLevel].push(p);  // FIFO enqueue
    },

    /** Flatten queues into the flat array the scheduler/visualizer expects. */
    _flatten() {
        return [...this._queues[0], ...this._queues[1], ...this._queues[2]];
    },

    /** Pick next: iterate levels 0→2, shift from first non-empty. */
    _pickNext() {
        for (let i = 0; i < this._queues.length; i++) {
            if (this._queues[i].length > 0) {
                return this._queues[i].shift();  // FIFO dequeue
            }
        }
        return null;
    },

    /** Check if any queue above `level` is non-empty. */
    _hasHigherThan(level) {
        for (let i = 0; i < level; i++) {
            if (this._queues[i].length > 0) return true;
        }
        return false;
    },

    /** Return quantum for a given level. */
    _quantumForLevel(level) {
        if (level === 0) return this.q1;
        if (level === 1) return this.q2;
        return Infinity;  // Level 2 = FCFS
    },

    // ── Scheduler interface ─────────────────────────────────────────

    onArrival(_readyQueue, arrivingProcesses) {
        // Push in the order the scheduler provides.
        // NO sorting — order comes from processManager.
        arrivingProcesses.forEach(p => {
            if (p.mlfqLevel === undefined) p.mlfqLevel = 0;  // New → top level
            MLFQ._enqueue(p);
        });
    },

    scheduleNext(context) {
        let { currentProcess, currentQuantumSlice } = context;

        // ── 1. Handle currently running process ─────────────────────
        if (currentProcess && currentProcess.remainingTime > 0) {
            currentQuantumSlice++;
            let shouldPreempt = false;
            let demote = false;

            const currentQ = MLFQ._quantumForLevel(currentProcess.mlfqLevel);

            // a) Higher-priority queue has processes → preempt, NO demotion
            if (MLFQ._hasHigherThan(currentProcess.mlfqLevel)) {
                shouldPreempt = true;
                demote = false;
            }
            // b) Quantum expired AND not at bottom → preempt AND demote
            else if (currentProcess.mlfqLevel < 2 && currentQuantumSlice >= currentQ) {
                shouldPreempt = true;
                demote = true;
            }
            // Level 2 is FCFS — never preempt on quantum

            if (shouldPreempt) {
                if (demote) {
                    currentProcess.mlfqLevel++;  // Demote to next level
                }
                MLFQ._enqueue(currentProcess);   // Push into (possibly new) queue
                currentProcess = null;
                currentQuantumSlice = 0;
            } else {
                return {
                    nextProcess: currentProcess,
                    readyQueue: MLFQ._flatten(),
                    currentQuantumSlice
                };
            }
        }

        // ── 2. Pick next from highest non-empty queue (FIFO shift) ──
        if (!currentProcess) {
            currentProcess = MLFQ._pickNext();
            currentQuantumSlice = 0;  // Reset quantum on every new pick
        }

        return {
            nextProcess: currentProcess || null,
            readyQueue: MLFQ._flatten(),
            currentQuantumSlice
        };
    }
};
