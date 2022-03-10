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

import static java.math.BigInteger.valueOf;

import com.vmware.ethereum.config.DatabaseConfig;
import com.vmware.ethereum.config.TokenConfig;
import com.vmware.ethereum.model.Contract;
import java.math.BigInteger;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.sql2o.Connection;
import org.sql2o.Sql2o;
import org.web3j.crypto.Credentials;
import org.web3j.model.SecurityToken;
import org.web3j.protocol.Web3j;
import org.web3j.tx.gas.ContractGasProvider;
import org.web3j.tx.gas.StaticGasProvider;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecureTokenFactory {

  private final TokenConfig tokenConfig;
  private final DatabaseConfig dbConfig;
  private final Web3j web3j;
  private final Credentials credentials;

  /** Get SecureToken contract either by loading or deploying. */
  @SneakyThrows(Exception.class)
  public SecurityToken getSecureToken(BigInteger gasEstimate, BigInteger gasPrice) {

    ContractGasProvider gasProvider = new StaticGasProvider(gasPrice, gasEstimate);

    // Contract address from config
    String contractAddress = tokenConfig.getContractAddress();

    // Contract address from DB.
    if (!dbConfig.getUrl().isBlank()) {
      contractAddress = getContractAddress();
    }

    if (!contractAddress.isBlank()) {
      log.info("Loading token from address {} ..", contractAddress);
      return SecurityToken.load(contractAddress, web3j, credentials, gasProvider);
    }

    log.info("Deploying token {} ..", tokenConfig.getSymbol());

    return SecurityToken.deploy(
            web3j,
            credentials,
            gasProvider,
            tokenConfig.getName(),
            tokenConfig.getSymbol(),
            valueOf(tokenConfig.getInitialSupply()))
        .send();
  }

  /** Get contract address from DB. */
  private String getContractAddress() {
    Sql2o sql2o = new Sql2o(dbConfig.getUrl(), dbConfig.getUsername(), dbConfig.getPassword());
    String sql = "SELECT * FROM contract WHERE attributes -> 'name' = 'GenericSecurityToken';";

    try (Connection con = sql2o.open()) {
      Contract contract = con.createQuery(sql).executeAndFetchFirst(Contract.class);
      return contract.getAddress().substring(2);
    }
  }
}
