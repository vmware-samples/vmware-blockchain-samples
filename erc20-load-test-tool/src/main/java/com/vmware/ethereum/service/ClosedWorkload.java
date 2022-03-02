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

import com.vmware.ethereum.config.WorkloadConfig;
import java.util.concurrent.Semaphore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.BatchRequest;

@Slf4j
@RequiredArgsConstructor
public class ClosedWorkload implements WorkloadService {

  private final WorkloadCommand command;
  private final long transactions;
  private final int concurrency;
  private final SecureTokenApi api;
  private final Web3j web3j;
  private final WorkloadConfig workloadConfig;
  private BatchRequest batchRequest = null;

  @Override
  public void start() {
    log.info("Running {} transaction at concurrency {} ..", transactions, concurrency);
    Semaphore semaphore = new Semaphore(concurrency);
    for (int i = 0; i < transactions; i++) {
      semaphore.acquireUninterruptibly();
      if (batchRequest == null) {
        batchRequest = web3j.newBatch();
      }
      api.addBatchRequests(batchRequest);
      if (batchRequest.getRequests().size() == workloadConfig.getBatchSize()
          || i == transactions - 1) {
        command
            .transferBatchAsync(batchRequest)
            .whenComplete((response, throwable) -> semaphore.release());
        batchRequest = web3j.newBatch();
      } else {
        semaphore.release();
      }
    }
    log.info("Transactions submitted");
  }

  @Override
  public void stop() {
    // Do nothing
  }
}
