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

import static java.util.stream.Collectors.joining;

import com.vmware.ethereum.config.WorkloadConfig;
import com.vmware.ethereum.model.ProgressReport;
import java.util.Map;
import java.util.Map.Entry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProgressService {

  private final MetricsService metrics;
  private final WorkloadConfig config;

  /** Get progress report. */
  public ProgressReport getProgress() {
    ProgressReport progress = buildProgress();
    metrics.resetPeriodMetrics();
    return progress;
  }

  /** Build progress report. */
  private ProgressReport buildProgress() {
    return ProgressReport.builder()
        .txTotal(config.getTransactions())
        .txStatus(toString(metrics.getStatusToCount()))
        .txErrors(toString(metrics.getErrorToCount()))
        .txPending(metrics.getPendingCount())
        .elapsedTime(metrics.getElapsedTime())
        .remainingTime(metrics.getRemainingTime())
        .workloadModel(config.getModel())
        .loadFactor(config.getLoadFactor())
        .currentThroughput(metrics.getPeriodThroughput())
        .currentLatency(metrics.getPeriodLatency())
        .averageThroughput(metrics.getAverageThroughput())
        .averageLatency(metrics.getAverageLatency())
        .build();
  }

  /** Formatted map */
  private String toString(Map<String, Long> map) {
    return map.entrySet().stream().map(Entry::toString).collect(joining("<br>"));
  }
}
