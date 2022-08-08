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

import com.vmware.ethereum.config.WorkloadConfig;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;

@Slf4j
@RequiredArgsConstructor
public class WorkloadService {

  private final WorkloadCommand command;
  private final SecureTokenApi api;
  private final ArrayList<Web3j> web3j;
  private final ArrayList<Credentials> credentialsArrayList;
  private final WorkloadConfig workloadConfig;

  public void start() {
    Map<Integer, ArrayList<Credentials>> threadedCredentials = new HashMap<>();
    int credIndex = 0;
    for (Credentials cred : credentialsArrayList) {
      if (credIndex == workloadConfig.getConcurrency()) credIndex = 0;
      if (!threadedCredentials.containsKey(credIndex))
        threadedCredentials.put(credIndex, new ArrayList<>());
      threadedCredentials.get(credIndex).add(cred);
      credIndex++;
    }
    log.info("map threaded creds = {} ", threadedCredentials);
    Thread[] t = new Thread[workloadConfig.getConcurrency()];
    for (int i = 0; i < workloadConfig.getConcurrency(); i++) {
      t[i] =
          new Thread(
              new WorkloadThread(
                  command, web3j.get(i), api, workloadConfig, threadedCredentials.get(i)));
      t[i].start();
    }
    for (int i = 0; i < workloadConfig.getConcurrency(); i++) {
      try {
        t[i].join();
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }
    log.info("Transactions submitted");
  }

  public void stop() {
    // Do nothing
  }
}
