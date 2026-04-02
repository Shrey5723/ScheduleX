/**
 * roundRobin.js
 * Round Robin scheduling algorithm (Preemptive based on quantum)
 */

export const RoundRobin = {
    name: "Round Robin",

    onArrival: (readyQueue, arrivingProcesses) => {
        // Sort arriving by PID for consistency if multiple arrive same time
        arrivingProcesses.sort((a, b) => {
            return a.pid.localeCompare(b.pid, undefined, { numeric: true, sensitivity: 'base' });
        });
        readyQueue.push(...arrivingProcesses);
    },

    scheduleNext: (context) => {
        let { readyQueue, currentProcess, quantum, currentQuantumSlice } = context;

        // If a process is running
        if (currentProcess) {
            currentQuantumSlice++;
            
            // Check if process finished (caught in scheduler, but we double check)
            if (currentProcess.remainingTime > 0) {
                // Not finished. Check if quantum expired
                if (currentQuantumSlice >= quantum) {
                    // Preempt
                    readyQueue.push(currentProcess);
                    currentProcess = null;
                    currentQuantumSlice = 0;
                } else {
                    // Continue running
                    return { nextProcess: currentProcess, readyQueue, currentQuantumSlice };
                }
            } else {
                // Completed, already handled by scheduler usually, 
                // but if remaining time is 0, scheduler sets to null.
                currentProcess = null;
                currentQuantumSlice = 0;
            }
        }

        // If no process is running (either idle, or preempted/completed)
        if (!currentProcess) {
            if (readyQueue.length > 0) {
                currentProcess = readyQueue.shift();
                currentQuantumSlice = 0; // Starts a new slice
            }
        }

        return { nextProcess: currentProcess, readyQueue, currentQuantumSlice };
    }
};
