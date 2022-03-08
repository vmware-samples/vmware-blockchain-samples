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
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.BatchRequest;
import org.web3j.protocol.core.BatchResponse;
import org.web3j.protocol.core.Response;
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
        .whenComplete((response, throwable) -> receiptProcessor(startTime, response, throwable));
  }

  private void receiptProcessor(Instant startTime, BatchResponse response, Throwable throwable) {
    ArrayList<TransactionReceipt> receipt = new ArrayList<>();
    Duration duration;

    BatchRequest receiptBatchRequest = web3j.newBatch();

    for (int i = 0; i < response.getResponses().size(); i++) {
      String transactionHash = String.valueOf(response.getResponses().get(i).getResult());

      if (web3jConfig.getReceipt().isDefer() || web3jConfig.getReceipt().getAttempts() == 0) {
        try {
          receipt.add(transactionReceiptProcessor.waitForTransactionReceipt(transactionHash));
        } catch (IOException | TransactionException e) {
          e.printStackTrace();
        }
      } else {
        receiptBatchRequest.add(web3j.ethGetTransactionReceipt(transactionHash));
      }
    }

    if (receiptBatchRequest.getRequests().size() != 0) {
      BatchResponse receiptBatchResponse = null;
      try {
        receiptBatchResponse = receiptBatchRequest.send();
      } catch (IOException e) {
        e.printStackTrace();
      }
      Response<?> receiptResponse;
      for (int i = 0;
          receiptBatchResponse != null && i < receiptBatchResponse.getResponses().size();
          i++) {
        receiptResponse = receiptBatchResponse.getResponses().get(i);
        if (!receiptResponse.hasError()) {
          receipt.add((TransactionReceipt) receiptResponse.getResult());
        } else {
          TransactionReceipt errorReceiptResponse =
              (TransactionReceipt) receiptResponse.getResult();
          errorReceiptResponse.setStatus(String.valueOf(receiptResponse.getError().getCode()));
          receipt.add(errorReceiptResponse);
          log.info(
              "error - {} {} {}",
              receiptResponse.getError().getCode(),
              receiptResponse.getError().getData(),
              receiptResponse.getError().getMessage());
        }
      }
    }

    for (int i = 0; i < receipt.size(); i++) {
      duration = between(startTime, now());
      if (receipt.get(i) != null) {
        log.trace("Receipt: {}", receipt);
        String status =
            receipt.get(i) instanceof EmptyTransactionReceipt
                ? STATUS_UNKNOWN
                : receipt.get(i).getStatus();
        metrics.record(duration, status);
      }

      if (throwable != null) {
        log.warn("{}", throwable.toString());
        metrics.record(duration, throwable);
      }
      countDownLatch.countDown();
    }
  }
}
