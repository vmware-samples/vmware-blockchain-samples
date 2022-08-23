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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.web3j.crypto.Credentials;
import org.web3j.model.SecurityToken;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.BatchRequest;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.concurrent.Semaphore;

import static com.google.common.collect.Iterators.cycle;

@Slf4j
@RequiredArgsConstructor
public class WorkloadThread implements Runnable {

  private final WorkloadCommand command;
  private final Web3j web3j;
  private final SecureTokenApi api;
  private final WorkloadConfig workloadConfig;
  private final ArrayList<Credentials> credentialsArrayList;
  private BatchRequest batchRequest = null;
  private ArrayList<String> signedBatchRequest = new ArrayList<>();

  public void run() {
    // Displaying the thread that is running
    // log.info("Running {} transactions in thread {} ..", transactions, index + 1);
    long transactions = workloadConfig.getTransactions();
    Semaphore semaphore = new Semaphore(1);
    ArrayList<SecurityToken> tokens = new ArrayList<>();
    for (Credentials cred : credentialsArrayList) {
      tokens.add(SecurityToken.load(api.getContractAddress(), web3j, cred, api.getGasProvider()));
    }
    Iterator<Credentials> credentialsIterator = cycle(credentialsArrayList);
    Iterator<SecurityToken> securityTokenIterator = cycle(tokens);
    Credentials credentialsCurrent = credentialsIterator.next();
    SecurityToken token = securityTokenIterator.next();
    while (transactions >= 0) {
      transactions--;
      semaphore.acquireUninterruptibly();
      if (batchRequest == null) {
        batchRequest = web3j.newBatch();
      }
      api.addBatchRequests(batchRequest, signedBatchRequest, token, web3j, credentialsCurrent);
      if (batchRequest.getRequests().size() == workloadConfig.getBatchSize() || transactions == 0) {
        log.info(
            "Batch Number(tx left) - {} size - {} data - {}",
            transactions,
            batchRequest.getRequests().size(),
            batchRequest.getRequests());
        command
            .transferBatchAsync(batchRequest, signedBatchRequest, web3j)
            .whenComplete((response, throwable) -> semaphore.release());
        batchRequest = web3j.newBatch();
        signedBatchRequest = new ArrayList<>();
      } else {
        semaphore.release();
      }
      credentialsCurrent = credentialsIterator.next();
      token = securityTokenIterator.next();
    }
  }
}
