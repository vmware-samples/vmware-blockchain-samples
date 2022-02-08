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

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.exceptions.JsonRpcError;
import org.web3j.tx.response.EmptyTransactionReceipt;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkloadCommand implements Runnable {

  private final SecureTokenApi api;
  private final CountDownLatch countDownLatch;
  private final MetricsService metrics;

  @Override
  public void run() {
    transferAsync();
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
                if (throwable instanceof JsonRpcError) {
                  JsonRpcError error = (JsonRpcError) throwable;
                  log.warn(
                      "JSON-RPC code {}, data: {}, message: {}",
                      error.getCode(),
                      error.getData(),
                      error.getMessage());
                } else {
                  log.warn("{}", throwable.toString());
                }

                metrics.record(duration, throwable);
              }

              countDownLatch.countDown();
            });
  }
}
