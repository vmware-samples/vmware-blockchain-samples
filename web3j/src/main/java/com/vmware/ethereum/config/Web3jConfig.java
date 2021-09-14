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

import java.io.File;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import okhttp3.logging.HttpLoggingInterceptor.Level;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Setter
@Getter
@ToString
@Validated
@Configuration
@ConfigurationProperties("web3j")
public class Web3jConfig {

  @NotNull private EthClient ethClient;
  @NotNull private Credentials credentials;
  @NotNull private Receipt receipt;
  @NotNull private Level logLevel;
  @NotNull private boolean manageNonce;
  @NotNull private boolean queuedPolling;

  @Setter
  @Getter
  public static class EthClient {
    @NotBlank private String protocol;

    @NotBlank(message = "host cannot be blank, please enter a value")
    private String host;

    @NotNull private int port;
    @NotNull private int chainId;
  }

  @Setter
  @Getter
  public static class Credentials {
    @NotNull private File walletFile;
    @NotNull private String walletPassword;
    @NotNull private String privateKey;
  }

  @Setter
  @Getter
  public static class Receipt {

    @Positive private int attempts;
    @NotNull private long interval;
  }
}
