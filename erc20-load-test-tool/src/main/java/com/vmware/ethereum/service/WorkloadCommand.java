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

import static com.vmware.ethereum.service.MetricsConstant.STATUS_UNKNOWN;
import static java.time.Duration.between;
import static java.time.Instant.now;

import com.vmware.ethereum.config.BatchRequestAdv;
import com.vmware.ethereum.config.Web3jConfig;
import com.vmware.ethereum.config.WorkloadConfig;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.BatchResponse;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.exceptions.TransactionException;
import org.web3j.tx.response.EmptyTransactionReceipt;
import org.web3j.tx.response.TransactionReceiptProcessor;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkloadCommand implements Runnable {

  private final CountDownLatch countDownLatch;
  private final MetricsService metrics;
  private final Web3j web3j;
  private final Web3jConfig web3jConfig;
  private final WorkloadConfig workloadConfig;
  private final TransactionReceiptProcessor transactionReceiptProcessor;

  @Override
  public void run() {
    //    if (web3jConfig.getBatching().isEnable()) {
    //      log.info("inside workload command transfer batch async");
    //      if (((workloadConfig.getTransactions() - countDownLatch.getCount())
    //        % web3jConfig.getBatching().getBatchSize()
    //        == 0)
    //        || countDownLatch.getCount() == 0) {
    //        transferBatchAsync();
    //      }
    //    } else {
    //      transferAsync();
    //    }
  }

  /** Transfer token asynchronously. */
  public CompletableFuture<TransactionReceipt> transferAsync(SecureTokenApi api) {
    Instant startTime = now();
    return api.transferAsync()
        .whenComplete(
            (receipt, throwable) -> {
              Duration duration = between(startTime, now());

              if (receipt != null) {
                log.trace("Receipt: {}", receipt);
                String status =
                    receipt instanceof EmptyTransactionReceipt
                        ? STATUS_UNKNOWN
                        : receipt.getStatus();
                metrics.record(duration, status);
              }

              if (throwable != null) {
                log.warn("{}", throwable.toString());
                metrics.record(duration, throwable);
              }

              countDownLatch.countDown();
            });
  }

  public CompletableFuture<BatchResponse> transferBatchAsync(
      SecureTokenApi api, BatchRequestAdv batchRequestAdv) {
    log.debug("adding batch requests upto 5");
    Instant startTime = now();
    log.debug("batch requests added");

    return api.transferBatchAsync(batchRequestAdv)
        .whenComplete(
            (response, throwable) -> {
              TransactionReceipt receipt = null;
              for (int i = 0; i < response.getResponses().size(); i++) {
                String transactionHash = String.valueOf(response.getResponses().get(i).getResult());

                try {
                  receipt = transactionReceiptProcessor.waitForTransactionReceipt(transactionHash);
                } catch (IOException | TransactionException e) {
                  e.printStackTrace();
                }

                Duration duration = between(startTime, now());

                if (receipt != null) {
                  log.trace("Receipt: {}", receipt);
                  String status =
                      receipt instanceof EmptyTransactionReceipt
                          ? STATUS_UNKNOWN
                          : receipt.getStatus();
                  metrics.record(duration, status);
                }

                if (throwable != null) {
                  log.warn("{}", throwable.toString());
                  metrics.record(duration, throwable);
                }
                log.debug("response batch {}", transactionHash);
                log.debug("response Transaction Receipt {}", receipt);
              }
              batchRequestAdv.clear();
            });
  }
}
