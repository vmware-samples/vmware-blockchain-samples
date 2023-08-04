from azure.identity import ClientSecretCredential
from azure.confidentialledger import ConfidentialLedgerClient
#from azure.confidentialledger.identity_service import ConfidentialLedgerIdentityServiceClient
from azure.confidentialledger import ConfidentialLedgerClient
#from azure.confidentialledger import (
#    LedgerUserRole,
#    TransactionState,
#)

# Create Identity Service Client
identity_client = ConfidentialLedgerIdentityServiceClient("https://identity.accledger.azure.com/")

# Get NetworkIdentity Object for LedgerName
if identity_client is not None:
    network_identity = identity_client.get_ledger_identity(
        ledger_id="ramki-1"
    )

    # Write network cert to file
    ledger_tls_cert_file_name = "ledger_certificate.pem"
    with open(ledger_tls_cert_file_name, "w") as cert_file:
        cert_file.write(network_identity.ledger_tls_certificate)
        #print(network_identity.ledger_tls_certificate)

    # Create Token Credential Artifacts
    resource = "https://ramki-1.eastus.cloudapp.azure.com"
    clientId = "99b0057a-59b4-4902-9886-70e11d55f8d9"
    clientSecret = ""
    tenantId = "46c98d88-e344-4ed4-8496-4ed7712e255d"
    authority_url = "https://login.microsoftonline.com/" + tenantId

    # Create a Credential Object
    credentials = ClientSecretCredential(tenant_id=tenantId, client_id=clientId, client_secret=clientSecret)
    print(credentials.get_token("https://confidential-ledger.azure.com/.default"))
    # Create LedgerClient object
    ledger_client = ConfidentialLedgerClient("https://ramki-1.eastus.cloudapp.azure.com", DefaultAzureCredential(), ledger_tls_cert_file_name)

    # Alternatively, a client may wait when appending.
    append_result = ledger_client.append_to_ledger(
        entry_contents="Hello world, again!", wait_for_commit=True
    )
    # print Transaction ID
    print(append_result.transaction_id)
    
    receipt = ledger_client.get_transaction_receipt(
        transaction_id=append_result.transaction_id
    )
    print(receipt.contents)


    # Append Entry to Ledger
    append_result = ledger_client.append_to_ledger(
        entry_contents="Hello world, again2!", wait_for_commit=True
    )
    # print Transaction ID
    print(append_result.transaction_id)

    # Validate above entry
    entry = ledger_client.get_ledger_entry(transaction_id=append_result.transaction_id)
    print(entry.contents)
    assert entry.contents == "Hello world, again2!"
else:
    print("Not a valid ledger")
