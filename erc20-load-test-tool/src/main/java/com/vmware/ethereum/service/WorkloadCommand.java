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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.BatchRequest;
import org.web3j.protocol.core.BatchResponse;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.response.EmptyTransactionReceipt;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;

import static com.vmware.ethereum.service.MetricsConstant.STATUS_UNKNOWN;
import static java.time.Duration.between;
import static java.time.Instant.now;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkloadCommand implements Runnable {

  private final SecureTokenApi api;
  private final CountDownLatch countDownLatch;
  private final MetricsService metrics;
  private final Web3j web3j;
  BatchRequest batch;

  @Override
  public void run() {
    if (false) {
      log.info("inside workload command transfer batch async");
      transferBatchAsync();
    } else {
      transferAsync();
    }
  }

  /** Transfer token asynchronously. */
  public CompletableFuture<TransactionReceipt> transferAsync() {
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

  public CompletableFuture<BatchResponse> transferBatchAsync() {
    log.info("adding batch requests upto 5");
    batch = web3j.newBatch();
    for (int i = 0; i < 5; i++) {
      log.info("i = {}", i);
      api.addBatchRequests(batch);
    }
    log.info("batch requests added");
    return api.transferBatchAsync(batch)
        .whenComplete(
            (response, throwable) -> {
              for (int i = 0; i < response.getResponses().size(); i++) {
                countDownLatch.countDown();
                log.info("response batch {}", response.getResponses().toString());
              }
            });
  }
}
