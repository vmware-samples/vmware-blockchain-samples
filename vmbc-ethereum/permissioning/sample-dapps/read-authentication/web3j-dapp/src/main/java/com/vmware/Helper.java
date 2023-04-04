package com.vmware;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.File;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Base64;

import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import java.security.KeyStore;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;

class Helper {

    static String getPemStringFromCertPath(String certPath) {
        String pemCert = "";
        try {
            // Read in the .crt file
            FileInputStream fis = new FileInputStream(certPath);
            CertificateFactory cf = CertificateFactory.getInstance("X.509");
            X509Certificate cert = (X509Certificate)cf.generateCertificate(fis);
            fis.close();

            // Get the bytes of the certificate
            byte[] certBytes = cert.getEncoded();

            // Encode the bytes into a PEM-formatted string
            pemCert = "-----BEGIN CERTIFICATE-----\n";
            pemCert += Base64.getEncoder().encodeToString(certBytes);
            pemCert += "\n-----END CERTIFICATE-----";

        } catch (CertificateException | IOException e) {
            e.printStackTrace();
        }

        return pemCert;
    }

    static X509Certificate generateCertificateFromPemString(String pem) {
        try {
            byte[] bytes = pem.getBytes();
            ByteArrayInputStream bis = new ByteArrayInputStream(bytes);
            CertificateFactory certFactory = CertificateFactory.getInstance("X.509");
            X509Certificate cert = (X509Certificate) certFactory.generateCertificate(bis);
            return cert;
        } catch (CertificateException e) {
            e.printStackTrace();
            return null;
        }
    }

    static SSLContext createSslContext(String certPath) throws Exception {
        System.out.println();
        File crtFile = new File(certPath);
        Certificate certificate = CertificateFactory.getInstance("X.509").generateCertificate(new FileInputStream(crtFile));

        KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        keyStore.load(null, null);
        keyStore.setCertificateEntry("server", certificate);

        TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        trustManagerFactory.init(keyStore);

        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(null, trustManagerFactory.getTrustManagers(), null);

        return sslContext;
    }

    static String getJwtFromOidc(JSONObject jsonObject) throws Exception {
        String authServerPath = jsonObject.getJSONObject("tls").getString("authServerPath");
        String authDiscoveryUrl = jsonObject.getJSONObject("clientJwt").getString("authDiscoveryUrl");
        String authUsername = jsonObject.getJSONObject("clientJwt").getString("authUsername");
        String authPassword = jsonObject.getJSONObject("clientJwt").getString("authPassword");
        String clientId = jsonObject.getJSONObject("clientJwt").getString("clientId");

        String httpsEndpoint = authDiscoveryUrl + "/protocol/openid-connect/token";
        System.out.println("https endpoint is " + httpsEndpoint);
        URL url = new URL(httpsEndpoint);
        HttpsURLConnection con = (HttpsURLConnection) url.openConnection();
        SSLContext sslContext = createSslContext(authServerPath);
        con.setSSLSocketFactory(sslContext.getSocketFactory());
        con.setRequestMethod("POST");
        con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        con.setDoOutput(true);

        String data = "client_id=" + URLEncoder.encode(clientId, "UTF-8") + "&" +
                "username=" + URLEncoder.encode(authUsername, "UTF-8") + "&" +
                "password=" + URLEncoder.encode(authPassword, "UTF-8") + "&" +
                "grant_type=" + URLEncoder.encode("password", "UTF-8"); // the x-www-form-urlencoded data

        con.getOutputStream().write(data.getBytes("UTF8"));

        int responseCode = con.getResponseCode();
        System.out.println("Response Code : " + responseCode);

        InputStream inputStream = con.getInputStream();
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        StringBuilder responseBuilder = new StringBuilder();

        String line;
        while ((line = reader.readLine()) != null) {
            responseBuilder.append(line);
        }

        String response = responseBuilder.toString();
        System.out.println("Response : " + response);

        // Parse response to get access_token
        JSONObject jsonResponse = new JSONObject(response);
        return jsonResponse.getString("access_token");
    }
}
