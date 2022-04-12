package com.vmware.ethereum.service;

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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.vmware.ethereum.config.TokenConfig;
import com.vmware.ethereum.config.Web3jConfig;
import com.vmware.ethereum.config.WorkloadConfig;
import com.vmware.ethereum.model.ProgressReport;
import com.vmware.ethereum.model.ReceiptMode;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.concurrent.CountDownLatch;

import static com.vmware.ethereum.config.WorkloadModel.OPEN;
import static com.vmware.ethereum.model.ReceiptMode.DEFERRED;
import static com.vmware.ethereum.model.ReceiptMode.IMMEDIATE;
import static java.time.Instant.now;
import static java.util.concurrent.TimeUnit.SECONDS;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkloadRunner {

  private final WorkloadConfig workloadConfig;
  private final TokenConfig tokenConfig;
  private final Web3jConfig web3jConfig;
  private final WorkloadCommand command;
  private final SecureTokenApi api;

  private final CountDownLatch countDownLatch;
  private final MetricsService metrics;
  private final ProgressService progress;
  private final ReceiptMode receiptMode;

  private final Web3j web3j;

  @Value("${server.port}")
  private int serverPort;

  /** Run the workload. */
  @SneakyThrows(InterruptedException.class)
  public void run() {
    WorkloadService workload = createWorkload();
    start(workload);
    countDownLatch.await();
    stop(workload);
  }

  /** Start the workload. */
  private void start(WorkloadService workload) {
    printBalance();
    metrics.setStartTime(now());
    metrics.setStartReadTime(now());
    workload.start();
  }

  /** Stop the workload. */
  @SneakyThrows(InterruptedException.class)
  private void stop(WorkloadService workload) {
    workload.stop();
    metrics.setEndTime(now());
    metrics.setEndTime(now());
    SECONDS.sleep(1);
    printReport();
    printBalance();
    log.info("Test is completed");
    saveReport();
    System.exit(0);
  }

  /** Create workload to run. */
  private WorkloadService createWorkload() {
    if (workloadConfig.getModel() == OPEN) {
      return new OpenWorkload(
          command, workloadConfig.getTransactions(), workloadConfig.getLoadFactor());
    }
    return new ClosedWorkload(
        command,
        workloadConfig.getTransactions(),
        workloadConfig.getLoadFactor(),
        api,
        web3j,
        workloadConfig);
  }

  /** Print token balance of the sender and the receiver. */
  private void printBalance() {
    log.info("Block number: {}", api.getBlockNumber());
    log.info("Sender has {} tokens", api.getSenderBalance());
    long[] recipientBalances = api.getRecipientBalance();
    for (int i = 0; i < tokenConfig.getRecipients().length; i++) {
      log.info("Recipient {} has {} tokens", i + 1, recipientBalances[i]);
    }
  }

  /** Print report */
  @SneakyThrows(InterruptedException.class)
  private void printReport() {
    log.info("Receipt polling: {}", receiptMode);

    log.info("{}:", receiptMode == IMMEDIATE ? "Transactions & Receipts" : "Transactions");
    log.info("\tCompleted: {}", metrics.getCompletionCount());
    if (receiptMode == IMMEDIATE) {
      log.info("\tStatus: {}", metrics.getTimerStatusToCount());
    }
    log.info("\tErrors: {}", metrics.getTimerErrorToCount());

    if (receiptMode == DEFERRED) {
      long receiptDelayMs = web3jConfig.getReceipt().getInterval();
      Thread.sleep(receiptDelayMs);
      log.info("Receipts:");
      log.info("\tStatus: {}", metrics.getReadCounterStatusToCount());
      log.info("\tErrors: {}", metrics.getReadCounterErrorToCount());
    }

    log.info("Test duration: {}", metrics.getElapsedTime());

    if (workloadConfig.getModel() == OPEN) {
      log.info("Arrival rate: {}/sec", workloadConfig.getLoadFactor());
    } else {
      log.info("Concurrency: {}", workloadConfig.getLoadFactor());
    }

    log.info("Avg throughput: {}/sec", metrics.getAverageThroughput());
    log.info("Avg latency:  {} ms", metrics.getAverageLatency());
    log.info("getReadAverageThroughput {}", metrics.getReadAverageThroughput());
  }

  /** Save report */
  @SneakyThrows(IOException.class)
  private void saveReport() {
    ProgressReport report = progress.getProgress();
    ObjectWriter writer = new ObjectMapper().writerWithDefaultPrettyPrinter();
    File dir = Paths.get("output", "result").toFile();
    String fileName = String.format("report-%d.json", serverPort);
    File file = new File(dir, fileName);
    boolean success = dir.mkdirs();
    writer.writeValue(file, report);
    log.info("Report saved at: {}", file);
  }
}
