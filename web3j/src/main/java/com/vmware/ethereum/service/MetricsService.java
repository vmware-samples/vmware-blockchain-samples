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
import static java.time.Duration.between;
import static java.time.Duration.ofSeconds;
import static java.time.Instant.now;

import com.vmware.ethereum.config.WorkloadConfig;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.LongAdder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

@Setter
@Getter
@Service
public class MetricsService {

  private final int totalCount;
  private final AtomicInteger successCount;
  private final AtomicInteger failureCount;
  private final Map<String, AtomicInteger> errorToCount;
  private final LongAdder totalLatency;

  private final long periodInterval;
  private final AtomicInteger periodCount;
  private final LongAdder periodLatency;

  private Instant startTime;
  private Instant endTime;

  public MetricsService(WorkloadConfig config) {
    successCount = new AtomicInteger();
    failureCount = new AtomicInteger();
    errorToCount = new ConcurrentHashMap<>();
    periodCount = new AtomicInteger();
    totalLatency = new LongAdder();
    periodLatency = new LongAdder();

    totalCount = config.getTransactions();
    periodInterval = config.getProgressInterval().getSeconds();
  }

  /** Increment transaction counts. */
  public void updateTxStatus(boolean isStatusOK) {
    if (isStatusOK) {
      successCount.incrementAndGet();
    } else {
      failureCount.incrementAndGet();
    }

    periodCount.incrementAndGet();
  }

  /** Increment error count. */
  public void updateTxError(String error) {
    errorToCount.putIfAbsent(error, new AtomicInteger());
    errorToCount.get(error).incrementAndGet();
  }

  /** Add to accumulated latency. */
  public void updateTxLatency(long responseTimeMs) {
    totalLatency.add(responseTimeMs);
    periodLatency.add(responseTimeMs);
  }

  /** Get elapsed time of the test. */
  public Duration getElapsedTime() {
    if (endTime != null) {
      return between(startTime, endTime);
    }
    return between(startTime, now());
  }

  /** Get remaining time of the test. */
  public Duration getRemainingTime() {
    return ofSeconds(getPendingCount() / max(getAverageThroughput(), 1));
  }

  /** Get total completed transactions. */
  public int getCompletionCount() {
    return successCount.get() + failureCount.get() + getErrorCount();
  }

  /** Get number of exceptions. */
  private int getErrorCount() {
    return errorToCount.values().stream().mapToInt(AtomicInteger::get).sum();
  }

  /** Get total pending transactions. */
  public int getPendingCount() {
    return totalCount - getCompletionCount();
  }

  /** Throughput for the test duration. */
  public long getAverageThroughput() {
    return getThroughput(getCompletionCount(), getElapsedTime().getSeconds());
  }

  /** Latency for the test duration. */
  public long getAverageLatency() {
    return getLatency(totalLatency, getCompletionCount());
  }

  /** Throughput for the current period. */
  public long getPeriodThroughput() {
    return getThroughput(periodCount.get(), periodInterval);
  }

  /** Latency for the current period. */
  public long getPeriodLatency() {
    return getLatency(periodLatency, periodCount.get());
  }

  /** Get transactions per second. */
  private long getThroughput(int transactions, long seconds) {
    return transactions / max(seconds, 1);
  }

  /** Get latency per transaction. */
  private long getLatency(LongAdder cumulative, int transactions) {
    return cumulative.sum() / max(transactions, 1);
  }

  /** Reset the counters for the next period. */
  public void resetPeriodMetrics() {
    periodCount.set(0);
    periodLatency.reset();
  }
}
