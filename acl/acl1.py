# working version
import time
import json

# Import the Azure authentication library

from azure.identity import DefaultAzureCredential

## Import the control plane sdk

from azure.mgmt.confidentialledger import ConfidentialLedger as ConfidentialLedgerAPI
from azure.mgmt.confidentialledger.models import ConfidentialLedger

# import the data plane sdk

from azure.confidentialledger import ConfidentialLedgerClient
from azure.confidentialledger.certificate import ConfidentialLedgerCertificateClient

credential = DefaultAzureCredential()

resource_group = "ramki-rg"
ledger_name = "ramki-1"
subscription_id = "f35d6abf-f6a7-4497-932b-6ae59d168f63"

identity_url = "https://identity.confidential-ledger.core.azure.com"
ledger_url = "https://" + ledger_name + ".confidential-ledger.azure.com"

confidential_ledger_mgmt = ConfidentialLedgerAPI(
    credential, subscription_id
)

properties = {
    "location": "eastus",
    "tags": {},
    "properties": {
        "ledgerType": "Public",
        "aadBasedSecurityPrincipals": [
                {
                "principalId": "ddccdc5b-ec57-4da8-a30e-6d4a07c84a9a",
                # azure aad object id

                "tenantId": "46c98d88-e344-4ed4-8496-4ed7712e255d",
                "ledgerRoleName": "Administrator"
                }
        ],
    },
}

ledger_properties = ConfidentialLedger(**properties)

create = False

if (create == True):
    confidential_ledger_mgmt.ledger.begin_create(resource_group, ledger_name, ledger_properties)
    print("creating ledger ...")
    time.sleep(10)

myledger = confidential_ledger_mgmt.ledger.get(resource_group, ledger_name)

#print("Here are the details of your newly created ledger:")
#print (f"- Name: {myledger.name}")
#print (f"- Location: {myledger.location}")
#print (f"- ID: {myledger.id}")

'''
identity_client = ConfidentialLedgerCertificateClient(identity_url)
network_identity = identity_client.get_ledger_identity(
     ledger_id=ledger_name
)

ledger_tls_cert_file_name = "networkcert.pem"
with open(ledger_tls_cert_file_name, "w") as cert_file:
    cert_file.write(network_identity['ledgerTlsCertificate'])
'''

ledger_client = ConfidentialLedgerClient(
     endpoint=ledger_url, 
     credential=credential,
     ledger_certificate_path="tempcert.pem"
)

#entry = ledger_client.get_current_ledger_entry()
#print(f"Entry (transaction id = {entry['transactionId']}) in collection {entry['collectionId']}: {entry['contents']}")

with open("attestation-details.txt", "r") as file:
    file_content = file.read()

#print("File Content: \n{}\n".format(file_content));

post_poller = ledger_client.begin_create_ledger_entry(
        {"contents": "attestation-token:"+ file_content}
)
new_post_result = post_poller.result()
print("\n====================================================================")
print("          New Ledger Entry has been committed successfully           ");
print("====================================================================")
print(
  "Transaction ID: "
  f'{new_post_result["transactionId"]}'
)

transaction_id = new_post_result["transactionId"]
get_entry_poller = ledger_client.begin_get_ledger_entry(transaction_id)
get_entry_result = get_entry_poller.result()
print("\n====================================================================")
print("                          New Ledger Entry                           ");
print("====================================================================")
print(
  #f'At transaction id {get_entry_result["entry"]["transactionId"]}, the ledger entry '
  f'\'{get_entry_result["entry"]["contents"]}\''
)


print("\n====================================================================")
print("                        Transaction Receipt                         ");
print("====================================================================")
#create_entry_result = post_poller.result()
get_receipt_poller = ledger_client.begin_get_receipt(
        new_post_result["transactionId"]
)
get_receipt_result = get_receipt_poller.result()

with open("receipt.json", "w") as receipt_file:
    print(json.dumps(get_receipt_result, sort_keys=True, indent=2))
