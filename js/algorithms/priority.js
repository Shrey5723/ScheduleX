/**
 * priority.js
 * Priority scheduling algorithm (Non-preemptive)
 * Lower number = higher priority
 */

export const Priority = {
    name: "Priority (Non-Preemptive)",

    onArrival: (readyQueue, arrivingProcesses) => {
        readyQueue.push(...arrivingProcesses);
    },

    scheduleNext: (context) => {
        let { readyQueue, currentProcess } = context;

        // Non-preemptive
        if (currentProcess && currentProcess.remainingTime > 0) {
            return { nextProcess: currentProcess, readyQueue, currentQuantumSlice: 0 };
        }

        // CPU is free, pick highest priority (lowest number)
        if (readyQueue.length > 0) {
            readyQueue.sort((a, b) => {
                if (a.priority === b.priority) {
                    if (a.arrivalTime === b.arrivalTime) {
                        return a.pid.localeCompare(b.pid, undefined, { numeric: true });
                    }
                    return a.arrivalTime - b.arrivalTime;
                }
                return a.priority - b.priority;
            });

            const nextProcess = readyQueue.shift();
            return { nextProcess, readyQueue, currentQuantumSlice: 0 };
        }

        return { nextProcess: null, readyQueue, currentQuantumSlice: 0 };
    }
};
