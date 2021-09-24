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

import static io.grpc.ManagedChannelBuilder.forAddress;
import static java.time.Duration.between;
import static java.time.Instant.now;

import com.vmware.ethereum.config.Web3jConfig.Receipt;
import com.vmware.ethereum.service.MetricsService;
import com.vmware.ethereum.service.TimedWrapper.PollingTransactionReceiptProcessor;
import com.vmware.web3j.protocol.grpc.GrpcService;
import io.grpc.ManagedChannel;
import io.micrometer.core.aop.TimedAspect;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tag;
import io.micrometer.core.instrument.Tags;
import io.micrometer.core.instrument.binder.okhttp3.OkHttpConnectionPoolMetrics;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.function.Function;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.web3j.crypto.CipherException;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.WalletUtils;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.Web3jService;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.FastRawTransactionManager;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.response.Callback;
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

  private OkHttpClient okHttpClient(MeterRegistry registry) throws GeneralSecurityException {
    TrustManager[] trustManagers = InsecureTrustManagerFactory.INSTANCE.getTrustManagers();
    OkHttpClient.Builder builder = new OkHttpClient.Builder();
    new OkHttpConnectionPoolMetrics(builder.getConnectionPool$okhttp()).bindTo(registry);
    builder.sslSocketFactory(sslSocketFactory(), (X509TrustManager) trustManagers[0]);
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
  @ConditionalOnProperty(value = "web3j.queued-polling", havingValue = "true")
  public TransactionReceiptProcessor queuedTransactionReceiptProcessor(
      Web3j web3j,
      CountDownLatch countDownLatch,
      MetricsService metrics,
      Map<String, Instant> txTime) {
    Receipt receipt = config.getReceipt();
    return new QueuingTransactionReceiptProcessor(
        web3j,
        new Callback() {
          @Override
          public void accept(TransactionReceipt transactionReceipt) {
            log.debug("Receipt: {}", transactionReceipt);
            Duration duration = between(txTime.get(transactionReceipt.getTransactionHash()), now());
            metrics.record(duration, transactionReceipt.getStatus());
            countDownLatch.countDown();
          }

          @Override
          public void exception(Exception exception) {
            metrics.record(Duration.ZERO, exception);
            countDownLatch.countDown();
          }
        },
        receipt.getAttempts(),
        receipt.getInterval());
  }

  @Bean
  public TransactionReceiptProcessor transactionReceiptProcessor(Web3j web3j) {
    Receipt receipt = config.getReceipt();
    return new PollingTransactionReceiptProcessor(
        web3j, receipt.getInterval(), receipt.getAttempts());
  }

  @Bean
  public TransactionManager web3jTransactionManager(
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
      return new HttpService(url, okHttpClient(registry));
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
  public TimedAspect timedAspect(MeterRegistry registry) {
    Function<ProceedingJoinPoint, Iterable<Tag>> tagsBasedOnJoinPoint = pjp -> Tags.empty();
    return new TimedAspect(registry, tagsBasedOnJoinPoint);
  }

  @Bean
  public SimpleMeterRegistry simpleMeterRegistry() {
    return new SimpleMeterRegistry();
  }

  @Bean
  public Map<String, Instant> txTime() {
    return new HashMap<>();
  }
}
