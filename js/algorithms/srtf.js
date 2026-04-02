/**
 * srtf.js
 * Shortest Remaining Time First scheduling algorithm (Preemptive SJF)
 */

export const SRTF = {
    name: "Shortest Remaining Time First",
    
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
                if (a.remainingTime === b.remainingTime) {
                    if (a.arrivalTime === b.arrivalTime) {
                        return a.pid.localeCompare(b.pid, undefined, { numeric: true });
                    }
                    return a.arrivalTime - b.arrivalTime;
                }
                return a.remainingTime - b.remainingTime;
            });
            const nextProcess = allAvailable[0];
            
            // Filter out the selected process from the ready queue
            readyQueue = allAvailable.filter(p => p !== nextProcess);
            
            return { nextProcess, readyQueue, currentQuantumSlice: 0 };
        }

        return { nextProcess: null, readyQueue, currentQuantumSlice: 0 };
    }
};
