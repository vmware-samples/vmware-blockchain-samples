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
import com.vmware.ethereum.model.ProgressReport;
import com.vmware.ethereum.model.ReceiptMode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Map.Entry;

import static com.vmware.ethereum.service.MetricsConstant.STATE_ACTIVE;
import static com.vmware.ethereum.service.MetricsConstant.STATE_IDLE;
import static java.util.stream.Collectors.joining;

@Service
@RequiredArgsConstructor
public class ProgressService {

  private final MetricsService metrics;
  private final WorkloadConfig config;
  private final ReceiptMode receiptMode;

  /** Get progress report. */
  public ProgressReport getProgress() {
    return ProgressReport.builder()
        .receiptMode(receiptMode)
        .txTotal(config.getTransactions())
        .txStatus(toString(metrics.getTimerStatusToCount()))
        .txErrors(toString(metrics.getTimerErrorToCount()))
        .receiptStatus(toString(metrics.getCounterStatusToCount()))
        .receiptErrors(toString(metrics.getCounterErrorToCount()))
        .txPending(metrics.getPendingCount())
        .elapsedTime(metrics.getElapsedTime())
        .remainingTime(metrics.getRemainingTime())
        .workloadModel(config.getModel())
        .loadFactor(config.getLoadFactor())
        .averageThroughput(metrics.getAverageThroughput())
        .averageLatency(metrics.getAverageLatency())
        .averageWriteThroughput(metrics.getAverageWriteThroughput())
        .batchSize(config.getBatchSize())
        .activeConnections(metrics.getHttpConnections(STATE_ACTIVE))
        .idleConnections(metrics.getHttpConnections(STATE_IDLE))
        .build();
  }

  /** Formatted map */
  private String toString(Map<String, Long> map) {
    return map.entrySet().stream().map(Entry::toString).collect(joining("<br>"));
  }
}
