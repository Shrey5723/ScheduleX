/**
 * processManager.js
 * Manage JSON import/export, data presets, and inline validations
 */

export class ProcessManager {
    constructor() {
        this.processes = [];
        this.pidCounter = 1;

        // Built-in presets designed to best demonstrate each algorithm
        this.presets = {
            fcfs: [
                { pid: 'P1', arrivalTime: 0, burstTime: 8, priority: 1, status: 'Waiting' },
                { pid: 'P2', arrivalTime: 1, burstTime: 4, priority: 1, status: 'Waiting' },
                { pid: 'P3', arrivalTime: 2, burstTime: 9, priority: 1, status: 'Waiting' },
                { pid: 'P4', arrivalTime: 3, burstTime: 5, priority: 1, status: 'Waiting' }
            ],
            sjf: [
                { pid: 'P1', arrivalTime: 0, burstTime: 7, priority: 1, status: 'Waiting' },
                { pid: 'P2', arrivalTime: 2, burstTime: 4, priority: 1, status: 'Waiting' },
                { pid: 'P3', arrivalTime: 4, burstTime: 1, priority: 1, status: 'Waiting' },
                { pid: 'P4', arrivalTime: 5, burstTime: 4, priority: 1, status: 'Waiting' }
            ],
            srtf: [
                { pid: 'P1', arrivalTime: 0, burstTime: 8, priority: 1, status: 'Waiting' },
                { pid: 'P2', arrivalTime: 1, burstTime: 4, priority: 1, status: 'Waiting' },
                { pid: 'P3', arrivalTime: 2, burstTime: 2, priority: 1, status: 'Waiting' },
                { pid: 'P4', arrivalTime: 3, burstTime: 5, priority: 1, status: 'Waiting' }
            ],
            rr: [
                { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 1, status: 'Waiting' },
                { pid: 'P2', arrivalTime: 1, burstTime: 6, priority: 1, status: 'Waiting' },
                { pid: 'P3', arrivalTime: 2, burstTime: 3, priority: 1, status: 'Waiting' },
                { pid: 'P4', arrivalTime: 3, burstTime: 1, priority: 1, status: 'Waiting' },
                { pid: 'P5', arrivalTime: 4, burstTime: 5, priority: 1, status: 'Waiting' }
            ],
            priority: [
                { pid: 'P1', arrivalTime: 0, burstTime: 10, priority: 3, status: 'Waiting' },
                { pid: 'P2', arrivalTime: 1, burstTime: 1, priority: 1, status: 'Waiting' },
                { pid: 'P3', arrivalTime: 2, burstTime: 2, priority: 4, status: 'Waiting' },
                { pid: 'P4', arrivalTime: 3, burstTime: 1, priority: 5, status: 'Waiting' },
                { pid: 'P5', arrivalTime: 4, burstTime: 5, priority: 2, status: 'Waiting' }
            ],
            priorityPreemptive: [
                { pid: 'P1', arrivalTime: 0, burstTime: 6, priority: 4, status: 'Waiting' },
                { pid: 'P2', arrivalTime: 2, burstTime: 4, priority: 2, status: 'Waiting' },
                { pid: 'P3', arrivalTime: 3, burstTime: 2, priority: 1, status: 'Waiting' },
                { pid: 'P4', arrivalTime: 6, burstTime: 3, priority: 3, status: 'Waiting' }
            ],
            mlq: [
                { pid: 'P1', arrivalTime: 0, burstTime: 10, priority: 9, status: 'Waiting' }, // Level 3
                { pid: 'P2', arrivalTime: 2, burstTime: 5, priority: 5, status: 'Waiting' },  // Level 2 (preempts)
                { pid: 'P3', arrivalTime: 4, burstTime: 3, priority: 2, status: 'Waiting' },  // Level 1 (preempts)
                { pid: 'P4', arrivalTime: 5, burstTime: 2, priority: 1, status: 'Waiting' }   // Level 1
            ],
            mlfq: [
                { pid: 'P1', arrivalTime: 0, burstTime: 8, priority: 1, status: 'Waiting' },  // Will demote twice
                { pid: 'P2', arrivalTime: 1, burstTime: 5, priority: 1, status: 'Waiting' },  // Will demote once
                { pid: 'P3', arrivalTime: 5, burstTime: 2, priority: 1, status: 'Waiting' }   // Completes in first queue
            ]
        };
    }

    addProcess(pid, arrivalTime, burstTime, priority) {
        if (!pid) pid = 'P' + this.pidCounter++;
        
        if (this.processes.some(p => p.pid === pid)) {
            throw new Error(`Duplicate PID: ${pid}`);
        }
        if (burstTime < 1) throw new Error("Burst time must be \u2265 1");
        if (arrivalTime < 0) throw new Error("Arrival time must be \u2265 0");
        if (priority < 1 || priority > 10) throw new Error("Priority must be 1-10");

        this.processes.push({
            pid,
            arrivalTime: parseInt(arrivalTime, 10),
            burstTime: parseInt(burstTime, 10),
            priority: parseInt(priority, 10),
            status: 'Waiting',
            remainingTime: parseInt(burstTime, 10),
            startTime: -1,
            completionTime: 0,
            turnaroundTime: 0,
            waitingTime: 0,
            responseTime: -1
        });
    }

    deleteProcess(pid) {
        this.processes = this.processes.filter(p => p.pid !== pid);
    }

    getProcesses() {
        return this.processes;
    }

    loadPreset(name) {
        if (this.presets[name]) {
            this.processes = JSON.parse(JSON.stringify(this.presets[name]));
            this.processes.forEach(p => {
                p.remainingTime = p.burstTime;
                p.startTime = -1;
                p.completionTime = 0;
                p.turnaroundTime = 0;
                p.waitingTime = 0;
                p.responseTime = -1;
            });
            // Update counter past highest P#
            const maxP = Math.max(0, ...this.processes.map(p => {
                let m = p.pid.match(/^P(\\d+)$/i);
                return m ? parseInt(m[1]) : 0;
            }));
            this.pidCounter = maxP + 1;
            return true;
        }
        return false;
    }

    exportJSON() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.processes, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", "processes.json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    importJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (Array.isArray(data)) {
                this.processes = data;
                // normalize internal properties
                this.processes.forEach(p => {
                    p.remainingTime = p.burstTime;
                    p.status = 'Waiting';
                    p.startTime = -1;
                    p.completionTime = 0;
                    p.turnaroundTime = 0;
                    p.waitingTime = 0;
                    p.responseTime = -1;
                });
                return true;
            }
        } catch(e) {
            console.error("Invalid JSON", e);
        }
        return false;
    }

    renderTable(tbody) {
        tbody.innerHTML = '';
        if (this.processes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding: 16px;">No processes added</td></tr>';
            return;
        }

        const sorted = [...this.processes].sort((a,b) => a.arrivalTime - b.arrivalTime);

        sorted.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="font-mono" style="font-weight:600">${p.pid}</td>
                <td>${p.arrivalTime}</td>
                <td>${p.burstTime}</td>
                <td>${p.priority}</td>
                <td>
                    <button class="btn btn-danger btn-icon" style="padding: 2px 6px; font-size: 0.75rem;" onclick="window.deleteProcess('${p.pid}')">X</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}
