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

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;
import okio.Buffer;

import java.io.IOException;

@Slf4j
public class CorrelationInterceptor implements Interceptor {

  private String prefix;

  public CorrelationInterceptor(String prefix) {
    this.prefix = prefix;
  }

  @SneakyThrows
  @Override
  public Response intercept(Chain chain) throws IOException {
    Request request = chain.request();
    Buffer requestBuffer = new Buffer();
    request.body().writeTo(requestBuffer);
    String payload = requestBuffer.readUtf8();
    JSONParser parser = new JSONParser(777);
    JSONObject json = (JSONObject) parser.parse(payload);
    String cid = this.prefix + json.get("id").toString();
    log.info("payload - {}", cid);

    Request newRequest = request.newBuilder().addHeader("cid", cid).build();
    return chain.proceed(newRequest);
  }
}
