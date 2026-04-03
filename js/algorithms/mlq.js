/**
 * mlq.js — Multi-Level Queue Scheduling
 *
 * Architecture: 3 SEPARATE FIFO queues (0-indexed).
 *   Level 0 (System)      — Priority 1-3  → Round-Robin
 *   Level 1 (Interactive)  — Priority 4-7  → Round-Robin
 *   Level 2 (Batch)        — Priority 8-10 → FCFS
 *
 * FIFO guaranteed by push() + shift() ONLY. Zero sorting anywhere.
 */

export const MLQ = {
    name: "Multi-Level Queue",

    // Three separate FIFO queues
    _queues: [[], [], []],

    _reset() {
        this._queues = [[], [], []];
    },

    /** Assign queueLevel by priority, push into the correct queue. */
    _enqueue(p) {
        if (p.queueLevel === undefined) {
            if (p.priority <= 3)      p.queueLevel = 0;
            else if (p.priority <= 7) p.queueLevel = 1;
            else                      p.queueLevel = 2;
        }
        this._queues[p.queueLevel].push(p);  // FIFO enqueue
    },

    /** Flatten queues into the flat array the scheduler/visualizer expects. */
    _flatten() {
        return [...this._queues[0], ...this._queues[1], ...this._queues[2]];
    },

    /** Pick next process: iterate levels 0→2, shift from first non-empty. */
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

    // ── Scheduler interface ─────────────────────────────────────────

    onArrival(_readyQueue, arrivingProcesses) {
        // Push in the order the scheduler provides (arrival-time order).
        // NO sorting — order comes from processManager.
        arrivingProcesses.forEach(p => MLQ._enqueue(p));
    },

    scheduleNext(context) {
        let { currentProcess, quantum, currentQuantumSlice } = context;

        // ── 1. Handle currently running process ─────────────────────
        if (currentProcess && currentProcess.remainingTime > 0) {
            currentQuantumSlice++;
            let shouldPreempt = false;

            // a) Higher-priority queue has waiting processes → preempt
            if (MLQ._hasHigherThan(currentProcess.queueLevel)) {
                shouldPreempt = true;
            }
            // b) RR levels (0, 1): quantum expired → preempt
            else if (currentProcess.queueLevel <= 1 && currentQuantumSlice >= quantum) {
                shouldPreempt = true;
            }
            // Level 2 is FCFS — never preempt on quantum

            if (shouldPreempt) {
                // MLQ: always reinsert into SAME queue (no demotion)
                this._queues[currentProcess.queueLevel].push(currentProcess);
                currentProcess = null;
                currentQuantumSlice = 0;
            } else {
                return {
                    nextProcess: currentProcess,
                    readyQueue: this._flatten(),
                    currentQuantumSlice
                };
            }
        }

        // ── 2. Pick next from highest non-empty queue (FIFO shift) ──
        if (!currentProcess) {
            currentProcess = this._pickNext();
            currentQuantumSlice = 0;
        }

        return {
            nextProcess: currentProcess || null,
            readyQueue: this._flatten(),
            currentQuantumSlice
        };
    }
};
