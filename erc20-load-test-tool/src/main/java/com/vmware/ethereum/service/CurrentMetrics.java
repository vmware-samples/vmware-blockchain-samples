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

import static java.lang.Math.max;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.LongAdder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@EnableScheduling
@RequiredArgsConstructor
public class CurrentMetrics {

  private final AtomicInteger txCount;
  private final LongAdder aggregateLatency;

  @Getter private long throughput;
  @Getter private long latency;

  public CurrentMetrics() {
    txCount = new AtomicInteger();
    aggregateLatency = new LongAdder();
  }

  @Scheduled(fixedRate = 1000)
  public void calculate() {
    throughput = txCount.get();
    latency = aggregateLatency.sum() / max(txCount.get(), 1);
    reset();
  }

  /** Aggregate latency and increment count. */
  public void record(Duration duration) {
    txCount.incrementAndGet();
    aggregateLatency.add(duration.toMillis());
  }

  private void reset() {
    txCount.set(0);
    aggregateLatency.reset();
  }
}
