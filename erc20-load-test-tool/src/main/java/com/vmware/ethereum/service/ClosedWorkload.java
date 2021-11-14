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

import com.vmware.ethereum.config.Web3jConfig;
import java.util.concurrent.Semaphore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public class ClosedWorkload implements WorkloadService {

  private final WorkloadCommand command;
  private final Web3jConfig web3jConfig;
  private final long transactions;
  private final int concurrency;

  @Override
  public void start() {
    log.info("Running {} transaction at concurrency {} ..", transactions, concurrency);
    Semaphore semaphore = new Semaphore(concurrency);
    for (int i = 0; i < transactions; i++) {
      semaphore.acquireUninterruptibly();
      if (web3jConfig.getReceipt().getMode().equals("NOOP")) {
        command.transferNoOp().whenComplete((txHash, throwable) -> semaphore.release());
      } else {
        command.transferAsync().whenComplete((receipt, throwable) -> semaphore.release());
      }
    }
    log.info("Transactions submitted");
  }

  @Override
  public void stop() {
    // Do nothing
  }
}
