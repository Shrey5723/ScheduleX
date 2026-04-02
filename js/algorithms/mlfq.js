/**
 * mlfq.js
 * Multi-Level Feedback Queue scheduling algorithm
 * Processes demote after using full quantum.
 * Default Q1=2, Q2=4
 */

export const MLFQ = {
    name: "Multi-Level Feedback Queue",
    q1: 2,
    q2: 4,

    setQuantums: function(q1, q2) {
        this.q1 = q1;
        this.q2 = q2;
    },

    _reset: function() {
        // Reset isn't strictly necessary since processes are reconstructed on reset,
        // but we expose the method so scheduler.js can call it without error.
    },

    onArrival: (readyQueue, arrivingProcesses) => {
        arrivingProcesses.forEach(p => {
            if (!p.mlfqLevel) p.mlfqLevel = 1; // Everyone starts at top level
        });
        
        arrivingProcesses.sort((a, b) => a.pid.localeCompare(b.pid, undefined, { numeric: true }));
        readyQueue.push(...arrivingProcesses);
    },

    scheduleNext: function(context) {
        let { readyQueue, currentProcess, currentQuantumSlice } = context;

        if (currentProcess && currentProcess.remainingTime > 0) {
            currentQuantumSlice++;
            let shouldPreempt = false;
            let currentQ = (currentProcess.mlfqLevel === 1) ? this.q1 : ((currentProcess.mlfqLevel === 2) ? this.q2 : Infinity);

            // Are there processes waiting in a higher priority level?
            const hasHigher = readyQueue.some(p => p.mlfqLevel < currentProcess.mlfqLevel);
            
            if (hasHigher) {
                shouldPreempt = true;
            } else if (currentProcess.mlfqLevel < 3 && currentQuantumSlice >= currentQ) {
                // Demote if not in bottom queue and used full quantum
                currentProcess.mlfqLevel++;
                shouldPreempt = true;
            } else if (currentProcess.mlfqLevel === 3 && currentQuantumSlice >= currentQ && currentQ !== Infinity) {
                // Bottom is FCFS, so we don't preempt on quantum 
                // UNLESS someone requested it. By standard definitions, level 3 is FCFS.
            }

            if (shouldPreempt) {
                readyQueue.push(currentProcess);
                currentProcess = null;
                currentQuantumSlice = 0;
            } else {
                return { nextProcess: currentProcess, readyQueue, currentQuantumSlice };
            }
        }

        if (!currentProcess && readyQueue.length > 0) {
            readyQueue.sort((a, b) => {
                if (a.mlfqLevel === b.mlfqLevel) {
                    return a.arrivalTime - b.arrivalTime;
                }
                return a.mlfqLevel - b.mlfqLevel;
            });
            currentProcess = readyQueue.shift();
            currentQuantumSlice = 0;
        }

        return { nextProcess: currentProcess || null, readyQueue, currentQuantumSlice };
    }
};
