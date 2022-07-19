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

import static com.vmware.ethereum.model.ReceiptMode.DEFERRED;
import static com.vmware.ethereum.model.ReceiptMode.IMMEDIATE;
import static java.time.Instant.now;
import static java.util.concurrent.TimeUnit.SECONDS;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.vmware.ethereum.config.PermissioningConfig;
import com.vmware.ethereum.config.TokenConfig;
import com.vmware.ethereum.config.Web3jConfig;
import com.vmware.ethereum.config.WorkloadConfig;
import com.vmware.ethereum.model.ProgressReport;
import com.vmware.ethereum.model.ReceiptMode;
import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.concurrent.CountDownLatch;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkloadRunner {

  private final WorkloadConfig workloadConfig;
  private final TokenConfig tokenConfig;
  private final Web3jConfig web3jConfig;
  private final PermissioningConfig permissioningConfig;
  private final WorkloadCommand command;
  private final SecureTokenApi api;
  private final PermissioningApi permissioningApi;
  private final ArrayList<Credentials> credentials;
  private final Credentials deployerCredentials;

  private final CountDownLatch countDownLatch;
  private final MetricsService metrics;
  private final ProgressService progress;
  private final ReceiptMode receiptMode;

  private final ArrayList<Web3j> web3j;
  private final ArrayList<String> senderAddressArray;

  @Value("${server.port}")
  private int serverPort;

  /** Run the workload. */
  @SneakyThrows(InterruptedException.class)
  public void run() {

    if (permissioningConfig.isEnable()) {
      try {
        for (Credentials creds : credentials) {
          permissioningSetup(creds);
        }
        if (!checkPermissions(deployerCredentials)) permissioningSetup(deployerCredentials);
      } catch (Exception e) {
        log.error("permissioning Setup error = {}", e.toString());
      }
    }
    WorkloadService workload = createWorkload();
    start(workload);
    countDownLatch.await();
    stop(workload);
  }

  private void permissioningSetup(Credentials credentials) throws Exception {
    String address = credentials.getAddress();
    TransactionReceipt permTxReceipt =
        permissioningApi.getReadWritePermission(
            address, Credentials.create(permissioningConfig.getSuperAdmins()[0]));
    log.debug("getReadWrite permission tx receipt - {}", permTxReceipt);

    TransactionReceipt approveTxReceipt;
    for (int i = 1; i < permissioningConfig.getSuperAdmins().length - 1; i++) {
      approveTxReceipt =
          permissioningApi.approvePermission(
              address, Credentials.create(permissioningConfig.getSuperAdmins()[i]));
      log.debug("approve perm tx receipt - {}", approveTxReceipt);
    }
    checkPermissions(credentials);
  }

  private Boolean checkPermissions(Credentials credentials) throws Exception {
    Boolean checkWrite = permissioningApi.checkWritePermission(credentials);
    log.info("write permission granted: {}", checkWrite);
    Boolean checkRead = permissioningApi.checkReadPermission(credentials);
    log.info("read permission granted: {}", checkRead);
    return checkWrite && checkRead;
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
    return new WorkloadService(
        command, workloadConfig.getTransactions(), api, web3j, workloadConfig);
  }

  /** Print token balance of the sender and the receiver. */
  private void printBalance() {
    log.info("Block number: {}", api.getBlockNumber());
    log.info("Deployer has {} tokens", api.getSenderBalance());
    ArrayList<Long> senderArrayBalnces = api.getSenderArrayBalance(senderAddressArray);
    for (int i = 0; i < senderAddressArray.size(); i++) {
      log.info("Sender {} has {} tokens", i + 1, senderArrayBalnces.get(i));
    }
    log.info("Recipient {} has {} tokens", tokenConfig.getRecipient(), api.getRecipientBalance());
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
    log.info("Concurrency: {}", workloadConfig.getConcurrency());

    log.info("Batch Size: {}", workloadConfig.getBatchSize());
    log.info("Avg write throughput: {}/sec", metrics.getAverageThroughput());
    log.info("Avg write latency:  {} ms", metrics.getAverageLatency());
    log.info("Avg read throughput {}", metrics.getReadAverageThroughput());
    log.info("Avg read latency {}", metrics.getReadAverageLatency());
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
