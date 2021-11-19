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

import static com.vmware.ethereum.model.ReceiptMode.DEFERRED;
import static com.vmware.ethereum.model.ReceiptMode.IMMEDIATE;
import static com.vmware.ethereum.model.ReceiptMode.NONE;
import static io.grpc.ManagedChannelBuilder.forAddress;

import com.vmware.ethereum.config.Web3jConfig.Receipt;
import com.vmware.ethereum.model.ReceiptMode;
import com.vmware.ethereum.service.MetricsService;
import com.vmware.web3j.protocol.grpc.GrpcService;
import io.grpc.ManagedChannel;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.okhttp3.OkHttpConnectionPoolMetrics;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
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
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.Web3jService;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.exceptions.TransactionException;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.FastRawTransactionManager;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.response.Callback;
import org.web3j.tx.response.EmptyTransactionReceiptX;
import org.web3j.tx.response.GenericTransactionReceiptProcessor;
import org.web3j.tx.response.QueuingTransactionReceiptProcessor;
import org.web3j.tx.response.TransactionReceiptProcessor;

@Slf4j
@Component
@RequiredArgsConstructor
public class AppConfig {

  private final Web3jConfig config;

  private SSLSocketFactory sslSocketFactory() throws GeneralSecurityException {
    TrustManager[] trustManagers = InsecureTrustManagerFactory.INSTANCE.getTrustManagers();
    SSLContext sslContext = SSLContext.getInstance("TLS");
    sslContext.init(null, trustManagers, new SecureRandom());
    return sslContext.getSocketFactory();
  }

  private OkHttpClient okHttpClient() throws GeneralSecurityException {
    TrustManager[] trustManagers = InsecureTrustManagerFactory.INSTANCE.getTrustManagers();
    return new OkHttpClient.Builder()
        .sslSocketFactory(sslSocketFactory(), (X509TrustManager) trustManagers[0])
        .hostnameVerifier((hostname, session) -> true)
        .addInterceptor(new HttpLoggingInterceptor().setLevel(config.getLogLevel()))
        .build();
  }

  @Bean
  public Credentials credentials(TokenConfig config) {
    String privateKey = config.getPrivateKey();
    return Credentials.create(privateKey);
  }

  /** Callback handler for transaction receipt. */
  private Callback receiptHandler(MetricsService metrics) {
    return new Callback() {
      @Override
      public void accept(TransactionReceipt receipt) {
        log.trace("Receipt: {}", receipt);
        metrics.increment(receipt.getStatus());
      }

      @Override
      public void exception(Exception exception) {
        log.warn("{}", exception.toString());
        metrics.increment(exception);
      }
    };
  }

  @Bean
  public TransactionReceiptProcessor transactionReceiptProcessor(
      Web3j web3j, MetricsService metrics) {
    Receipt receipt = config.getReceipt();

    if (receipt.isDefer()) {
      return new QueuingTransactionReceiptProcessor(
          web3j, receiptHandler(metrics), receipt.getAttempts(), receipt.getInterval()) {

        /* Workaround for web3j issue 1548 */
        @Override
        public TransactionReceipt waitForTransactionReceipt(String transactionHash)
            throws IOException, TransactionException {
          super.waitForTransactionReceipt(transactionHash);
          return new EmptyTransactionReceiptX(transactionHash);
        }
      };
    }

    return new GenericTransactionReceiptProcessor(
        web3j, receipt.getInterval(), receipt.getAttempts());
  }

  @Bean
  public TransactionManager transactionManager(
      Web3j web3j,
      Credentials credentials,
      TransactionReceiptProcessor transactionReceiptProcessor) {

    int chainId = config.getEthClient().getChainId();

    if (config.isManageNonce()) {
      return new FastRawTransactionManager(
          web3j, credentials, chainId, transactionReceiptProcessor);
    }

    return new RawTransactionManager(web3j, credentials, chainId, transactionReceiptProcessor);
  }

  @Bean
  public Web3jService web3jService(MeterRegistry registry) throws GeneralSecurityException {
    Web3jConfig.EthClient ethClient = config.getEthClient();
    String protocol = ethClient.getProtocol();
    String host = ethClient.getHost();
    int port = ethClient.getPort();
    if (protocol.equals("grpc")) {
      ManagedChannel channel = forAddress(host, port).usePlaintext().build();
      return new GrpcService(channel);
    } else {
      String url = protocol + "://" + host + ":" + port;
      OkHttpClient httpClient = okHttpClient();
      new OkHttpConnectionPoolMetrics(httpClient.connectionPool()).bindTo(registry);
      return new HttpService(url, httpClient);
    }
  }

  @Bean
  public Web3j web3j(Web3jService web3jService) {
    return Web3j.build(web3jService);
  }

  @Bean
  public CountDownLatch countDownLatch(WorkloadConfig config) {
    return new CountDownLatch(config.getTransactions());
  }

  @Bean
  public String senderAddress(Credentials credentials) {
    return credentials.getAddress();
  }

  @Bean
  public SimpleMeterRegistry simpleMeterRegistry() {
    return new SimpleMeterRegistry();
  }

  @Bean
  public ReceiptMode receiptMode() {
    Receipt receipt = config.getReceipt();
    if (receipt.isDefer()) {
      return DEFERRED;
    }
    return receipt.getAttempts() == 0 ? NONE : IMMEDIATE;
  }
}
