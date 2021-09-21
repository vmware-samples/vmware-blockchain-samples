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

import static java.time.Duration.between;
import static java.time.Instant.now;

import com.vmware.ethereum.config.TokenConfig;
import com.vmware.ethereum.config.Web3jConfig;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.response.TransactionReceiptProcessor;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkloadCommand implements Runnable {

  private final SecureTokenApi api;
  private final CountDownLatch countDownLatch;
  private final MetricsService metrics;
  private final Web3jConfig web3jConfig;
  private final TokenConfig tokenConfig;
  private final TransactionReceiptProcessor queuedTransactionReceiptProcessor;
  private final Map<String, Instant> txTime;

  @Override
  public void run() {
    if (web3jConfig.isQueuedPolling()) {
      transferQueued();
    } else {
      transferAsync();
    }
  }

  /** Transfer token for deferred polling. */
  public void transferQueued() {
    api.transferQueued()
        .whenComplete(
            ((txHash, throwable) -> {
              Instant startTime = now();
              if (txHash != null) {
                queuedTransactionReceiptProcessor(txHash);
                txTime.put(txHash, startTime);
              }

              if (throwable != null) {
                log.warn("{}", throwable.toString());
                metrics.record(Duration.ZERO, throwable);
                countDownLatch.countDown();
              }
            }));
  }
  /** This a no op for queuedTransactionReceiptProcessor, so that it won't throw any exception */
  @SneakyThrows
  private void queuedTransactionReceiptProcessor(String txHash) {
    queuedTransactionReceiptProcessor.waitForTransactionReceipt(txHash);
  }

  /** Transfer token asynchronously. */
  public CompletableFuture<TransactionReceipt> transferAsync() {
    Instant startTime = now();
    return api.transferAsync()
        .whenComplete(
            (receipt, throwable) -> {
              Duration duration = between(startTime, now());

              if (receipt != null) {
                log.debug("Receipt: {}", receipt);
                metrics.record(duration, receipt.getStatus());
              }

              if (throwable != null) {
                log.warn("{}", throwable.toString());
                metrics.record(duration, throwable);
              }

              countDownLatch.countDown();
            });
  }
}
