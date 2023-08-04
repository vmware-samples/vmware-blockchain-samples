# generate a private key with the correct length
openssl genrsa -out private-key.pem 3072

# generate corresponding public key
openssl rsa -in private-key.pem -pubout -out public-key.pem

# optional: create a self-signed certificate
openssl req -new -x509 -key private-key.pem -out cert.pem -days 360
