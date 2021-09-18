/*
 * Copyright 2021 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
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

import static com.vmware.ethereum.config.WorkloadModel.OPEN;
import static java.time.Instant.now;
import static java.util.concurrent.TimeUnit.SECONDS;

import com.vmware.ethereum.config.TokenConfig;
import com.vmware.ethereum.config.WorkloadConfig;
import java.util.concurrent.CountDownLatch;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkloadRunner {

  private final WorkloadConfig config;
  private final WorkloadCommand command;
  private final SecureTokenApi api;
  private final TokenConfig tokenConfig;

  private final CountDownLatch countDownLatch;
  private final MetricsService metrics;

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
    workload.start();
  }

  /** Stop the workload. */
  @SneakyThrows(InterruptedException.class)
  private void stop(WorkloadService workload) {
    workload.stop();
    metrics.setEndTime(now());
    SECONDS.sleep(1);
    printReport();
    printBalance();
    log.info("Test is completed");
  }

  /** Create workload to run. */
  private WorkloadService createWorkload() {
    if (config.getModel() == OPEN) {
      return new OpenWorkload(command, config.getTransactions(), config.getLoadFactor());
    }
    return new ClosedWorkload(command, config.getTransactions(), config.getLoadFactor());
  }

  /** Print token balance of the sender and the receiver. */
  private void printBalance() {
    log.info("Block number: {}", api.getBlockNumber());
    log.info("Sender has {} tokens", api.getSenderBalance());
    long[] recipientBalances = api.getRecipientBalance(tokenConfig.getRecipients());
    for (int i = 0; i < tokenConfig.getRecipients().length; i++) {
      log.info("Recipient {} has {} tokens", i + 1, recipientBalances[i]);
    }
  }

  /** Print report */
  private void printReport() {
    log.info("Total: {}", metrics.getCompletionCount());
    log.info("\tStatus: {}", metrics.getStatusToCount());
    log.info("\tErrors: {}", metrics.getErrorToCount());

    log.info("Test duration: {}", metrics.getElapsedTime());

    if (config.getModel() == OPEN) {
      log.info("Arrival rate: {}/sec", config.getLoadFactor());
    } else {
      log.info("Concurrency: {}", config.getLoadFactor());
    }

    log.info("Avg throughput: {}/sec", metrics.getAverageThroughput());
    log.info("Avg latency:  {} ms", metrics.getAverageLatency());
  }
}
