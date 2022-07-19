package com.vmware.ethereum.model;

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

import static org.apache.commons.lang3.time.DurationFormatUtils.formatDurationWords;

import java.time.Duration;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class ProgressReport {

  private final ReceiptMode receiptMode;

  private final long txTotal;
  private final long txPending;

  private final String txStatus;
  private final String txErrors;

  private final String readStatus;
  private final String readErrors;

  private final String receiptStatus;
  private final String receiptErrors;

  private final Duration elapsedTime;
  private final Duration remainingTime;

  private final int concurrency;
  private final int batchSize;

  private final long averageThroughput;
  private final long averageLatency;

  private final long averageReadThroughput;
  private final long averageReadLatency;

  private final long activeConnections;
  private final long idleConnections;

  public String getElapsedTime() {
    return format(elapsedTime);
  }

  public String getRemainingTime() {
    return format(remainingTime);
  }

  /** Format duration as words. */
  private String format(Duration duration) {
    if (duration.isNegative()) {
      duration = Duration.ZERO;
    }
    return formatDurationWords(duration.toMillis(), true, true);
  }
}
