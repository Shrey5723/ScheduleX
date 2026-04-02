/**
 * priorityPreemptive.js
 * Priority Preemptive scheduling algorithm
 * Lower number = higher priority
 */

export const PriorityPreemptive = {
    name: "Priority (Preemptive)",
    
    onArrival: (readyQueue, arrivingProcesses) => {
        readyQueue.push(...arrivingProcesses);
    },

    scheduleNext: (context) => {
        let { readyQueue, currentProcess } = context;

        let allAvailable = [...readyQueue];
        if (currentProcess && currentProcess.remainingTime > 0) {
            allAvailable.push(currentProcess);
        }

        if (allAvailable.length > 0) {
            allAvailable.sort((a, b) => {
                if (a.priority === b.priority) {
                    if (a.arrivalTime === b.arrivalTime) {
                        return a.pid.localeCompare(b.pid, undefined, { numeric: true });
                    }
                    return a.arrivalTime - b.arrivalTime;
                }
                return a.priority - b.priority;
            });
            const nextProcess = allAvailable[0];
            
            readyQueue = allAvailable.filter(p => p !== nextProcess);
            return { nextProcess, readyQueue, currentQuantumSlice: 0 };
        }

        return { nextProcess: null, readyQueue, currentQuantumSlice: 0 };
    }
};
