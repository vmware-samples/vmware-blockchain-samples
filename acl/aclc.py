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

resource_group = "ramki"
subscription_id = "d5642287-db0e-48da-9592-1b18ace8f084"
identity_url = "https://identity.confidential-ledger.core.azure.com"
ledger_name = "ramki-acl1"
ledger_url = "https://" + ledger_name + ".confidential-ledger.azure.com"

##Use the control plane client library

confidential_ledger_mgmt = ConfidentialLedgerAPI(
    credential, subscription_id
)

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

'''
ledger_name = "ramki-acl1"
ledger_url = "https://" + ledger_name + ".confidential-ledger.azure.com"
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
