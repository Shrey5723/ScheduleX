/**
 * main.js
 * Wires UI to the simulation logic and handles all user interactions
 */
import { ProcessManager } from './processManager.js';
import { GanttChart } from './ganttChart.js';
import { ReadyQueueVisualizer } from './readyQueue.js';
import { Metrics } from './metrics.js';
import { Comparison } from './comparison.js';
import { Scheduler } from './scheduler.js';

import { FCFS } from './algorithms/fcfs.js';
import { SJF } from './algorithms/sjf.js';
import { SRTF } from './algorithms/srtf.js';
import { RoundRobin } from './algorithms/roundRobin.js';
import { Priority } from './algorithms/priority.js';
import { PriorityPreemptive } from './algorithms/priorityPreemptive.js';
import { MLQ } from './algorithms/mlq.js';
import { MLFQ } from './algorithms/mlfq.js';

document.addEventListener('DOMContentLoaded', () => {
    const processManager = new ProcessManager();
    const ganttChart = new GanttChart('gantt-container', 'gantt-timeline', 'gantt-tooltip');
    const readyQueueVis = new ReadyQueueVisualizer('ready-queue-container');
    const metrics = new Metrics();
    const comparison = new Comparison('comparison-table-body');
    const scheduler = new Scheduler(processManager, readyQueueVis, ganttChart, metrics);

    processManager.renderTable(document.getElementById('process-table-body'));

    const algoMap = {
        fcfs: FCFS,
        sjf: SJF,
        srtf: SRTF,
        rr: RoundRobin,
        priority: Priority,
        priorityPreemptive: PriorityPreemptive,
        mlq: MLQ,
        mlfq: MLFQ
    };

    let timerInterval = null;

    const algoSelect = document.getElementById('algorithm-select');
    const quantumGroup = document.getElementById('quantum-group');
    const mlfqGroup = document.getElementById('mlfq-quantums-group');
    const timeQuantumInput = document.getElementById('time-quantum');
    
    algoSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'rr') {
            quantumGroup.classList.remove('d-none');
            mlfqGroup.classList.add('d-none');
        } else if (val === 'mlfq') {
            quantumGroup.classList.add('d-none');
            mlfqGroup.classList.remove('d-none');
        } else {
            quantumGroup.classList.add('d-none');
            mlfqGroup.classList.add('d-none');
        }
    });

    const btnAddProcess = document.getElementById('btn-add-process');
    const processError = document.getElementById('process-error');
    const procId = document.getElementById('proc-id');
    const procPriority = document.getElementById('proc-priority');
    const procArrival = document.getElementById('proc-arrival');
    const procBurst = document.getElementById('proc-burst');
    
    // Clear error styling on input
    [procId, procPriority, procArrival, procBurst].forEach(el => {
        el.addEventListener('input', () => {
            el.classList.remove('is-invalid');
            processError.classList.remove('visible');
        });
    });

    btnAddProcess.addEventListener('click', () => {
        const pid = procId.value.trim();
        const priority = parseInt(procPriority.value, 10);
        const arrival = parseInt(procArrival.value, 10);
        const burst = parseInt(procBurst.value, 10);

        try {
            processManager.addProcess(pid, arrival, burst, priority);
            processError.classList.remove('visible');
            processManager.renderTable(document.getElementById('process-table-body'));
            procId.value = ''; 
        } catch(err) {
            processError.textContent = err.message;
            processError.classList.add('visible');
            
            // Sub-field validation
            if(err.message.includes("Burst")) procBurst.classList.add('is-invalid');
            else if(err.message.includes("Arrival")) procArrival.classList.add('is-invalid');
            else if(err.message.includes("Priority")) procPriority.classList.add('is-invalid');
            else if(err.message.includes("PID")) procId.classList.add('is-invalid');
        }
    });

    window.deleteProcess = (pid) => {
        processManager.deleteProcess(pid);
        processManager.renderTable(document.getElementById('process-table-body'));
    };

    const presetDropdown = document.getElementById('preset-dropdown');
    presetDropdown.addEventListener('change', (e) => {
        if(e.target.value) {
            processManager.loadPreset(e.target.value);
            processManager.renderTable(document.getElementById('process-table-body'));
        }
    });

    document.getElementById('btn-import-json').addEventListener('click', () => {
        document.getElementById('file-import').click();
    });
    
    document.getElementById('file-import').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            if(processManager.importJSON(ev.target.result)) {
                processManager.renderTable(document.getElementById('process-table-body'));
                e.target.value = '';
            } else {
                alert("Invalid JSON format for processes");
            }
        };
        reader.readAsText(file);
    });

    document.getElementById('btn-export-json').addEventListener('click', () => processManager.exportJSON());
    document.getElementById('btn-export-csv').addEventListener('click', () => comparison.exportCSV());
    document.getElementById('btn-clear-history').addEventListener('click', () => comparison.clear());
    
    document.getElementById('btn-export-png').addEventListener('click', () => {
        const wrapper = document.querySelector('.gantt-wrapper');
        html2canvas(wrapper).then(canvas => {
            const link = document.createElement('a');
            link.download = 'gantt-chart.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    });

    const btnStart = document.getElementById('btn-start');
    const btnStep = document.getElementById('btn-step');
    const btnReset = document.getElementById('btn-reset');
    const speedSlider = document.getElementById('speed-slider');
    const speedLabel = document.getElementById('speed-label');
    const statusBadge = document.getElementById('sim-status-badge');

    const speedLabels = ['Slow', 'Normal', 'Fast', 'Instant'];
    
    speedSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        speedLabel.textContent = speedLabels[val];
        scheduler.setSpeed(val);

        if (timerInterval && val !== 3) {
            clearInterval(timerInterval);
            timerInterval = setInterval(runLoop, scheduler.getTickInterval());
        }
    });

    function finishSimulation() {
        if(timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        btnStart.disabled = false;
        btnStep.disabled = true;
        statusBadge.classList.add('d-none');
        
        const res = scheduler.getResults();
        if(res) comparison.addResult(scheduler.algorithm.name, res);
    }

    function runLoop() {
        if (scheduler.isFinished) {
            finishSimulation();
            return;
        }
        scheduler.step();
        if (scheduler.isFinished) {
            finishSimulation();
        }
    }

    btnStart.addEventListener('click', () => {
        if(processManager.getProcesses().length === 0) return;
        
        let q = parseInt(timeQuantumInput.value, 10) || 2;
        if ((algoSelect.value === 'rr' || algoSelect.value === 'mlfq') && q < 1) {
            timeQuantumInput.classList.add('is-invalid');
            quantumGroup.querySelector('.error-msg').classList.add('visible');
            return; // blocked
        }

        if (scheduler.currentTime === 0 || scheduler.isFinished) {
            scheduler.reset(); 
            scheduler.setAlgorithm(algoMap[algoSelect.value], q);
            scheduler.setSpeed(speedSlider.value);
        }
        
        btnStart.disabled = true;
        btnStep.disabled = false;
        statusBadge.classList.remove('d-none');
        statusBadge.textContent = 'Running...';
        statusBadge.className = 'badge badge-running'; 

        if (scheduler.speedSetting === 3) {
            scheduler.runAll();
            finishSimulation();
            statusBadge.textContent = 'Completed';
            statusBadge.className = 'badge badge-completed'; 
        } else {
            if(!timerInterval) {
                timerInterval = setInterval(runLoop, scheduler.getTickInterval());
            }
        }
    });

    btnStep.addEventListener('click', () => {
        if(processManager.getProcesses().length === 0) return;

        if(!timerInterval && scheduler.currentTime === 0) { 
            let q = parseInt(timeQuantumInput.value, 10) || 2;
            scheduler.setAlgorithm(algoMap[algoSelect.value], q);
        }
        
        if (timerInterval) { // Pause
            clearInterval(timerInterval);
            timerInterval = null;
            statusBadge.textContent = 'Paused';
            statusBadge.className = 'badge badge-waiting';
            btnStart.disabled = false; 
        } else {
            statusBadge.textContent = 'Stepping...';
            statusBadge.className = 'badge badge-ready';
        }

        scheduler.step();
        
        if(scheduler.isFinished) {
            finishSimulation();
            statusBadge.textContent = 'Completed';
            statusBadge.className = 'badge badge-completed';
            statusBadge.classList.remove('d-none');
        }
    });

    btnReset.addEventListener('click', () => {
        if(timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        scheduler.reset();
        
        algoSelect.dispatchEvent(new Event('change'));
        
        btnStart.disabled = false;
        btnStep.disabled = true;
        statusBadge.classList.add('d-none');
    });
});

// Appended: Resizable sidebars
document.querySelectorAll('.resize-handle').forEach(handle => {
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    const isLeft = handle.dataset.side === 'left';
    const sidebar = isLeft
      ? document.querySelector('.sidebar-left')
      : document.querySelector('.sidebar-right');
    const startX = e.clientX;
    const startW = sidebar.getBoundingClientRect().width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const move = ev => {
      const delta = isLeft ? ev.clientX - startX : startX - ev.clientX;
      const newW = Math.min(Math.max(startW + delta, 200), 480);
      sidebar.style.width = newW + 'px';
      sidebar.style.flex = 'none';
    };
    const up = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });
});

// Header wiring
const algoSelectHdr = document.getElementById('algorithm-select');
if (algoSelectHdr) {
  const updateHdrAlgo = () => {
    const el = document.getElementById('hdr-algo');
    if (el) el.textContent = algoSelectHdr.options[algoSelectHdr.selectedIndex]?.text || 'None';
  };
  algoSelectHdr.addEventListener('change', updateHdrAlgo);
  updateHdrAlgo();
}

// Sync hidden current-time-display with header
const observer = new MutationObserver(() => {
    const timeVal = document.getElementById('current-time-display')?.textContent || '0';
    const hdrTime = document.getElementById('hdr-time');
    if(hdrTime) hdrTime.textContent = `T = ${timeVal}`;
});
const timeEl = document.getElementById('current-time-display');
if(timeEl) {
    observer.observe(timeEl, { childList: true, characterData: true, subtree: true });
}

// Keep process count synced
setInterval(() => {
    const len = document.getElementById('process-table-body')?.children.length || 0;
    const procEl = document.getElementById('hdr-proc-count');
    if(procEl) procEl.textContent = `${len === 1 ? '1 process' : len + ' processes'}`;
}, 1000);
