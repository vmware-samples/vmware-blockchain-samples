#https://github.com/Azure/azure-sdk-for-python/tree/main/sdk/confidentialledger/azure-confidentialledger
#https://github.com/Azure/azure-sdk-for-python/blob/97e27a184f5d186f337270557036197f0b2e07fa/sdk/confidentialledger/azure-confidentialledger/azure/confidentialledger/aio/_operations/_operations.py#L56
##Initialization

# Import the Azure authentication library

from azure.identity import DefaultAzureCredential

## Import the control plane sdk

from azure.mgmt.confidentialledger import ConfidentialLedger as ConfidentialLedgerAPI
from azure.mgmt.confidentialledger.models import ConfidentialLedger

# import the data plane sdk

from azure.confidentialledger import ConfidentialLedgerClient
from azure.confidentialledger.certificate import ConfidentialLedgerCertificateClient

#credential = DefaultAzureCredential()

from azure.identity import EnvironmentCredential

credential = EnvironmentCredential()

resource_group = "ramki"
subscription_id = "d5642287-db0e-48da-9592-1b18ace8f084"
identity_url = "https://identity.confidential-ledger.core.azure.com"
ledger_name = "ramki-acl1"
ledger_url = "https://" + ledger_name + ".confidential-ledger.azure.com"

##Use the data plane client library

identity_client = ConfidentialLedgerCertificateClient(identity_url)
network_identity = identity_client.get_ledger_identity(
     ledger_id=ledger_name
)

ledger_tls_cert_file_name = "networkcert.pem"
with open(ledger_tls_cert_file_name, "w") as cert_file:
    cert_file.write(network_identity['ledgerTlsCertificate'])

ledger_client = ConfidentialLedgerClient(
     endpoint=ledger_url, 
     credential=credential,
     ledger_certificate_path=ledger_tls_cert_file_name
)

consortium_members = ledger_client.list_consortium_members()
print(f"Consortium Members: consortium_members")

sample_entry = {"contents": "Hello world!"}
append_result = ledger_client.create_ledger_entry(entry=sample_entry)
print(append_result['transactionId'])

latest_entry = ledger_client.get_current_ledger_entry()
print(f"Current entry (transaction id = {latest_entry['transactionId']}) in collection {latest_entry['collectionId']}: {latest_entry['contents']}")

constitution = ledger_client.get_constitution()

latest_entry = ledger_client.get_current_ledger_entry()
print(f"Current entry (transaction id = {latest_entry['transactionId']}) in collection {latest_entry['collectionId']}: {latest_entry['contents']}")

sample_entry = {"contents": "Hello world!"}
append_result = ledger_client.create_ledger_entry(entry=sample_entry)
print(append_result['transactionId'])
