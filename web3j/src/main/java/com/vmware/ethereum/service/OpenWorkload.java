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

import static java.util.concurrent.Executors.newSingleThreadScheduledExecutor;
import static java.util.concurrent.TimeUnit.MICROSECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;

import java.util.concurrent.ScheduledExecutorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public class OpenWorkload implements WorkloadService {

  private final WorkloadCommand command;
  private final long transactions;
  private final int arrivalRate;

  private ScheduledExecutorService executor;

  @Override
  public void start() {
    log.info("Running {} transaction at arrival rate {}/sec ..", transactions, arrivalRate);
    executor = newSingleThreadScheduledExecutor();
    long periodUs = SECONDS.toMicros(1) / arrivalRate;
    executor.scheduleAtFixedRate(command, 0, periodUs, MICROSECONDS);
    log.info("Transactions scheduled");
  }

  @Override
  public void stop() {
    executor.shutdown();
  }
}
