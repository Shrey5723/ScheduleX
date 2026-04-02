/**
 * fcfs.js
 * First Come First Serve scheduling algorithm
 */

export const FCFS = {
    name: "First Come First Serve",
    
    // When processes arrive, add them to the queue
    onArrival: (readyQueue, arrivingProcesses) => {
        // Tie-breaker for same arrival time is PID
        arrivingProcesses.sort((a, b) => {
            return a.pid.localeCompare(b.pid, undefined, { numeric: true, sensitivity: 'base' });
        });
        readyQueue.push(...arrivingProcesses);
    },

    // Decide which process to run next
    scheduleNext: (context) => {
        let { readyQueue, currentProcess } = context;

        // FCFS is non-preemptive. If a process is running, let it finish.
        if (currentProcess && currentProcess.remainingTime > 0) {
            return { nextProcess: currentProcess, readyQueue, currentQuantumSlice: 0 };
        }

        // If no process is running, take the first from the queue
        if (readyQueue.length > 0) {
            const nextProcess = readyQueue.shift();
            return { nextProcess, readyQueue, currentQuantumSlice: 0 };
        }

        // Idle
        return { nextProcess: null, readyQueue, currentQuantumSlice: 0 };
    }
};
