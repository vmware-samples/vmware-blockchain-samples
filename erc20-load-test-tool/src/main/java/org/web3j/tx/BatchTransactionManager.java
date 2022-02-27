package org.web3j.tx;

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
import java.math.BigInteger;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.Request;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.tx.response.TransactionReceiptProcessor;

public class BatchTransactionManager extends FastRawTransactionManager {
  public BatchTransactionManager(
      Web3j web3j,
      Credentials credentials,
      long chainId,
      TransactionReceiptProcessor transactionReceiptProcessor) {
    super(web3j, credentials, chainId, transactionReceiptProcessor);
  }

  public Request<?, EthSendTransaction> sendTransactionRequest(
      BigInteger gasPrice,
      BigInteger gasLimit,
      String to,
      String data,
      BigInteger value,
      Web3j web3j)
      throws IOException {

    BigInteger nonce = getNonce();

    RawTransaction rawTransaction =
        RawTransaction.createTransaction(nonce, gasPrice, gasLimit, to, value, data);

    return web3j.ethSendRawTransaction(sign(rawTransaction));
  }
}
