/**
 * comparison.js
 * Maintains history of algorithm results and exposes CSV export
 */

export class Comparison {
    constructor(tableBodyId) {
        this.tableBody = document.getElementById(tableBodyId);
        
        // Ensure comparison table headers match the new metrics
        const thead = this.tableBody.previousElementSibling;
        thead.innerHTML = `
            <tr>
                <th>Algo</th>
                <th>Wait</th>
                <th>Turn</th>
                <th>Resp</th>
                <th>Util</th>
                <th>Thru</th>
            </tr>
        `;
        this.history = [];
    }

    addResult(algoName, metrics) {
        this.history.push({
            algo: algoName,
            wait: parseFloat(metrics.avgWait),
            turn: parseFloat(metrics.avgTurnaround),
            resp: parseFloat(metrics.avgResponse),
            util: parseFloat(metrics.cpuUtil),
            thru: parseFloat(metrics.throughput)
        });
        this.render();
    }

    clear() {
        this.history = [];
        this.render();
    }

    render() {
        this.tableBody.innerHTML = '';
        if (this.history.length === 0) return;

        // Find best values
        const minWait = Math.min(...this.history.map(h => h.wait));
        const minTurn = Math.min(...this.history.map(h => h.turn));
        const minResp = Math.min(...this.history.map(h => h.resp));
        const maxUtil = Math.max(...this.history.map(h => h.util));
        const maxThru = Math.max(...this.history.map(h => h.thru));

        this.history.forEach(h => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td style="font-weight: 500; font-size: 0.75rem;">${h.algo}</td>
                <td class="${h.wait === minWait ? 'highlight-best' : ''}">${h.wait.toFixed(2)}</td>
                <td class="${h.turn === minTurn ? 'highlight-best' : ''}">${h.turn.toFixed(2)}</td>
                <td class="${h.resp === minResp ? 'highlight-best' : ''}">${h.resp.toFixed(2)}</td>
                <td class="${h.util === maxUtil ? 'highlight-best' : ''}">${h.util.toFixed(1)}%</td>
                <td class="${h.thru === maxThru ? 'highlight-best' : ''}">${h.thru.toFixed(3)}</td>
            `;
            this.tableBody.appendChild(tr);
        });
    }

    exportCSV() {
        if (this.history.length === 0) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Algorithm,Avg Wait,Avg Turnaround,Avg Response,CPU Util (%),Throughput\n";
        
        this.history.forEach(h => {
            csvContent += `"${h.algo}",${h.wait.toFixed(2)},${h.turn.toFixed(2)},${h.resp.toFixed(2)},${h.util.toFixed(1)},${h.thru.toFixed(3)}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "algorithm_comparison.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
