from azure.identity import DefaultAzureCredential
from azure.confidentialledger import ConfidentialLedgerClient
from azure.confidentialledger.certificate import ConfidentialLedgerCertificateClient

identity_client = ConfidentialLedgerCertificateClient()
network_identity = identity_client.get_ledger_identity(
    ledger_id="ramki-acl1"
    )

ledger_tls_cert_file_name = "ledger_certificate.pem"
with open(ledger_tls_cert_file_name, "w") as cert_file:
    cert_file.write(network_identity["ledgerTlsCertificate"])

credential = DefaultAzureCredential()
ledger_client = ConfidentialLedgerClient(
    endpoint="https://ramki-acl1.confidential-ledger.azure.com",
    credential=credential,
    ledger_certificate_path=ledger_tls_cert_file_name
)

# Add a user with the contributor role
# Other possible roles are Contributor and Administrator
user_id = "PEM certficate fingerprint"
user = ledger_client.create_or_update_user(
    user_id, {"assignedRole": "Contributor"}
)

# Get the user and check their properties
user = ledger_client.get_user(user_id)
assert user["userId"] == user_id
assert user["assignedRole"] == "Contributor"

# Delete the user
ledger_client.delete_user(user_id)
