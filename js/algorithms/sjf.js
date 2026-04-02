/**
 * sjf.js
 * Shortest Job First scheduling algorithm (Non-preemptive)
 */

export const SJF = {
    name: "Shortest Job First (Non-Preemptive)",

    onArrival: (readyQueue, arrivingProcesses) => {
        readyQueue.push(...arrivingProcesses);
        // We defer sorting to scheduleNext or we can sort here.
        // It's non-preemptive, so sorting here or in scheduleNext is fine.
    },

    scheduleNext: (context) => {
        let { readyQueue, currentProcess } = context;

        // Non-preemptive: if a process is already running, continue until completion
        if (currentProcess && currentProcess.remainingTime > 0) {
            return { nextProcess: currentProcess, readyQueue, currentQuantumSlice: 0 };
        }

        // If CPU is free, pick the shortest job
        if (readyQueue.length > 0) {
            // Sort by burstTime. Tie-breaker is arrivalTime, then PID.
            readyQueue.sort((a, b) => {
                if (a.burstTime === b.burstTime) {
                    if (a.arrivalTime === b.arrivalTime) {
                        return a.pid.localeCompare(b.pid, undefined, { numeric: true });
                    }
                    return a.arrivalTime - b.arrivalTime;
                }
                return a.burstTime - b.burstTime;
            });

            const nextProcess = readyQueue.shift();
            return { nextProcess, readyQueue, currentQuantumSlice: 0 };
        }

        // Idle
        return { nextProcess: null, readyQueue, currentQuantumSlice: 0 };
    }
};
