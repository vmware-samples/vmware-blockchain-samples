/*-
 * #%L
 * ERC-20 Load Testing Tool
 * %%
 * Copyright (C) 2021 VMware
 * %%
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * #L%
 */
function LoadProgress() {

  this.source = null;

  this.start = function () {

    this.source = new EventSource("/test/progress");

    this.source.addEventListener("message", function (event) {

      // These events are JSON, so parsing and DOM fiddling are needed
      const progress = JSON.parse(event.data);
      updateChart(progress);
      updateReport(progress);

      // Stop updates once the test is done.
      if (progress.txPending <= 0) {
        stop();
        console.log("Test completed")
      }
    });

    this.source.onerror = function () {
      this.close();
    }
  }

  this.stop = function () {
    this.source.close();
  }

}

function updateChart(progress) {
  config.data.labels.push(new Date());
  config.data.datasets[0].data.push(progress.averageThroughput);
  config.data.datasets[1].data.push(progress.averageLatency);
  chart.update();
}

function updateReport(progress) {
  const update = (id, rowIndex, value) => {
    document.getElementById(
      id).rows[rowIndex].cells[1].innerHTML = value;
  };

  // 0 - Load Factor
  // 1 - Batch Size
  update("test", 2, progress.elapsedTime);
  update("test", 3, progress.remainingTime);

  // 0 - Total Transactions
  update("transactions", 1, progress.txStatus);
  update("transactions", 2, progress.txErrors);
  update("transactions", 3, progress.readStatus);
  update("transactions", 4, progress.readErrors);
  update("transactions", 5, progress.txPending);

  if (progress.receiptMode === 'DEFERRED') {
    update("receipts", 0, progress.receiptStatus);
    update("receipts", 1, progress.receiptErrors);
  }

  update("metrics", 0, progress.averageThroughput);
  update("metrics", 1, progress.averageLatency);
  update("metrics", 2, progress.averageReadThroughput);
  update("metrics", 3, progress.averageReadLatency);
  update("metrics", 4, progress.activeConnections);
  update("metrics", 5, progress.idleConnections);
}

progress = new LoadProgress();

/*
 * Register callbacks for starting and stopping the SSE controller.
 */
window.onload = function () {
  progress.start();
  console.log("Progress started")
}

window.onbeforeunload = function () {
  progress.stop();
  console.log("Progress stopped")
}
