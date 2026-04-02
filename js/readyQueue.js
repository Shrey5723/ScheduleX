/**
 * readyQueue.js
 * Visualization of the Ready Queue using chips
 */

export class ReadyQueueVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render(readyQueue, currentProcess) {
        this.container.innerHTML = '';

        if (!currentProcess && (!readyQueue || readyQueue.length === 0)) {
            this.container.innerHTML = '<div class="text-muted" style="margin: auto; font-size: 0.875rem;">Queue is empty</div>';
            return;
        }

        // Render current process as a "Running" chip
        if (currentProcess && currentProcess.pid !== 'IDLE') {
            this.container.appendChild(this.createChip(currentProcess, 'Running'));
        }

        // Render waiting processes as "Ready" chips
        readyQueue.forEach(p => {
            this.container.appendChild(this.createChip(p, 'Ready'));
        });
    }

    createChip(process, status) {
        const chip = document.createElement('div');
        chip.className = `process-chip status-${status.toLowerCase()}`;
        
        const priorityHtml = typeof process.priority !== 'undefined' ? `<span title="Priority">P:${process.priority}</span>` : ``;

        chip.innerHTML = `
            <div class="chip-header">${process.pid}</div>
            <div class="chip-body">
                <span title="Remaining Burst Time">rem: ${process.remainingTime}</span>
                ${priorityHtml}
            </div>
        `;
        return chip;
    }
}
