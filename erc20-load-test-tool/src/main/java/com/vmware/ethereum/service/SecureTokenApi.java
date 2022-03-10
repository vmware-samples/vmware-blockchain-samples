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

import static com.google.common.collect.Iterators.cycle;
import static java.math.BigInteger.valueOf;
import static java.util.Objects.requireNonNull;
import static org.springframework.util.ReflectionUtils.findField;
import static org.springframework.util.ReflectionUtils.setField;

import com.vmware.ethereum.config.TokenConfig;
import java.io.IOException;
import java.lang.reflect.Field;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Iterator;
import java.util.concurrent.CompletableFuture;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.web3j.model.SecurityToken;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.BatchRequest;
import org.web3j.protocol.core.BatchResponse;
import org.web3j.protocol.core.Request;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.tx.BatchTransactionManager;
import org.web3j.tx.TransactionManager;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecureTokenApi {

  private final TokenConfig config;
  private final Web3j web3j;
  private final TransactionManager transactionManager;
  private final BatchTransactionManager batchTransactionManager;
  private final SecureTokenFactory tokenFactory;
  private final String senderAddress;
  private SecurityToken token;
  private Iterator<String> recipients;
  private BigInteger gasEstimate;
  private BigInteger gasPrice;
  private String contractAddress;

  @PostConstruct
  public void init() throws IOException {
    log.info("Client version: {}", getClientVersion());
    log.info("Net version: {}", getNetVersion());
    log.info("Sender address: {}", senderAddress);
    recipients = cycle(config.getRecipients());

    setGas();
    log.info("Gas Estimate {}", gasEstimate);
    log.info("Gas Price {}", gasPrice);

    token = tokenFactory.getSecureToken(gasEstimate, gasPrice);
    token
        .getTransactionReceipt()
        .ifPresent(
            receipt -> {
              log.info("Receipt: {}", receipt);
            });
    contractAddress = token.getContractAddress();
    setTransactionManager();
  }

  /**
   * This is a hack. We want contract deployment to use PollingTransactionReceiptProcessor, but
   * override it later for token transfers to use NoOpProcessor or
   * QueuingTransactionReceiptProcessor if configured.
   */
  private void setTransactionManager() {
    Field field = requireNonNull(findField(SecurityToken.class, "transactionManager"));
    field.setAccessible(true);
    setField(field, token, transactionManager);
  }

  /** Sets gasEstimate and gasPrice. */
  private void setGas() throws IOException {
    Transaction tx = Transaction.createEthCallTransaction(null, null, null);
    gasEstimate = web3j.ethEstimateGas(tx).send().getAmountUsed();
    gasPrice = web3j.ethGasPrice().send().getGasPrice();
  }

  /** Creates token transfer transaction request. */
  public Request<?, EthSendTransaction> createTransaction() throws IOException {
    String txData =
        token.transfer(recipients.next(), valueOf(config.getAmount())).encodeFunctionCall();
    log.debug("txData - {}", txData);
    return batchTransactionManager.sendTransactionRequest(
        gasPrice, gasEstimate, contractAddress, txData, BigInteger.ZERO, web3j);
  }

  /** Adds transaction request to the batch. */
  @SneakyThrows(IOException.class)
  public void addBatchRequests(BatchRequest batchRequest) {
    batchRequest.add(createTransaction());
    log.debug("batched-requests {}", batchRequest.getRequests());
  }

  /** Transfer Batched transactions asynchronously. */
  public CompletableFuture<BatchResponse> transferBatchAsync(BatchRequest batchRequest) {
    log.debug("inside transfer batch async");
    return batchRequest.sendAsync();
  }

  public String getNetVersion() {
    try {
      return web3j.netVersion().send().getNetVersion();
    } catch (Exception e) {
      log.warn("{}", e.getMessage());
      return "Unknown";
    }
  }

  public String getClientVersion() {
    try {
      return web3j.web3ClientVersion().send().getWeb3ClientVersion();
    } catch (Exception e) {
      log.warn("{}", e.getMessage());
      return "Unknown";
    }
  }

  /** Get current block number. */
  public long getBlockNumber() {
    try {
      return web3j.ethBlockNumber().send().getBlockNumber().longValue();
    } catch (Exception e) {
      log.warn("{}", e.getMessage());
      return 0;
    }
  }

  /** Get token balance of the sender. */
  public long getSenderBalance() {
    return getBalance(senderAddress);
  }

  /** Get token balance of the recipients. */
  public long[] getRecipientBalance() {
    return Arrays.stream(config.getRecipients()).mapToLong(this::getBalance).toArray();
  }

  /** Get token balance of the given address. */
  private long getBalance(String account) {
    try {
      return token.balanceOf(account).send().longValue();
    } catch (Exception e) {
      log.warn("{}", e.getMessage());
      return 0;
    }
  }
}
