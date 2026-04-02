# ScheduleX — CPU Scheduling Simulator

**ScheduleX** is a highly interactive, beautifully designed CPU scheduling algorithm simulator. Built entirely in vanilla HTML, CSS, and ES6 JavaScript, it demonstrates how Operating System scheduling mechanisms manage processes and allocate CPU time.

The application features a deeply refined, premium UI, employing a strict 3-column resizable dashboard layout, subtle shadow/border topologies, and meticulously crafted typography.

---

## 🧐 What is this project doing?

An Operating System's CPU Scheduler dictates which process in the "Ready Queue" is given access to the CPU at any given moment. This project simulates that entire lifecycle.

Users inject customizable "Processes" (defined by their Arrival Time, Burst Time, and Priority) into the environment. The simulator then advances an internal clock (T=0, 1, 2...) either instantly or via animated ticks. At each tick, the selected **Scheduling Algorithm** makes mathematically rigorous decisions on whether to keep the current process running or preempt it in favor of another process.

The application tracks every outcome and mathematically computes critical OS metrics:
* **Wait Time**: Total time a process spent in the Ready Queue.
* **Turnaround Time**: Total time from arrival to completion.
* **Response Time**: Time from arrival until the CPU first begins executing the process.
* **Throughput**: Processes completed per unit of time.
* **CPU Utilization**: Percentage of time the CPU was actively executing processes.

---

## 🛠️ How it works (Under the Hood)

ScheduleX avoids heavy frameworks, relying entirely on a native **ES6 Module Architecture** coupled with an event-driven DOM interface. 

The core of the simulation relies on a simple State Machine handled by a centralized `Scheduler` class.

### The Simulation Loop
When a simulation is executed, the `Scheduler` runs an internal `setInterval` loop depending on the user's selected playback speed.
During every **Tick**:
1. Check the `ProcessManager` for any completely new processes arriving at this exact moment `T`.
2. Push new arrivals into the `readyQueue`.
3. Pass the current context (`readyQueue`, `currentProcess`, `currentTime`) into the active Algorithm module.
4. The requested Algorithm executes its specific logic (e.g. "Sort by Burst Time" for SJF, or "Demote to Q2" for MLFQ) and returns the process that *should* run.
5. The `Scheduler` mathematically increments process burst execution, validates if they finish, and pushes a visual block to the Gantt Chart History.
6. The UI (`main.js`) listens to these updates and re-renders the Live Ready Queue chips and incrementing metrics in real-time.

---

## 🗂️ What Files Do What?

The codebase relies strictly on isolated module concerns.

### Presentation Layer
* **`index.html`**: The main structural application shell. Contains the 100vh app-layout, the left/center/right `.sidebar` panels, and hardcoded SVGs.
* **`css/style.css`**: Global stylesheet defining the visual aesthetic framework relying entirely on CSS Custom Properties (`:root` variables) for exact metric spacing and semantic colors.

### Application Logic Core (`/js/`)
* **`main.js`**: The central application bootstrap. This file binds all button clicks, slider inputs, and window resize hooks to the UI components.
* **`processManager.js`**: A state container that adds, deletes, validates, and exports the master list of Process objects from the system. Built to safely parse JSON imports.
* **`scheduler.js`**: The highly vital central "Tick" orchestrator. Holds the core simulation loop described above, tracking `currentTime`, generating the history arrays, and dispatching render commands.
* **`ganttChart.js` & `readyQueue.js`**: Pure UI-rendering classes mapping internal engine data structures into raw DOM HTML layouts representing the timeline blocks and floating status chips.
* **`metrics.js` & `comparison.js`**: Analytical modules calculating end-of-sim math across all processes, plotting it cleanly into tabular elements, and exporting CSV reports.

### The Algorithm Engine (`/js/algorithms/`)
Each file exports a deterministic JS object adhering strictly to the internal API (exposing `name`, `onArrival`, and `scheduleNext` interface functions).
* **`fcfs.js`**: *First Come First Serve* — Pushes directly into the queue sequentially.
* **`sjf.js`**: *Shortest Job First* — Prioritizes minimum burst configurations (Non-Preemptive).
* **`srtf.js`**: *Shortest Remaining Time First* — Preemptive variant of SJF prioritizing burst times dynamically per tick.
* **`roundRobin.js`**: *Round Robin* — Enforces a strict time quantum slice sequence array rotation.
* **`priority.js` & `priorityPreemptive.js`**: Prioritizes jobs explicitly by defined integer metrics (both strict and preemption modes).
* **`mlq.js`**: *Multi-Level Queue* — Distributes processes blindly across 3 predefined priority queues without movement between them.
* **`mlfq.js`**: *Multi-Level Feedback Queue* — A sophisticated hierarchical priority queue structure that actively demotes processes eating too much CPU time downwards to background arrays.

---

## 🚀 How to Run locally

Due to CORS security policies on ES6 modules over standard local double-click `file://` execution, you must run this over a lightweight static web server.

```bash
# Navigate to the project directory
cd OS

# Start a static Python 3 HTTP Server
python3 -m http.server 8080
```
Then, open up [http://localhost:8080/index.html](http://localhost:8080/index.html) in your browser.
