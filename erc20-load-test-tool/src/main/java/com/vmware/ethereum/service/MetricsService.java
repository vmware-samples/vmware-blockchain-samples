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

import static com.vmware.ethereum.service.MetricsConstant.OKHTTP_CONNECTION_COUNT;
import static com.vmware.ethereum.service.MetricsConstant.STATE_TAG;
import static com.vmware.ethereum.service.MetricsConstant.STATUS_OK;
import static com.vmware.ethereum.service.MetricsConstant.STATUS_TAG;
import static com.vmware.ethereum.service.MetricsConstant.TOKEN_RECEIPT_COUNTER;
import static com.vmware.ethereum.service.MetricsConstant.TOKEN_TRANSFER_TIMER;
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
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tag;
import io.micrometer.core.instrument.Timer;
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

  /** Record the latency timer for successful tx. */
  public void record(Duration duration, String status) {
    record(duration, statusTag(status));
  }

  /** Record the latency timer for failed tx. */
  public void record(Duration duration, Throwable throwable) {
    record(duration, exceptionTag(throwable));
  }

  /** Record the latency timer with given tags. */
  private void record(Duration duration, Iterable<Tag> tags) {
    Timer.builder(TOKEN_TRANSFER_TIMER).tags(tags).register(composite).record(duration);
  }

  /** Increment the receipt counter for successful tx. */
  public void increment(String status) {
    increment(statusTag(status));
  }

  /** Increment the receipt counter for failed tx. */
  public void increment(Throwable throwable) {
    increment(exceptionTag(throwable));
  }

  /** Increment the receipt counter with given tags. */
  private void increment(Iterable<Tag> tags) {
    Counter.builder(TOKEN_RECEIPT_COUNTER).tags(tags).register(composite).increment();
  }

  /** Tag for the given status. */
  private Set<Tag> statusTag(String status) {
    return singleton(Tag.of(STATUS_TAG, ofNullable(status).orElse(STATUS_OK)));
  }

  /** Tag for the given exception. */
  private Set<Tag> exceptionTag(Throwable throwable) {
    return singleton(Tag.of(EXCEPTION_TAG, throwable.getClass().getSimpleName()));
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
    return sum(getStatusToCount().values()) + sum(getErrorToCount().values());
  }

  /** Get count group by status code. */
  public Map<String, Long> getStatusToCount() {
    return getTagValueToCount(STATUS_TAG);
  }

  /** Get count group by exception class. */
  public Map<String, Long> getErrorToCount() {
    return getTagValueToCount(EXCEPTION_TAG);
  }

  /** Get timer count field, group by the given tag name. */
  private Map<String, Long> getTagValueToCount(String tagName) {
    return simple.find(TOKEN_TRANSFER_TIMER).tagKeys(tagName).timers().stream()
        .collect(toMap(timer -> timer.getId().getTag(tagName), Timer::count));
  }

  /** Sum the values in the collection. */
  private long sum(Collection<Long> values) {
    return values.stream().mapToLong(Long::longValue).sum();
  }

  /** Get total pending transactions. */
  public long getPendingCount() {
    return config.getTransactions() - getCompletionCount();
  }

  /** Throughput for the test duration. */
  public long getAverageThroughput() {
    return getCompletionCount() / max(getElapsedTime().getSeconds(), 1);
  }

  /** Latency for the test duration. */
  public long getAverageLatency() {
    Collection<Timer> timers = simple.find(TOKEN_TRANSFER_TIMER).timers();
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
