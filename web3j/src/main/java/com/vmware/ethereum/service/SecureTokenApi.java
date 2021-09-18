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

import com.vmware.ethereum.config.TokenConfig;
import java.io.IOException;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.Iterator;
import java.util.concurrent.CompletableFuture;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.model.SecurityToken;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;
import org.web3j.tx.gas.StaticGasProvider;
import org.web3j.utils.Async;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecureTokenApi {

  private final TokenConfig config;
  private final Web3j web3j;
  private final TransactionManager transactionManager;
  private final String senderAddress;
  private SecurityToken token;
  private String contractAddress;
  private Iterator<String> recipients;

  @PostConstruct
  public void init() {
    log.info("Client version: {}", getClientVersion());
    log.info("Gas price: {}", getGasPrice());
    log.info("Net version: {}", getNetVersion());
    log.info("Sender address: {}", senderAddress);
    recipients = cycle(config.getRecipients());

    token = deploy();
  }

  /** Deploy token. */
  @SneakyThrows(Exception.class)
  private SecurityToken deploy() {
    ContractGasProvider gasProvider =
        new StaticGasProvider(valueOf(config.getGasPrice()), valueOf(config.getGasLimit()));
    contractAddress = config.getContractAddress();
    if (!contractAddress.isBlank()) {
      log.info("Contract Address - {}", contractAddress);
      return SecurityToken.load(contractAddress, web3j, transactionManager, gasProvider);
    }
    log.info("Deploy: {}", config);
    BigInteger initialSupply = valueOf(config.getInitialSupply());
    SecurityToken securityToken =
        SecurityToken.deploy(
                web3j,
                transactionManager,
                gasProvider,
                config.getName(),
                config.getSymbol(),
                initialSupply)
            .send();

    securityToken
        .getTransactionReceipt()
        .ifPresent(
            receipt -> {
              log.info("Receipt: {}", receipt);
              contractAddress = receipt.getContractAddress();
            });
    return securityToken;
  }

  /** Transfer token for deferred polling. */
  public CompletableFuture<String> transferQueued() {
    Function function =
        new Function(
            "transfer",
            Arrays.asList(new Address(recipients.next()), new Uint256(valueOf(config.getAmount()))),
            Collections.emptyList());
    String txData = FunctionEncoder.encode(function);
    return Async.run(
        () ->
            transactionManager
                .sendTransaction(
                    valueOf(config.getGasPrice()),
                    valueOf(config.getGasLimit()),
                    contractAddress,
                    txData,
                    BigInteger.ZERO)
                .getTransactionHash());
  }

  /** Transfer token asynchronously. */
  public CompletableFuture<TransactionReceipt> transferAsync() {
    return token.transfer(recipients.next(), valueOf(config.getAmount())).sendAsync();
  }

  @SneakyThrows(IOException.class)
  public String getNetVersion() {
    return web3j.netVersion().send().getNetVersion();
  }

  @SneakyThrows(IOException.class)
  private BigInteger getGasPrice() {
    return web3j.ethGasPrice().send().getGasPrice();
  }

  @SneakyThrows(IOException.class)
  public String getClientVersion() {
    return web3j.web3ClientVersion().send().getWeb3ClientVersion();
  }

  /** Get current block number. */
  @SneakyThrows(IOException.class)
  public long getBlockNumber() {
    return web3j.ethBlockNumber().send().getBlockNumber().longValue();
  }

  /** Get token balance of the sender. */
  public long getSenderBalance() {
    return getBalance(senderAddress);
  }

  /** Get token balance of the recipient. */
  public long[] getRecipientBalance(String[] recipients) {
    long[] recipientBalances = new long[recipients.length];
    for (int i = 0; i < recipients.length; i++) {
      recipientBalances[i] = getBalance(recipients[i]);
    }
    return recipientBalances;
  }

  /** Get token balance of the given address. */
  @SneakyThrows(Exception.class)
  private long getBalance(String account) {
    return token.balanceOf(account).send().longValue();
  }
}
