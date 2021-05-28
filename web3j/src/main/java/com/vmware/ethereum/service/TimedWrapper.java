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

import static com.vmware.ethereum.service.MetricsConstant.TOKEN_RECEIPT_METRIC_NAME;

import io.micrometer.core.annotation.Timed;
import java.io.IOException;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.exceptions.TransactionException;
import org.web3j.tx.response.Callback;

@Service
public class TimedWrapper {

  public static class PollingTransactionReceiptProcessor
      extends org.web3j.tx.response.PollingTransactionReceiptProcessor {

    public PollingTransactionReceiptProcessor(Web3j web3j, long sleepDuration, int attempts) {
      super(web3j, sleepDuration, attempts);
    }

    @Timed(value = TOKEN_RECEIPT_METRIC_NAME)
    @Override
    public TransactionReceipt waitForTransactionReceipt(String transactionHash)
        throws IOException, TransactionException {
      return super.waitForTransactionReceipt(transactionHash);
    }
  }

  public static class QueuingTransactionReceiptProcessor
      extends org.web3j.tx.response.QueuingTransactionReceiptProcessor {

    public QueuingTransactionReceiptProcessor(
        Web3j web3j, Callback callback, int pollingAttemptsPerTxHash, long pollingFrequency) {
      super(web3j, callback, pollingAttemptsPerTxHash, pollingFrequency);
    }

    @Timed(value = TOKEN_RECEIPT_METRIC_NAME)
    @Override
    public TransactionReceipt waitForTransactionReceipt(String transactionHash)
        throws IOException, TransactionException {
      return super.waitForTransactionReceipt(transactionHash);
      // TransactionReceipt tr = new TransactionReceipt();
      // tr.setTransactionHash(transactionHash);
      // return tr;
    }
  }
}
