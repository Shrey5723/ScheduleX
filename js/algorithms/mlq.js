/**
 * mlq.js
 * Multi-Level Queue scheduling algorithm
 * Level 1: System (RR) - Priority 1-3
 * Level 2: Interactive (RR) - Priority 4-7
 * Level 3: Batch (FCFS) - Priority 8-10
 */

export const MLQ = {
    name: "Multi-Level Queue",

    onArrival: (readyQueue, arrivingProcesses) => {
        arrivingProcesses.forEach(p => {
            if (p.priority <= 3) p.queueLevel = 1;
            else if (p.priority <= 7) p.queueLevel = 2;
            else p.queueLevel = 3;
        });
        
        arrivingProcesses.sort((a, b) => a.pid.localeCompare(b.pid, undefined, { numeric: true }));
        readyQueue.push(...arrivingProcesses);
    },

    scheduleNext: (context) => {
        let { readyQueue, currentProcess, quantum, currentQuantumSlice } = context;

        if (currentProcess && currentProcess.remainingTime > 0) {
            currentQuantumSlice++;
            let shouldPreempt = false;
            
            // Check for processes in higher priority queues
            const hasHigher = readyQueue.some(p => p.queueLevel < currentProcess.queueLevel);
            if (hasHigher) {
                shouldPreempt = true;
            } else if (currentProcess.queueLevel === 1 || currentProcess.queueLevel === 2) {
                // RR queues preempt on quantum expiration
                if (currentQuantumSlice >= quantum) {
                    shouldPreempt = true;
                }
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
            // Pick process from highest priority queue (lowest queueLevel)
            readyQueue.sort((a, b) => {
                if (a.queueLevel === b.queueLevel) {
                    return a.arrivalTime - b.arrivalTime;
                }
                return a.queueLevel - b.queueLevel;
            });
            currentProcess = readyQueue.shift();
            currentQuantumSlice = 0;
        }

        return { nextProcess: currentProcess || null, readyQueue, currentQuantumSlice };
    }
};
