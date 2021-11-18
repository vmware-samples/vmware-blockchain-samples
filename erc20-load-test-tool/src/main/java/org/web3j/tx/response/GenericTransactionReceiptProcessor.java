package org.web3j.tx.response;

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

import java.io.IOException;
import java.util.Optional;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.exceptions.TransactionException;

/**
 * This class combines the functionality of PollingTransactionReceiptProcessor and NoOpProcessor.
 */
public class GenericTransactionReceiptProcessor extends PollingTransactionReceiptProcessor {

  public GenericTransactionReceiptProcessor(Web3j web3j, long sleepDuration, int attempts) {
    super(web3j, sleepDuration, attempts);
  }

  public TransactionReceipt waitForTransactionReceipt(String transactionHash)
      throws IOException, TransactionException {
    return getTransactionReceipt(transactionHash, sleepDuration, attempts);
  }

  private TransactionReceipt getTransactionReceipt(
      String transactionHash, long sleepDuration, int attempts)
      throws IOException, TransactionException {

    // Don't attempt to get receipt.
    if (attempts == 0) {
      return new EmptyTransactionReceipt(transactionHash) {
        // Hack to bypass check done by Contract.executeTransaction()
        @Override
        public boolean isStatusOK() {
          return true;
        }
      };
    }

    for (int i = 0; i < attempts; i++) {
      Optional<? extends TransactionReceipt> receiptOptional =
          sendTransactionReceiptRequest(transactionHash);
      if (receiptOptional.isPresent()) {
        return receiptOptional.get();
      }

      // Sleep unless it is the last attempt.
      if (i < attempts - 1) {
        try {
          Thread.sleep(sleepDuration);
        } catch (InterruptedException e) {
          throw new TransactionException(e);
        }
      }
    }

    throw new TransactionException(
        "Transaction receipt was not generated after "
            + sleepDuration * (long) attempts / 1000L
            + " seconds for transaction: "
            + transactionHash,
        transactionHash);
  }
}
