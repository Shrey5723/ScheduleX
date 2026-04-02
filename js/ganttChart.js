/**
 * ganttChart.js
 * Enhanced Gantt Chart with zoom, tooltips, and persistent colors
 */

const PALETTE = [
    '#2563EB', '#16A34A', '#D97706', '#DC2626', '#7C3AED', 
    '#0891B2', '#EA580C', '#DB2777', '#0D9488', '#65A30D'
];

export class GanttChart {
    constructor(containerId, timelineId, tooltipId) {
        this.container = document.getElementById(containerId);
        this.timeline = document.getElementById(timelineId);
        this.tooltip = document.getElementById(tooltipId);
        
        // Inject Zoom controls into the header
        const header = this.container.parentElement.previousElementSibling;
        if(header && header.classList.contains('section-title')) {
            const controls = document.createElement('div');
            controls.style.display = 'inline-flex';
            controls.style.gap = '8px';
            controls.style.marginLeft = '16px';
            controls.style.verticalAlign = 'middle';
            controls.style.float = 'right';
            
            const btnIn = document.createElement('button');
            btnIn.className = 'btn btn-secondary btn-icon';
            btnIn.style.padding = '2px 8px';
            btnIn.style.fontSize = '0.75rem';
            btnIn.textContent = 'Zoom +';
            btnIn.onclick = () => this.zoom(1.2);
            
            const btnOut = document.createElement('button');
            btnOut.className = 'btn btn-secondary btn-icon';
            btnOut.style.padding = '2px 8px';
            btnOut.style.fontSize = '0.75rem';
            btnOut.textContent = 'Zoom -';
            btnOut.onclick = () => this.zoom(1/1.2);
            
            controls.appendChild(btnOut);
            controls.appendChild(btnIn);
            header.appendChild(controls);
        }

        this.scale = 30; // base width for 1 unit of time in px
        this.history = [];
        this.currentTime = 0;

        // Tooltip logic
        this.container.addEventListener('mousemove', (e) => {
            if (e.target.classList.contains('gantt-block')) {
                const pid = e.target.dataset.pid;
                const start = e.target.dataset.start;
                const end = e.target.dataset.end;
                
                if (pid === 'IDLE') return;

                this.tooltip.innerHTML = `<strong>PID:</strong> ${pid}\n<strong>Start:</strong> ${start}\n<strong>End:</strong> ${end}\n<strong>Duration:</strong> ${end - start}`;
                this.tooltip.style.opacity = '1';
                
                const rect = e.target.getBoundingClientRect();
                this.tooltip.style.left = rect.left + (rect.width / 2) + 'px';
                this.tooltip.style.top = rect.top + 'px';
            }
        });
        
        this.container.addEventListener('mouseleave', () => {
            this.tooltip.style.opacity = '0';
        });
        this.container.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('gantt-block')) {
                this.tooltip.style.opacity = '0';
            }
        });
    }

    getColorForPid(pid) {
        if (pid === 'IDLE') return null;
        let hash = 0;
        for (let i = 0; i < pid.length; i++) {
            hash = pid.charCodeAt(i) + ((hash << 5) - hash);
        }
        return PALETTE[Math.abs(hash) % PALETTE.length];
    }

    zoom(factor) {
        this.scale *= factor;
        if (this.scale < 10) this.scale = 10;
        if (this.scale > 100) this.scale = 100;
        this.render(this.history, this.currentTime);
    }

    reset() {
        this.container.innerHTML = '';
        this.timeline.innerHTML = '';
        this.history = [];
        this.currentTime = 0;
    }

    render(executionHistory, currentTime) {
        this.history = executionHistory;
        this.currentTime = currentTime;
        
        this.container.innerHTML = '';
        this.timeline.innerHTML = '';

        if (!executionHistory || executionHistory.length === 0) {
            return;
        }

        let containerWidth = 0;
        
        executionHistory.forEach(block => {
            const duration = block.endTime - block.startTime;
            const blockWidth = duration * this.scale;
            containerWidth += blockWidth;

            const div = document.createElement('div');
            div.className = 'gantt-block';
            div.style.width = blockWidth + 'px';
            div.dataset.pid = block.pid;
            div.dataset.start = block.startTime;
            div.dataset.end = block.endTime;

            if (block.pid === 'IDLE') {
                div.classList.add('idle');
                div.textContent = 'IDLE';
            } else {
                div.style.backgroundColor = this.getColorForPid(block.pid);
                // Only show text if block is wide enough
                if (blockWidth > 24) {
                    div.textContent = block.pid;
                }
            }

            this.container.appendChild(div);
        });

        // Generate timeline ticks for every unit
        for (let t = 0; t <= currentTime; t++) {
            const tick = document.createElement('div');
            tick.className = 'tick-mark';
            tick.textContent = t;
            tick.style.left = (t * this.scale) + 'px';
            this.timeline.appendChild(tick);
        }
        
        this.container.style.width = containerWidth + 'px';
        this.timeline.style.width = containerWidth + 'px';
        
        // Auto scroll wrapper to the far right to track simulation tip
        const wrapper = this.container.parentElement;
        wrapper.scrollLeft = wrapper.scrollWidth;
    }
}
