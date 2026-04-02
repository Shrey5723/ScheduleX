/**
 * metrics.js
 * Calculates average metrics and populates per-process breakdown table
 */

export class Metrics {
    constructor() {
        this.avgWaitEl = document.getElementById('metric-avg-wait');
        this.avgTurnaroundEl = document.getElementById('metric-avg-turnaround');
        this.avgResponseEl = document.getElementById('metric-avg-response');
        this.throughputEl = document.getElementById('metric-throughput');
        this.cpuUtilEl = document.getElementById('metric-cpu-util');
        this.tableBody = document.getElementById('breakdown-table-body');
    }

    reset() {
        this.avgWaitEl.textContent = '0.0';
        this.avgTurnaroundEl.textContent = '0.0';
        this.avgResponseEl.textContent = '0.0';
        this.throughputEl.textContent = '0.0';
        this.cpuUtilEl.textContent = '0.0%';
        this.tableBody.innerHTML = '';
    }

    calculateAndUpdate(processes, totalTime, executionHistory) {
        if (!processes || processes.length === 0) return null;

        let totalWait = 0;
        let totalTurnaround = 0;
        let totalResponse = 0;
        
        let idleTime = 0;
        if(executionHistory) {
            executionHistory.forEach(block => {
                if (block.pid === 'IDLE') {
                    idleTime += (block.endTime - block.startTime);
                }
            });
        }
        
        const activeTime = totalTime - idleTime;
        const cpuUtil = totalTime > 0 ? (activeTime / totalTime) * 100 : 0;
        const throughput = totalTime > 0 ? (processes.length / totalTime) : 0;

        this.tableBody.innerHTML = '';
        
        const sorted = [...processes].sort((a,b) => a.pid.localeCompare(b.pid, undefined, { numeric: true }));

        sorted.forEach(p => {
            totalWait += p.waitingTime;
            totalTurnaround += p.turnaroundTime;
            totalResponse += p.responseTime;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="font-mono" style="font-weight: 600">${p.pid}</td>
                <td>${p.arrivalTime}</td>
                <td>${p.burstTime}</td>
                <td>${p.startTime}</td>
                <td>${p.completionTime}</td>
                <td>${p.waitingTime}</td>
                <td>${p.turnaroundTime}</td>
                <td>${p.responseTime}</td>
            `;
            this.tableBody.appendChild(tr);
        });

        const avgWait = totalWait / processes.length;
        const avgTurnaround = totalTurnaround / processes.length;
        const avgResponse = totalResponse / processes.length;

        this.avgWaitEl.textContent = avgWait.toFixed(2);
        this.avgTurnaroundEl.textContent = avgTurnaround.toFixed(2);
        this.avgResponseEl.textContent = avgResponse.toFixed(2);
        this.throughputEl.textContent = throughput.toFixed(3);
        this.cpuUtilEl.textContent = cpuUtil.toFixed(1) + '%';

        return {
            avgWait: avgWait.toFixed(2),
            avgTurnaround: avgTurnaround.toFixed(2),
            avgResponse: avgResponse.toFixed(2),
            throughput: throughput.toFixed(3),
            cpuUtil: cpuUtil.toFixed(1)
        };
    }
}
