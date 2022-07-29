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

import static com.google.common.collect.Iterators.cycle;

import com.vmware.ethereum.config.WorkloadConfig;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.web3j.crypto.Credentials;
import org.web3j.model.SecurityToken;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.BatchRequest;

@Slf4j
@RequiredArgsConstructor
public class WorkloadService {

  private final WorkloadCommand command;
  private final SecureTokenApi api;
  private final ArrayList<Web3j> web3j;
  private final ArrayList<Credentials> credentialsArrayList;
  private final WorkloadConfig workloadConfig;
  private BatchRequest batchRequest = null;
  private ArrayList<String> signedBatchRequest = new ArrayList<>();

  public void start() {
    //    Thread[] t = new Thread[workloadConfig.getConcurrency()];
    //    for (int i = 0; i < workloadConfig.getConcurrency(); i++) {
    //      t[i] = new Thread(new WorkloadThread(command, transactions, api, web3j, workloadConfig,
    // i));
    //      t[i].start();
    //    }
    //    for (int i = 0; i < workloadConfig.getConcurrency(); i++) {
    //      try {
    //        t[i].join();
    //      } catch (InterruptedException e) {
    //        e.printStackTrace();
    //      }
    //    }

    Iterator<Web3j> web3jIterator = cycle(web3j);
    Iterator<Credentials> credentialsIterator = cycle(credentialsArrayList);
    ExecutorService pool = Executors.newFixedThreadPool(workloadConfig.getConcurrency());
    ThreadPoolExecutor threadPoolExecutor = (ThreadPoolExecutor) pool;
    //    Semaphore semaphore = new Semaphore(workloadConfig.getConcurrency());
    Web3j web3jCurrent = web3jIterator.next();
    Credentials credentialsCurrent = credentialsIterator.next();
    SecurityToken token;
    for (int i = 0; i < workloadConfig.getTransactions(); i++) {
      //      semaphore.acquireUninterruptibly();
      if (batchRequest == null) {
        batchRequest = web3jCurrent.newBatch();
      }
      token =
          SecurityToken.load(
              api.getContractAddress(), web3jCurrent, credentialsCurrent, api.getGasProvider());
      api.addBatchRequests(
          batchRequest, signedBatchRequest, token, web3jCurrent, credentialsCurrent);
      if (batchRequest.getRequests().size() == workloadConfig.getBatchSize()
          || i == workloadConfig.getTransactions() - 1) {
        pool.execute(new WorkloadThread(command, web3jCurrent, batchRequest, signedBatchRequest));
        log.info(String.valueOf(threadPoolExecutor.getActiveCount()));
        //        command
        //            .transferBatchAsync(batchRequest, signedBatchRequest, web3jCurrent)
        //            .whenComplete((response, throwable) -> semaphore.release());
        web3jCurrent = web3jIterator.next();
        batchRequest = web3jCurrent.newBatch();
        signedBatchRequest = new ArrayList<>();
      }
      //      else {
      ////        semaphore.release();
      //      }
      credentialsCurrent = credentialsIterator.next();
    }
    log.info("Transactions submitted");
  }

  public void stop() {
    // Do nothing
  }
}
