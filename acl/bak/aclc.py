#https://github.com/Azure/azure-sdk-for-python/tree/main/sdk/confidentialledger/azure-confidentialledger
##Initialization

# Import the Azure authentication library

from azure.identity import DefaultAzureCredential

## Import the control plane sdk

from azure.mgmt.confidentialledger import ConfidentialLedger as ConfidentialLedgerAPI
from azure.mgmt.confidentialledger.models import ConfidentialLedger

# import the data plane sdk

from azure.confidentialledger import ConfidentialLedgerClient
from azure.confidentialledger.certificate import ConfidentialLedgerCertificateClient

credential = DefaultAzureCredential()
subscription_id = "f35d6abf-f6a7-4497-932b-6ae59d168f63"

##Use the control plane client library
confidential_ledger_mgmt = ConfidentialLedgerAPI(
    credential, subscription_id
)

resource_group = "ramki-rg"
identity_url = "https://identity.confidential-ledger.core.azure.com"
ledger_name = "ramki-1"
ledger_url = "https://" + ledger_name + ".confidential-ledger.azure.com"

from azure.confidentialledger import ConfidentialLedgerClient
from azure.confidentialledger.certificate import ConfidentialLedgerCertificateClient
from azure.identity import DefaultAzureCredential

identity_client = ConfidentialLedgerCertificateClient()
network_identity = identity_client.get_ledger_identity(
    ledger_id="ramki-1"
)

ledger_tls_cert_file_name = "ledger_certificate.pem"
with open(ledger_tls_cert_file_name, "w") as cert_file:
    cert_file.write(network_identity["ledgerTlsCertificate"])

credential = DefaultAzureCredential()
ledger_client = ConfidentialLedgerClient(
    endpoint="https://ramki-1.confidential-ledger.azure.com",
    credential=credential,
    ledger_certificate_path=ledger_tls_cert_file_name
)

from azure.confidentialledger import ConfidentialLedgerClient
from azure.confidentialledger.certificate import ConfidentialLedgerCertificateClient
from azure.identity import DefaultAzureCredential

identity_client = ConfidentialLedgerCertificateClient()
network_identity = identity_client.get_ledger_identity(
    ledger_id="ramki-1"
)

ledger_tls_cert_file_name = "ledger_certificate.pem"
with open(ledger_tls_cert_file_name, "w") as cert_file:
    cert_file.write(network_identity["ledgerTlsCertificate"])

credential = DefaultAzureCredential()
ledger_client = ConfidentialLedgerClient(
    endpoint="https://ramki-1.confidential-ledger.azure.com",
    credential=credential,
    ledger_certificate_path=ledger_tls_cert_file_name
)

post_entry_result = ledger_client.create_ledger_entry(
        {"contents": "Hello world!"}
    )
transaction_id = post_entry_result["transactionId"]

wait_poller = ledger_client.begin_wait_for_commit(transaction_id)
wait_poller.wait()
print(f'Ledger entry at transaction id {transaction_id} has been committed successfully')

'''
properties = {
    "location": "eastus",
    "tags": {},
    "properties": {
        "ledgerType": "Public",
        "aadBasedSecurityPrincipals": [],
    },
}

ledger_properties = ConfidentialLedger(**properties)

myledger = confidential_ledger_mgmt.ledger.get(resource_group, ledger_name)
print("Here are the details of my current ledger:")
print (f"- Name: {myledger.name}")
print (f"- Location: {myledger.location}")
print (f"- ID: {myledger.id}")

exception_path = False
try:
    confidential_ledger_mgmt.ledger.begin_create(resource_group, ledger_name, ledger_properties)
except:
    print("exception")
    exception_path = True
if (exception_path):
    print("Here are the details of my already created ledger:")
else:
    print("Here are the details of my newly created ledger:")
myledger = confidential_ledger_mgmt.ledger.get(resource_group, ledger_name)
print (f"- Name: {myledger.name}")
print (f"- Location: {myledger.location}")
print (f"- ID: {myledger.id}")

confidential_ledger_mgmt.ledger.begin_delete(resource_group, ledger_name)
print("Here are the details of my deleted ledger:")
print (f"- Name: {myledger.name}")
print (f"- Location: {myledger.location}")
print (f"- ID: {myledger.id}")
'''
