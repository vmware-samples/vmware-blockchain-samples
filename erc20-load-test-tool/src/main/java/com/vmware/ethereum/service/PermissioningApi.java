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

import com.vmware.ethereum.config.PermissioningConfig;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.model.Permissioning;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.gas.ContractGasProvider;
import org.web3j.tx.gas.StaticGasProvider;

@Slf4j
@Service
@RequiredArgsConstructor
public class PermissioningApi {
  private final Web3j web3j;
  private final PermissioningConfig config;
  private Permissioning contract;
  private String contractAddress;
  private ContractGasProvider gasProvider;
  private final List<byte[]> readWriteKeccak = new ArrayList<>();

  @PostConstruct
  public void init() throws Exception {

    Transaction tx = Transaction.createEthCallTransaction(null, null, null);
    BigInteger gasEstimate = web3j.ethEstimateGas(tx).send().getAmountUsed();
    BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();
    gasProvider = new StaticGasProvider(gasPrice, gasEstimate);

    // Contract address from config
    if (!config.getContractAddress().isEmpty()) {
      contractAddress = config.getContractAddress();
      Credentials credentials = Credentials.create(config.getSuperAdmins()[0]);
      contract = Permissioning.load(contractAddress, web3j, credentials, gasProvider);
      readWriteKeccak.add(READER_ROLE());
      readWriteKeccak.add(WRITER_ROLE());
    }
  }

  public TransactionReceipt getReadWritePermission(String newUser, Credentials credentials)
      throws Exception {
    contract = Permissioning.load(contractAddress, web3j, credentials, gasProvider);
    return contract.addUser(newUser, readWriteKeccak).send();
  }

  public TransactionReceipt approvePermission(String newUser, Credentials approverCreds)
      throws Exception {
    contract = Permissioning.load(contractAddress, web3j, approverCreds, gasProvider);
    return contract.approveUserRequest(newUser).send();
  }

  public Boolean checkWritePermission(Credentials writerCreds) throws Exception {
    contract = Permissioning.load(contractAddress, web3j, writerCreds, gasProvider);
    return contract.isWriter().send();
  }

  public Boolean checkReadPermission(Credentials readerCreds) throws Exception {
    contract = Permissioning.load(contractAddress, web3j, readerCreds, gasProvider);
    return contract.isViewer().send();
  }

  public byte[] READER_ROLE() throws Exception {
    return contract.READER_ROLE().send();
  }

  public byte[] WRITER_ROLE() throws Exception {
    return contract.WRITER_ROLE().send();
  }
}
