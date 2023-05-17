#https://learn.microsoft.com/en-us/azure/confidential-ledger/write-transaction-receipts
#https://learn.microsoft.com/en-us/azure/confidential-ledger/verify-write-transaction-receipts
#https://github.com/zhangchiqing/merkle-patricia-trie
#https://learn.microsoft.com/en-us/azure/confidential-ledger/quickstart-python?tabs=azure-cli

import time
from azure.identity import DefaultAzureCredential

## Import control plane sdk

from azure.mgmt.confidentialledger import ConfidentialLedger as ConfidentialLedgerAPI
from azure.mgmt.confidentialledger.models import ConfidentialLedger

# import data plane sdk

from azure.confidentialledger import ConfidentialLedgerClient
from azure.confidentialledger.certificate import ConfidentialLedgerCertificateClient

# Set variables

resource_group = "ramki"
ledger_name = "ramki-acl-test"
subscription_id = "d5642287-db0e-48da-9592-1b18ace8f084"

identity_url = "https://identity.confidential-ledger.core.azure.com"
ledger_url = "https://" + ledger_name + ".confidential-ledger.azure.com"

# Authentication

# Need to do az login to get default credential to work

credential = DefaultAzureCredential()

print(f"credential:", credential)

# Control plane (azure.mgmt.confidentialledger)
#
# initialize endpoint with credential and subscription

confidential_ledger_mgmt = ConfidentialLedgerAPI(
    credential, subscription_id
)

# Create properties dictionary for begin_create call

properties = {
    "location": "eastus",
    "tags": {},
    "properties": {
        "ledgerType": "Public",
        "aadBasedSecurityPrincipals": [],
    },
}

ledger_properties = ConfidentialLedger(**properties)

# Create a ledger

create_ledger = True
if (create_ledger == True):
  confidential_ledger_mgmt.ledger.begin_create(resource_group, ledger_name, ledger_properties)

# Get the details of the ledger you just created

print(f"{resource_group} / {ledger_name}")

if (create_ledger == True):
  print("Here are the details of your newly created ledger:")
else:
  print("Here are the details of your current ledger:")
myledger = confidential_ledger_mgmt.ledger.get(resource_group, ledger_name)

print (f"- Name: {myledger.name}")
print (f"- Location: {myledger.location}")
print (f"- ID: {myledger.id}")

# Data plane (azure.confidentialledger)
#
# Create a CL client

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

# Read from the ledger
latest_entry = ledger_client.get_current_ledger_entry()
print(f"Current entry (transaction id = {latest_entry['transactionId']}) in collection {latest_entry['collectionId']}: {latest_entry['contents']}")
old_transaction_id = latest_entry['transactionId']

# Write to the ledger
sample_entry = {"contents": "Hello world!"}
ledger_client.create_ledger_entry(entry=sample_entry)

# Read from the ledger
latest_entry = ledger_client.get_current_ledger_entry()
print(f"Current entry (transaction id = {latest_entry['transactionId']}) in collection {latest_entry['collectionId']}: {latest_entry['contents']}")
old_transaction_id = latest_entry['transactionId']

#If you'd like to wait for your write transaction to be committed to your ledger, you can use the begin_create_ledger_entry function. This will return a poller to wait until the entry is durably committed.
sample_entry = {"contents": "Hello world1!"}
ledger_entry_poller = ledger_client.begin_create_ledger_entry(
    entry=sample_entry
)
ledger_entry_result = ledger_entry_poller.result()
# Read from the ledger
latest_entry = ledger_client.get_current_ledger_entry()
print(f"Current entry (transaction id = {latest_entry['transactionId']}) in collection {latest_entry['collectionId']}: {latest_entry['contents']}")

get_entry_poller = ledger_client.begin_get_ledger_entry(
    transaction_id=ledger_entry_result['transactionId']
)
entry = get_entry_poller.result()
print(entry)

all_quotes = ledger_client.get_enclave_quotes()
print("current_node_id = ", all_quotes['currentNodeId'])
for x in all_quotes['enclaveQuotes']:
  print("node_id = ", x)
  print("\tquote = ", all_quotes['enclaveQuotes'][x])

all_entries = ledger_client.list_ledger_entries()
for x in all_entries:
    print(x)
