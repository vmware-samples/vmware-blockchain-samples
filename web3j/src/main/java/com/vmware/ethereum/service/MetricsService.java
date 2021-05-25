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

import static com.vmware.ethereum.service.MetricsConstant.STATUS_OK;
import static com.vmware.ethereum.service.MetricsConstant.STATUS_TAG;
import static com.vmware.ethereum.service.MetricsConstant.TOKEN_TRANSFER_METRIC_NAME;
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
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tag;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MetricsService {

  private final MeterRegistry composite;
  private final SimpleMeterRegistry simple;
  private final WorkloadConfig config;
  private final CurrentMetrics currentMetrics;

  @Setter private Instant startTime;
  @Setter private Instant endTime;

  /** Record the latency for successful tx. */
  public void record(Duration duration, String status) {
    record(duration, singleton(Tag.of(STATUS_TAG, ofNullable(status).orElse(STATUS_OK))));
  }

  /** Record the latency for failed tx. */
  public void record(Duration duration, Throwable throwable) {
    record(duration, singleton(Tag.of(EXCEPTION_TAG, throwable.getClass().getSimpleName())));
  }

  /** Record the latency with given tags. */
  private void record(Duration duration, Iterable<Tag> tags) {
    Timer.builder(TOKEN_TRANSFER_METRIC_NAME).tags(tags).register(composite).record(duration);
    currentMetrics.record(duration);
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
    return simple.find(TOKEN_TRANSFER_METRIC_NAME).tagKeys(tagName).timers().stream()
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
    Timer timer = simple.find(TOKEN_TRANSFER_METRIC_NAME).tag(STATUS_TAG, STATUS_OK).timer();
    return timer == null ? 0 : (long) timer.mean(MILLISECONDS);
  }

  /** Instantaneous throughput. */
  public long getCurrentThroughput() {
    return currentMetrics.getThroughput();
  }

  /** Instantaneous latency. */
  public long getCurrentLatency() {
    return currentMetrics.getLatency();
  }
}
