/**
 * priorityPreemptive.js
 * Priority Preemptive scheduling algorithm
 * Lower number = higher priority
 */

export const PriorityPreemptive = {
    name: "Priority (Preemptive)",

    onArrival: (readyQueue, arrivingProcesses) => {
        // Simply enqueue new processes
        readyQueue.push(...arrivingProcesses);
    },

    scheduleNext: (context) => {
        let { readyQueue, currentProcess } = context;

        let bestProcess = currentProcess;

        // 🔍 Step 1: Find highest priority process (linear scan)
        for (let p of readyQueue) {
            if (
                !bestProcess ||
                p.priority < bestProcess.priority ||
                (
                    p.priority === bestProcess.priority &&
                    (
                        p.arrivalTime < bestProcess.arrivalTime ||
                        (
                            p.arrivalTime === bestProcess.arrivalTime &&
                            p.pid.localeCompare(bestProcess.pid, undefined, { numeric: true }) < 0
                        )
                    )
                )
            ) {
                bestProcess = p;
            }
        }

        // 🚫 No process available
        if (!bestProcess) {
            return { nextProcess: null, readyQueue, currentQuantumSlice: 0 };
        }

        // ✅ Step 2: If continuing same process (no preemption)
        if (currentProcess && bestProcess === currentProcess) {
            return { nextProcess: currentProcess, readyQueue, currentQuantumSlice: 0 };
        }

        // 🔄 Step 3: Preemption or first selection

        // Remove bestProcess from readyQueue
        readyQueue = readyQueue.filter(p => p !== bestProcess);

        // Put current process back into queue (if it exists and not finished)
        if (currentProcess && currentProcess.remainingTime > 0) {
            readyQueue.push(currentProcess);
        }

        return { nextProcess: bestProcess, readyQueue, currentQuantumSlice: 0 };
    }
};