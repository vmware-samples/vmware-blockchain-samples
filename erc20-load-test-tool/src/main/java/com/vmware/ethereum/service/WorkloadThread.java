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

import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.BatchRequest;

@Slf4j
@RequiredArgsConstructor
public class WorkloadThread implements Runnable {

  private final WorkloadCommand command;
  private Web3j web3jCurrent;
  private BatchRequest batchRequest = null;
  private ArrayList<String> signedBatchRequest = new ArrayList<>();

  public WorkloadThread(
      WorkloadCommand command,
      Web3j web3jCurrent,
      BatchRequest batchRequest,
      ArrayList<String> signedBatchRequest) {
    this.command = command;
    this.web3jCurrent = web3jCurrent;
    this.batchRequest = batchRequest;
    this.signedBatchRequest = signedBatchRequest;
  }
  //  private final long transactions;
  //  private final SecureTokenApi api;
  //  private final ArrayList<Web3j> web3j;
  //  private final WorkloadConfig workloadConfig;
  //  private final int index;

  public void run() {
    // Displaying the thread that is running
    //    log.info("Running {} transactions in thread {} ..", transactions, index + 1);
    //    Semaphore semaphore = new Semaphore(1);
    //    for (int i = 0; i < transactions; i++) {
    //      semaphore.acquireUninterruptibly();
    //      if (batchRequest == null) {
    //        batchRequest = web3j.get(index).newBatch();
    //      }
    //      api.addBatchRequests(batchRequest, signedBatchRequest, index);
    //      if (batchRequest.getRequests().size() == workloadConfig.getBatchSize()
    //          || i == transactions - 1) {
    //        command
    //            .transferBatchAsync(batchRequest, signedBatchRequest, index)
    //            .whenComplete((response, throwable) -> semaphore.release());
    //        batchRequest = web3j.get(index).newBatch();
    //        signedBatchRequest = new ArrayList<>();
    //      } else {
    //        semaphore.release();
    //      }
    //    }
    command.transferBatchAsync(batchRequest, signedBatchRequest, web3jCurrent);
  }
}
