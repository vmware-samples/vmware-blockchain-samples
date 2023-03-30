package com.vmware;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;
import org.json.JSONObject;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.ECKeyPair;
import org.web3j.crypto.Keys;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthGasPrice;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.gas.DefaultGasProvider;

import javax.net.ssl.*;
import java.io.FileReader;
import java.io.IOException;
import java.math.BigInteger;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

public class SampleDappHttps {

    public static void main(String[] args) throws Exception {
        FileReader fileReader = new FileReader("./config.json");
        StringBuilder stringBuilder = new StringBuilder();
        int character;
        while ((character = fileReader.read()) != -1) {
            stringBuilder.append((char) character);
        }
        String jsonString = stringBuilder.toString();

        // Parse the JSON string into a JSONObject
        JSONObject jsonObject = new JSONObject(jsonString);

        String endpointHost = jsonObject.getJSONObject("jsonrpc").getString("endpointHost");
        String httpPort = jsonObject.getJSONObject("jsonrpc").getJSONObject("ports").getString("http");

        String tlsMode = jsonObject.getJSONObject("tls").getString("mode");
        boolean jwtEnabled = jsonObject.getJSONObject("clientJwt").getBoolean("enabled");

        String rootCaCertPath = jsonObject.getJSONObject("tls").getString("serverCaCertPath");
        String clientKeyPath = jsonObject.getJSONObject("tls").getString("clientKeyPath");
        String clientCertPath = jsonObject.getJSONObject("tls").getString("clientCertPath");

        String rootCaPemString = Helper.getPemStringFromCertPath(rootCaCertPath);
        Certificate trustedCertificate = Helper.generateCertificateFromPemString(rootCaPemString);
        KeyStore trustStore = createEmptyKeyStore("secret".toCharArray());
        trustStore.setCertificateEntry("server-certificate", trustedCertificate);

        TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        trustManagerFactory.init(trustStore);
        TrustManager[] trustManagers = trustManagerFactory.getTrustManagers();

        SSLContext sslContext;
        if (tlsMode.equals("mutualTLS")) {
            String privateKeyContent = Files.readString(Paths.get(clientKeyPath), Charset.defaultCharset())
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replaceAll(System.lineSeparator(), "")
                .replace("-----END PRIVATE KEY-----", "");

            byte[] privateKeyAsBytes = Base64.getDecoder().decode(privateKeyContent);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyAsBytes);

            String certPath = clientCertPath;
            String clientPemString = Helper.getPemStringFromCertPath(certPath);
            Certificate certificateChain = Helper.generateCertificateFromPemString(clientPemString);

            KeyStore identityStore = createEmptyKeyStore("secret".toCharArray());
            identityStore.setKeyEntry("client", keyFactory.generatePrivate(keySpec), "secret".toCharArray(), new Certificate[]{certificateChain});

            KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
            keyManagerFactory.init(identityStore, "secret".toCharArray());
            KeyManager[] keyManagers = keyManagerFactory.getKeyManagers();

            sslContext = SSLContext.getInstance("TLS");
            sslContext.init(keyManagers, trustManagers, null);
        } else {
            sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustManagers, null);
        }

        OkHttpClient.Builder okHttpClientBuilder = new OkHttpClient.Builder();
        okHttpClientBuilder = okHttpClientBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustManagers[0])
                        .hostnameVerifier((hostname, session) -> true);

        if (jwtEnabled == true) {
            final String accessToken = Helper.getJwtFromOidc(jsonObject);
            okHttpClientBuilder = okHttpClientBuilder
            .addInterceptor(chain -> {
                Request request = chain.request().newBuilder()
                        .addHeader("Authorization", "Bearer " + accessToken)
                        .build();
                Response response = chain.proceed(request);
                return response.newBuilder()
                        // Retrieve the full response
                        .body(ResponseBody.create(response.body().bytes(), response.body().contentType()))
                        .build();
            });
        } else {
            okHttpClientBuilder = okHttpClientBuilder
            .addInterceptor(chain -> {
                Request request = chain.request().newBuilder()
                        .build();
                Response response = chain.proceed(request);
                return response.newBuilder()
                        // Retrieve the full response
                        .body(ResponseBody.create(response.body().bytes(), response.body().contentType()))
                        .build();
            });
	}
        
        OkHttpClient okHttpClient = okHttpClientBuilder.build();

        // Create the Web3j instance using the HttpService and the configured OkHttp client
        String httpsUrl = "https://" + endpointHost + ":" + httpPort;
        System.out.println("https url being used is: " + httpsUrl);
        HttpService httpService = new HttpService(httpsUrl, okHttpClient, true);
        Web3j web3j = Web3j.build(httpService);

        // Sample command 1
        EthGasPrice ethGasPrice = web3j.ethGasPrice().send();
        System.out.println(ethGasPrice.getRawResponse());

        // Create keypair
        ECKeyPair keyPair =  Keys.createEcKeyPair();
        Credentials credentials = Credentials.create(keyPair);

        // Deploy contract
        Incrementer incrementer = Incrementer.deploy(web3j,credentials, new DefaultGasProvider(), BigInteger.ONE).send();

        // Do write operation on contract
        TransactionReceipt tr = incrementer.increment(BigInteger.TWO).send();
        System.out.println("Successfully executed transaction. Transaction hash: " + tr.getTransactionHash());

        // Clear the connection pool
        okHttpClient.connectionPool().evictAll();
    }

    private static KeyStore createEmptyKeyStore(char[] keyStorePassword) throws CertificateException, NoSuchAlgorithmException, IOException, KeyStoreException {
        KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        keyStore.load(null, keyStorePassword);
        return keyStore;
    }
}

