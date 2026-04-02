/**
 * scheduler.js
 * Central simulation tick coordinator
 */

export class Scheduler {
    constructor(processManager, readyQueueVisualizer, ganttChart, metrics) {
        this.processManager = processManager;
        this.readyQueueVisualizer = readyQueueVisualizer;
        this.ganttChart = ganttChart;
        this.metrics = metrics;

        this.currentTime = 0;
        this.readyQueue = [];
        this.completedProcesses = [];
        this.executionHistory = [];

        this.currentProcess = null;
        this.algorithm = null;
        this.isFinished = false;

        this.quantum = 2;
        this.currentQuantumSlice = 0;

        // Speed mapping per requirements
        this.speedMap = {
            0: 1000,  // Slow
            1: 500,   // Normal
            2: 150,   // Fast
            3: 0      // Instant
        };
        this.speedSetting = 1; // Default Normal
    }

    setAlgorithm(algorithmModule, quantum = 2) {
        this.algorithm = algorithmModule;
        this.quantum = quantum;

        if (this.algorithm._reset) this.algorithm._reset();
        
        if (this.algorithm.setQuantums) {
            const q1 = parseInt(document.getElementById('mlfq-q1')?.value) || 2;
            const q2 = parseInt(document.getElementById('mlfq-q2')?.value) || 4;
            this.algorithm.setQuantums(q1, q2);
        }
    }

    setSpeed(speedIndex) {
        this.speedSetting = parseInt(speedIndex, 10);
    }

    getTickInterval() {
        return this.speedMap[this.speedSetting] ?? 500;
    }

    reset() {
        this.currentTime = 0;
        this.readyQueue = [];
        this.completedProcesses = [];
        this.executionHistory = [];
        this.currentProcess = null;
        this.isFinished = false;
        this.currentQuantumSlice = 0;

        const procs = this.processManager.getProcesses();
        procs.forEach(p => {
            p.status = 'Waiting';
            p.remainingTime = p.burstTime;
            p.startTime = -1;
            p.completionTime = 0;
            p.turnaroundTime = 0;
            p.waitingTime = 0;
            p.responseTime = -1;
            if(p.mlfqLevel) p.mlfqLevel = undefined;
            if(p.queueLevel) p.queueLevel = undefined;
        });

        if (this.algorithm && this.algorithm._reset) {
            this.algorithm._reset();
        }

        this.ganttChart.reset();
        this.readyQueueVisualizer.render([], null);
        this.metrics.reset();

        document.getElementById('current-time-display').textContent = '0';
    }

    step() {
        if (this.isFinished) return;

        const allProcesses = this.processManager.getProcesses();
        if (allProcesses.length === 0) return;

        // Collect arrivals at this time unit
        const arriving = allProcesses.filter(
            p => p.arrivalTime === this.currentTime && p.status === 'Waiting'
        );

        if (arriving.length > 0) {
            arriving.forEach(p => { p.status = 'Ready'; });
            if (this.algorithm.onArrival) {
                this.algorithm.onArrival(this.readyQueue, arriving);
            } else {
                this.readyQueue.push(...arriving);
            }
        }

        const context = {
            currentTime: this.currentTime,
            currentProcess: this.currentProcess,
            readyQueue: this.readyQueue,
            quantum: this.quantum,
            currentQuantumSlice: this.currentQuantumSlice,
            allProcesses: allProcesses,
            completedProcesses: this.completedProcesses
        };

        const decision = this.algorithm.scheduleNext(context);

        this.currentProcess = decision.nextProcess;
        this.readyQueue = decision.readyQueue;
        this.currentQuantumSlice = decision.currentQuantumSlice;

        if (this.currentProcess) {
            if (this.currentProcess.startTime === -1) {
                this.currentProcess.startTime = this.currentTime;
                this.currentProcess.responseTime = this.currentTime - this.currentProcess.arrivalTime;
            }

            this.currentProcess.status = 'Running';

            this.readyQueue.forEach(p => {
                if (p.status !== 'Completed') p.status = 'Ready';
            });

            this.currentProcess.remainingTime--;
            this.addToHistory(this.currentProcess.pid);

            if (this.currentProcess.remainingTime === 0) {
                this.currentProcess.status = 'Completed';
                this.currentProcess.completionTime = this.currentTime + 1;
                this.currentProcess.turnaroundTime = this.currentProcess.completionTime - this.currentProcess.arrivalTime;
                this.currentProcess.waitingTime = this.currentProcess.turnaroundTime - this.currentProcess.burstTime;

                this.completedProcesses.push(this.currentProcess);

                if (this.algorithm.onProcessComplete) {
                    this.algorithm.onProcessComplete(this.currentProcess);
                }

                this.currentProcess = null;
                this.currentQuantumSlice = 0;
            }
        } else {
            this.addToHistory('IDLE');
        }

        this.currentTime++;

        document.getElementById('current-time-display').textContent = this.currentTime;
        this.readyQueueVisualizer.render(this.readyQueue, this.currentProcess);
        this.ganttChart.render(this.executionHistory, this.currentTime);

        if (this.completedProcesses.length === allProcesses.length) {
            this.isFinished = true;
            this.metrics.calculateAndUpdate(this.completedProcesses, this.currentTime, this.executionHistory);
        }
    }

    addToHistory(pid) {
        if (this.executionHistory.length === 0) {
            this.executionHistory.push({
                pid, startTime: this.currentTime, endTime: this.currentTime + 1
            });
            return;
        }

        const lastBlock = this.executionHistory[this.executionHistory.length - 1];
        if (lastBlock.pid === pid) {
            lastBlock.endTime = this.currentTime + 1;
        } else {
            this.executionHistory.push({
                pid, startTime: this.currentTime, endTime: this.currentTime + 1
            });
        }
    }

    runAll() {
        while (!this.isFinished) {
            this.step();
        }
        return {
            history: this.executionHistory,
            completed: this.completedProcesses,
            totalTime: this.currentTime
        };
    }

    getResults() {
        if (this.completedProcesses.length === 0) return null;
        return this.metrics.calculateAndUpdate(
            this.completedProcesses,
            this.currentTime,
            this.executionHistory
        );
    }
}
