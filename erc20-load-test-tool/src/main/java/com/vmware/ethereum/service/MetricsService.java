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
import io.micrometer.core.instrument.*;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.Map;
import java.util.Set;

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

@Service
@RequiredArgsConstructor
public class MetricsService {

  private final MeterRegistry composite;
  private final SimpleMeterRegistry simple;
  private final WorkloadConfig config;

  @Setter private Instant startTime;
  @Setter private Instant endTime;

  /** Record the latency timer for successful tx. */
  public void record(Duration duration, String status) {
    record(duration, statusTag(status));
  }

  /** Record the latency timer for successful tx. */
  public void recordWrite(Duration duration, String status) {
    recordWrite(duration, statusTag(status));
  }

  /** Record the latency timer for failed tx. */
  public void record(Duration duration, Throwable throwable) {
    record(duration, exceptionTag(throwable));
  }

  /** Record the latency timer with given tags. */
  private void record(Duration duration, Iterable<Tag> tags) {
    Timer.builder(TOKEN_TRANSFER_TIMER).tags(tags).register(composite).record(duration);
  }

  /** Record the latency timer with given tags. */
  private void recordWrite(Duration duration, Iterable<Tag> tags) {
    Timer.builder(WRITE_TRANSFER_TIMER).tags(tags).register(composite).record(duration);
  }

  /** Increment the receipt counter for successful tx. */
  public void increment(String status) {
    increment(statusTag(status));
  }

  /** Increment the receipt counter for successful tx. */
  public void incrementWrite(String status) {
    incrementWrite(statusTag(status));
  }

  /** Increment the receipt counter for failed tx. */
  public void increment(Throwable throwable) {
    increment(exceptionTag(throwable));
  }

  /** Increment the receipt counter with given tags. */
  private void increment(Iterable<Tag> tags) {
    Counter.builder(TOKEN_RECEIPT_COUNTER).tags(tags).register(composite).increment();
  }

  private void incrementWrite(Iterable<Tag> tags) {
    Counter.builder(WRITE_REQUEST_COUNTER).tags(tags).register(composite).increment();
  }

  /** Get "count" group by "status code" for latency timer. */
  public Map<String, Long> getTimerStatusToCount() {
    return getTimerTagValueToCount(STATUS_TAG);
  }

  public Map<String, Long> getWriteTimerStatusToCount() {
        return getWriteTimerTagValueToCount(STATUS_TAG);
  }


  /** Get "count" group by "exception class" for latency timer. */
  public Map<String, Long> getTimerErrorToCount() {
    return getTimerTagValueToCount(EXCEPTION_TAG);
  }

  /** Get "count" group by the given tag name for latency timer. */
  private Map<String, Long> getTimerTagValueToCount(String tagName) {
    return simple.find(TOKEN_TRANSFER_TIMER).tagKeys(tagName).timers().stream()
        .collect(toMap(timer -> timer.getId().getTag(tagName), Timer::count));
  }

  private Map<String, Long> getWriteTimerTagValueToCount(String tagName) {
    return simple.find(WRITE_TRANSFER_TIMER).tagKeys(tagName).timers().stream()
      .collect(toMap(timer -> timer.getId().getTag(tagName), Timer::count));
  }

  /** Get "count" group by "status code" for receipt counter. */
  public Map<String, Long> getCounterStatusToCount() {
    return getCounterTagValueToCount(STATUS_TAG);
  }

  /** Get "count" group by "status code" for receipt counter. */
  public Map<String, Long> getWriteCounterStatusToCount() {
    return getWriteCounterTagValueToCount(STATUS_TAG);
  }

  /** Get "count" group by "exception class" for receipt counter. */
  public Map<String, Long> getCounterErrorToCount() {
    return getCounterTagValueToCount(EXCEPTION_TAG);
  }

  /** Get "count" group by the given tag name for receipt counter. */
  private Map<String, Long> getCounterTagValueToCount(String tagName) {
    return simple.find(TOKEN_RECEIPT_COUNTER).tagKeys(tagName).counters().stream()
        .collect(
            toMap(counter -> counter.getId().getTag(tagName), counter -> (long) counter.count()));
  }

  /** Get "count" group by the given tag name for receipt counter. */
  private Map<String, Long> getWriteCounterTagValueToCount(String tagName) {
    return simple.find(WRITE_REQUEST_COUNTER).tagKeys(tagName).counters().stream()
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

  /** Get total completed transactions. */
  public long getCompletionCount() {
    return sum(getTimerStatusToCount().values()) + sum(getTimerErrorToCount().values());
  }

  public long getWriteCompletionCount() {
    return sum(getWriteTimerStatusToCount().values());
  }
  /** Get total pending transactions. */
  public long getPendingCount() {
    return config.getTransactions() - getCompletionCount();
  }

  /** Throughput for the test duration. */
  public long getAverageThroughput() {
    return getCompletionCount() / max(getElapsedTime().getSeconds(), 1);
  }

  /** Throughput for the test duration. */
  public double getAverageWriteThroughput() {
        return getWriteCompletionCount() / (double) max(getElapsedTime().getSeconds(), 1);
  }

  /** Latency for the test duration. */
  public long getAverageLatency() {
    Collection<Timer> timers = simple.find(TOKEN_TRANSFER_TIMER).timers();
    double totalTime = timers.stream().mapToDouble(timer -> timer.totalTime(MILLISECONDS)).sum();
    long count = timers.stream().mapToLong(Timer::count).sum();
    return count == 0 ? 0 : (long) (totalTime / count);
  }

  /** Latency for the test duration. */
  public long getWriteAverageLatency() {
    Collection<Timer> timers = simple.find(WRITE_TRANSFER_TIMER).timers();
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
