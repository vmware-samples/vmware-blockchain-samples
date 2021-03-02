package com.vmware.ethereum.config;

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

import com.vmware.ethereum.config.Web3jConfig.Receipt;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.concurrent.CountDownLatch;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.web3j.abi.datatypes.Address;
import org.web3j.crypto.CipherException;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.WalletUtils;
import org.web3j.evm.Configuration;
import org.web3j.evm.EmbeddedWeb3jService;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.FastRawTransactionManager;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.response.NoOpProcessor;
import org.web3j.tx.response.PollingTransactionReceiptProcessor;
import org.web3j.tx.response.TransactionReceiptProcessor;

@Slf4j
@Component
@RequiredArgsConstructor
public class AppConfig {

  private final Web3jConfig config;

  @Bean
  public SSLSocketFactory sslSocketFactory() throws GeneralSecurityException {
    TrustManager[] trustManagers = InsecureTrustManagerFactory.INSTANCE.getTrustManagers();
    SSLContext sslContext = SSLContext.getInstance("TLS");
    sslContext.init(null, trustManagers, new SecureRandom());
    return sslContext.getSocketFactory();
  }

  @Bean
  public OkHttpClient okHttpClient(SSLSocketFactory sslSocketFactory) {
    TrustManager[] trustManagers = InsecureTrustManagerFactory.INSTANCE.getTrustManagers();
    OkHttpClient.Builder builder = new OkHttpClient.Builder();
    builder.sslSocketFactory(sslSocketFactory, (X509TrustManager) trustManagers[0]);
    builder.hostnameVerifier((hostname, session) -> true);
    builder.addInterceptor(new HttpLoggingInterceptor().setLevel(config.getLogLevel()));
    return builder.build();
  }

  @Bean
  public Credentials credentials() throws IOException, CipherException {
    Web3jConfig.Credentials credentials = config.getCredentials();

    String privateKey = credentials.getPrivateKey();
    if (!privateKey.isBlank()) {
      log.info("Creating credentials from private key ..");
      return Credentials.create(privateKey);
    }

    log.info("Loading credentials from wallet ..");
    return WalletUtils.loadCredentials(
        credentials.getWalletPassword(), credentials.getWalletFile());
  }

  @Bean
  public TransactionReceiptProcessor transactionReceiptProcessor(Web3j web3j) {
    Receipt receipt = config.getReceipt();
    if (receipt.isRequired()) {
      return new PollingTransactionReceiptProcessor(
          web3j, receipt.getInterval(), receipt.getAttempts());
    }

    return new NoOpProcessor(web3j);
  }

  @Bean
  public TransactionManager transactionManager(Web3j web3j, Credentials credentials) {
    int chainId = config.getEthClient().getChainId();
    if (config.isManageNonce()) {
      return new FastRawTransactionManager(web3j, credentials, chainId);
    }

    return new RawTransactionManager(web3j, credentials, chainId);
  }

  @Bean
  public Web3j web3j(OkHttpClient okHttpClient, Credentials credentials) {
    String url = config.getEthClient().getUrl();
    if (!url.isBlank()) {
      return Web3j.build(new HttpService(url, okHttpClient));
    }

    Configuration configuration = new Configuration(new Address(credentials.getAddress()), 10);
    return Web3j.build(new EmbeddedWeb3jService(configuration));
  }

  @Bean
  public CountDownLatch countDownLatch(WorkloadConfig config) {
    return new CountDownLatch(config.getTransactions());
  }

  @Bean
  public String senderAddress(Credentials credentials) {
    return credentials.getAddress();
  }
}
