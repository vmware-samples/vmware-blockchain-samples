package com.vmware.ethereum.controller;

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

import com.vmware.ethereum.config.Web3jConfig;
import com.vmware.ethereum.model.EthClientInfo;
import com.vmware.ethereum.service.ProgressService;
import com.vmware.ethereum.service.SecureTokenApi;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

@Controller
@RequiredArgsConstructor
public class MainController {

  private final Web3jConfig config;
  private final SecureTokenApi api;
  private final ProgressService service;

  @GetMapping("/")
  public String testReport(Model model) {
    model.addAttribute("progress", service.getProgress());
    return "report";
  }

  @ModelAttribute("ethInfo")
  public EthClientInfo getEthClientInfo() {
    EthClientInfo info = new EthClientInfo();
    Web3jConfig.EthClient ethClient = config.getEthClient();
    info.setClientUrl(
        ethClient.getProtocol() + "://" + ethClient.getHost() + ":" + ethClient.getPort());
    info.setClientVersion(api.getClientVersion());
    info.setNetworkVersion(api.getNetVersion());
    return info;
  }
}
