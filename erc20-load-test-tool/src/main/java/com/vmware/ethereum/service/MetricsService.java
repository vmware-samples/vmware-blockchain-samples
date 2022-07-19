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

import static com.vmware.ethereum.service.MetricsConstant.*;
import static io.micrometer.core.aop.TimedAspect.EXCEPTION_TAG;
import static java.lang.Math.max;
import static java.time.Duration.between;
import static java.time.Duration.ofSeconds;
import static java.time.Instant.now;
import static java.util.Collections.singleton;
import static java.util.Optional.ofNullable;
import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.stream.Collectors.toMap;

import com.vmware.ethereum.config.WorkloadConfig;
import io.micrometer.core.instrument.*;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MetricsService {

  private final MeterRegistry composite;
  private final SimpleMeterRegistry simple;
  private final WorkloadConfig config;

  @Setter private Instant startTime;
  @Setter private Instant endTime;

  /** Record the latency timer for successful write tx. */
  public void record(Duration duration, String status) {
    record(duration, statusTag(status));
  }

  /** Record the latency timer for failed write tx. */
  public void record(Duration duration, Throwable throwable) {
    record(duration, exceptionTag(throwable));
  }

  /** Record the latency timer with given tags. */
  private void record(Duration duration, Iterable<Tag> tags) {
    Timer.builder(WRITE_REQUEST_TIMER).tags(tags).register(composite).record(duration);
  }

  /** Record the latency timer for successful read requests. */
  public void recordRead(Duration duration, String status) {
    recordRead(duration, statusTag(status));
  }

  /** Record the latency timer for failed read requests. */
  public void recordRead(Duration duration, Throwable throwable) {
    recordRead(duration, exceptionTag(throwable));
  }

  /** Record the latency timer with given tags. */
  private void recordRead(Duration duration, Iterable<Tag> tags) {
    Timer.builder(READ_REQUEST_TIMER).tags(tags).register(composite).record(duration);
  }

  /** Increment the receipt counter for successful tx. */
  public void incrementRead(String status) {
    incrementRead(statusTag(status));
  }

  /** Increment the receipt counter for failed tx. */
  public void incrementRead(Throwable throwable) {
    incrementRead(exceptionTag(throwable));
  }

  /** Increment the receipt counter with given tags. */
  private void incrementRead(Iterable<Tag> tags) {
    Counter.builder(TOKEN_RECEIPT_COUNTER).tags(tags).register(composite).increment();
  }

  /** Get "count" group by "status code" for Write latency timer. */
  public Map<String, Long> getTimerStatusToCount() {
    return getTimerTagValueToCount(STATUS_TAG);
  }

  /** Get "count" group by "status code" for Read latency timer. */
  public Map<String, Long> getReadTimerStatusToCount() {
    return getReadTimerTagValueToCount(STATUS_TAG);
  }

  /** Get "count" group by "exception class" for latency timer. */
  public Map<String, Long> getTimerErrorToCount() {
    return getTimerTagValueToCount(EXCEPTION_TAG);
  }

  /** Get "count" group by "exception class" for Read latency timer. */
  public Map<String, Long> getReadTimerErrorToCount() {
    return getReadTimerTagValueToCount(EXCEPTION_TAG);
  }

  /** Get "count" group by the given tag name for latency timer. */
  private Map<String, Long> getTimerTagValueToCount(String tagName) {
    return simple.find(WRITE_REQUEST_TIMER).tagKeys(tagName).timers().stream()
        .collect(toMap(timer -> timer.getId().getTag(tagName), Timer::count));
  }

  /** Get "count" group by the given tag name for read latency timer. */
  private Map<String, Long> getReadTimerTagValueToCount(String tagName) {
    return simple.find(READ_REQUEST_TIMER).tagKeys(tagName).timers().stream()
        .collect(toMap(timer -> timer.getId().getTag(tagName), Timer::count));
  }

  /** Get "count" group by "status code" for receipt counter. */
  public Map<String, Long> getReadCounterStatusToCount() {
    return getReadCounterTagValueToCount(STATUS_TAG);
  }

  /** Get "count" group by "exception class" for receipt counter. */
  public Map<String, Long> getReadCounterErrorToCount() {
    return getReadCounterTagValueToCount(EXCEPTION_TAG);
  }

  /** Get "count" group by the given tag name for receipt counter. */
  private Map<String, Long> getReadCounterTagValueToCount(String tagName) {
    return simple.find(TOKEN_RECEIPT_COUNTER).tagKeys(tagName).counters().stream()
        .collect(
            toMap(counter -> counter.getId().getTag(tagName), counter -> (long) counter.count()));
  }

  /** Tag for the given status. */
  private Set<Tag> statusTag(String status) {
    return singleton(Tag.of(STATUS_TAG, ofNullable(status).orElse(STATUS_OK)));
  }

  /** Tag for the given exception. */
  private Set<Tag> exceptionTag(Throwable throwable) {
    return singleton(Tag.of(EXCEPTION_TAG, throwable.getClass().getSimpleName()));
  }

  /** Sum the values in the collection. */
  private long sum(Collection<Long> values) {
    return values.stream().mapToLong(Long::longValue).sum();
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

  /** Get total completed write transactions. */
  public long getCompletionCount() {
    return sum(getTimerStatusToCount().values()) + sum(getTimerErrorToCount().values());
  }

  /** Get total completed read receipts. */
  public long getReadCompletionCount() {
    return sum(getReadTimerStatusToCount().values()) + sum(getReadTimerErrorToCount().values());
  }

  /** Get total pending transactions. */
  public long getPendingCount() {
    return ((long) config.getTransactions() * config.getConcurrency()) - getCompletionCount();
  }

  /** Throughput for the write requests. */
  public long getAverageThroughput() {
    return getCompletionCount() / max(getElapsedTime().getSeconds(), 1);
  }

  /** Throughput for the read requests. */
  public long getReadAverageThroughput() {
    return getReadCompletionCount() / max(getElapsedTime().getSeconds(), 1);
  }

  /** Latency for the write requests. */
  public long getAverageLatency() {
    Collection<Timer> timers = simple.find(WRITE_REQUEST_TIMER).timers();
    double totalTime = timers.stream().mapToDouble(timer -> timer.totalTime(MILLISECONDS)).sum();
    long count = timers.stream().mapToLong(Timer::count).sum();
    return count == 0 ? 0 : (long) (totalTime / count);
  }

  /** Latency for the read requests. */
  public long getReadAverageLatency() {
    Collection<Timer> timers = simple.find(READ_REQUEST_TIMER).timers();
    double totalTime = timers.stream().mapToDouble(timer -> timer.totalTime(MILLISECONDS)).sum();
    long count = timers.stream().mapToLong(Timer::count).sum();
    return count == 0 ? 0 : (long) (totalTime / count);
  }

  /** Get number of HTTP connections. */
  public long getHttpConnections(String state) {
    Gauge connections = simple.find(OKHTTP_CONNECTION_COUNT).tag(STATE_TAG, state).gauge();
    return connections == null ? 0 : (long) connections.value();
  }
}
