package com.vmware;

import io.reactivex.Flowable;
import org.reactivestreams.Subscription;
import io.reactivex.disposables.Disposable;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.Request;
import org.web3j.protocol.core.methods.response.EthBlock;
import org.web3j.protocol.core.methods.response.EthSubscribe;
import org.web3j.protocol.websocket.WebSocketClient;
import org.web3j.protocol.websocket.WebSocketListener;
import org.web3j.protocol.websocket.WebSocketService;
import org.web3j.protocol.websocket.events.LogNotification;

import javax.net.ssl.*;
import java.io.IOException;
import java.net.URI;
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
import java.util.Arrays;
import java.util.Base64;

import org.json.JSONObject;
import java.io.FileReader;

/* ----------- IMPORTANT NOTE:
As of now the "web3j" object is not used to consume subscription API's. Below are the reasons
1. VMBC doesn't support filter API's. 
2. We have to use web3j.blockFlowable() api ultimately which internally uses filter API's
--------------------------------------------------------------------------- */
public class SampleDappWss {

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
        String wsPort = jsonObject.getJSONObject("jsonrpc").getJSONObject("ports").getString("ws");

        String tlsMode = jsonObject.getJSONObject("tls").getString("mode");
        boolean jwtEnabled = jsonObject.getJSONObject("clientJwt").getBoolean("enabled");

        String rootCaCertPath = jsonObject.getJSONObject("tls").getString("serverCaCertPath");
        String clientKeyPath = jsonObject.getJSONObject("tls").getString("clientKeyPath");
        String clientCertPath = jsonObject.getJSONObject("tls").getString("clientCertPath");

        System.out.println("----------- mTLS over websocket example -------------");
        String rootCaPemString = Helper.getPemStringFromCertPath(rootCaCertPath);
        Certificate trustedCertificate = Helper.generateCertificateFromPemString(rootCaPemString);
        KeyStore trustStore = createEmptyKeyStore("secret".toCharArray());
        trustStore.setCertificateEntry("server-certificate", trustedCertificate);

        TrustManagerFactory trustManagerFactory = TrustManagerFactory
            .getInstance(TrustManagerFactory.getDefaultAlgorithm());
        trustManagerFactory.init(trustStore);
        TrustManager[] trustManagers = trustManagerFactory.getTrustManagers();

        SSLContext sslContext;
        if (tlsMode.equals("mutualTLS")) {
            String privateKeyContent = Files.readString(Paths.get(clientKeyPath),
                Charset.defaultCharset())
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
            identityStore.setKeyEntry("client", keyFactory.generatePrivate(keySpec), "secret".toCharArray(),
                    new Certificate[] { certificateChain });

            KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
            keyManagerFactory.init(identityStore, "secret".toCharArray());
            KeyManager[] keyManagers = keyManagerFactory.getKeyManagers();

            sslContext = SSLContext.getInstance("TLS");
            sslContext.init(keyManagers, trustManagers, null);
        } else {
            sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustManagers, null);
        }

        SSLSocketFactory sslSocketFactory = sslContext.getSocketFactory();

        String accessToken = Helper.getJwtFromOidc(jsonObject);

        String wssUrl = "wss://" + endpointHost + ":" + wsPort;
        System.out.println("wss url being used is: " + wssUrl);
        WebSocketClient webSocketClient = new WebSocketClient(new URI(wssUrl));
        if (jwtEnabled == true) {
            webSocketClient.addHeader("Authorization", "Bearer " + accessToken);
        }

        // Use SSL socket in websocket client
        webSocketClient.setSocketFactory(sslSocketFactory);
        LogWebSocketListener listener = new LogWebSocketListener();
        webSocketClient.setListener(listener);

        WebSocketService webSocketService = new WebSocketService(webSocketClient, true);

        webSocketService.connect();
        Web3j web3j = Web3j.build(webSocketService);

        // Subscribe "logs"
        Request<Object, EthSubscribe> req = new Request<>(
                "eth_subscribe",
                Arrays.asList("logs"),
                webSocketService,
                EthSubscribe.class);

        System.out.println("Params Id: " + req.getId());
        System.out.println("Params All: " + req.getParams());

        Flowable<LogNotification> events = webSocketService.subscribe(req, "eth_unsubscribe", LogNotification.class);
        final Disposable disposable = events.subscribe(event -> {
            System.out.println("Log hash: " + event.hashCode());
            System.out.println("Log method: " + event.getMethod());
            System.out.println("Log params: " + event.getParams());
            System.out.println("Log string: " + event.toString());
            System.out.println("Log blockNumber: " + event.getParams().getResult().getBlockNumber());
            System.out.println("Log Address: " + event.getParams().getResult().getAddress());
            System.out.println("Log blockHash: " + event.getParams().getResult().getBlockHash());
            System.out.println("Log TxHash: " + event.getParams().getResult().getTransactionHash());
            System.out.println("Log Topics: " + event.getParams().getResult().getTopics());
            System.out.println("Log subscription: " + event.getParams().getSubscription());
        });
    }

    private static KeyStore createEmptyKeyStore(char[] keyStorePassword)
            throws CertificateException, NoSuchAlgorithmException, IOException, KeyStoreException {
        KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        keyStore.load(null, keyStorePassword);
        return keyStore;
    }
}

class LogWebSocketListener implements WebSocketListener {
    @Override
    public void onMessage(String message) {
        System.out.println("Received message: " + message);
    }

    @Override
    public void onError(Exception e) {
        System.out.println("WebSocket error: " + e.getMessage());
    }

    @Override
    public void onClose() {
        System.out.println("WebSocket closed");
    }

}