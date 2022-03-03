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
import org.web3j.protocol.core.BatchRequest;
import org.web3j.protocol.core.BatchResponse;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.exceptions.TransactionException;
import org.web3j.tx.response.EmptyTransactionReceipt;
import org.web3j.tx.response.TransactionReceiptProcessor;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkloadCommand implements Runnable {

  private final MetricsService metrics;
  private final Web3j web3j;
  private final WorkloadConfig workloadConfig;
  private final TransactionReceiptProcessor transactionReceiptProcessor;
  private final SecureTokenApi api;
  private final CountDownLatch countDownLatch;
  private final Web3jConfig web3jConfig;
  private BatchRequest batchRequest = null;

  @Override
  public void run() {
    if (batchRequest == null) {
      batchRequest = web3j.newBatch();
    }
    api.addBatchRequests(batchRequest);
    if (batchRequest.getRequests().size() == workloadConfig.getBatchSize()
        || countDownLatch.getCount() == 1) {
      transferBatchAsync(batchRequest);
      batchRequest = web3j.newBatch();
    }
  }

  /** Transfer token asynchronously. */
  public CompletableFuture<BatchResponse> transferBatchAsync(BatchRequest batchRequest) {
    Instant startTime = now();
    log.debug("batch requests added");

    return api.transferBatchAsync(batchRequest)
        .whenComplete(
            (response, throwable) -> {
              BatchRequest receiptBatchRequest = web3j.newBatch();
              TransactionReceipt receipt = null;
              Duration duration;
              for (int i = 0; i < response.getResponses().size(); i++) {
                String transactionHash = String.valueOf(response.getResponses().get(i).getResult());
                receiptBatchRequest.add(web3j.ethGetTransactionReceipt(transactionHash));
                if (web3jConfig.getReceipt().isDefer()
                    || web3jConfig.getReceipt().getAttempts() == 0) {
                  try {
                    receipt =
                        transactionReceiptProcessor.waitForTransactionReceipt(transactionHash);
                  } catch (IOException | TransactionException e) {
                    e.printStackTrace();
                  }
                  duration = between(startTime, now());
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
                  countDownLatch.countDown();
                }
              }
              if (!web3jConfig.getReceipt().isDefer()
                  && web3jConfig.getReceipt().getAttempts() != 0) {
                BatchResponse receiptBatchResponse = null;

                try {
                  receiptBatchResponse = receiptBatchRequest.send();
                  duration = between(startTime, now());
                  for (int i = 0; i < receiptBatchResponse.getResponses().size(); i++) {
                    receipt =
                        (TransactionReceipt) receiptBatchResponse.getResponses().get(i).getResult();
                    log.debug("receipt = {}", receipt);
                    if (receipt != null) {
                      log.trace("Receipt: {}", receipt);
                      String status = receipt.getStatus();
                      metrics.record(duration, status);
                    }

                    if (throwable != null) {
                      log.warn("{}", throwable.toString());
                      metrics.record(duration, throwable);
                    }
                    log.debug("response Transaction Receipt {}", receipt);
                    countDownLatch.countDown();
                  }

                } catch (IOException e) {
                  e.printStackTrace();
                }
              }
            });
  }
}
