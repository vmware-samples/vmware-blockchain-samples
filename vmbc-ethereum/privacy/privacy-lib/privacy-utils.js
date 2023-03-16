const proto = require('./wallet-api_pb.js')

function privacy_request_message_google_protobuf_2_json(gproto_message) {
    if (gproto_message.hasPrivacyWalletConfigRequest()) {
        const internal_req = gproto_message.getPrivacyWalletConfigRequest();
        return {
            privacy_wallet_config_request: {
                private_key: internal_req.getPrivateKey(),
                public_key: internal_req.getPublicKey(),
                public_application_config: internal_req.getPublicApplicationConfig(),
                user_id: internal_req.getUserId()
            }     
        };
    } else if (gproto_message.hasUserRegistrationRequest()) {
        return {
            user_registration_request: {}
        };
    } else if (gproto_message.hasUserRegistrationUpdateRequest()) {
        const internal_req = gproto_message.getUserRegistrationUpdateRequest();
        return {
            user_registration_update_request: {
                rcm_sig: internal_req.getRcmSig(),
                s2: internal_req.getS2List()
            }
        }
    } else if (gproto_message.hasGenerateMintTxRequest()) {
        return {
            generate_mint_tx_request: {
                amount: gproto_message.getGenerateMintTxRequest().getAmount()
            }
        };
    } else if (gproto_message.hasClaimCoinsRequest()) {
        const internal_req = gproto_message.getClaimCoinsRequest();
        return {
            claim_coins_request: {
                tx: internal_req.getTx(),
                sigs: internal_req.getSigsList(),
                type: internal_req.getType()
            }
        };
    } else if(gproto_message.hasGetStateRequest()) {
        return {
            get_state_request: {}
        };
    } else if (gproto_message.hasGenerateBurnTxRequest()) {
        return {
            generate_burn_tx_request: {
                amount: gproto_message.getGenerateBurnTxRequest().getAmount()
            }
        };

    } else if (gproto_message.hasGenerateTransferTxRequest()) { 
        return {
            generate_transfer_tx_request: {
                amount: gproto_message.getGenerateTransferTxRequest().getAmount(),
                recipient_pid: gproto_message.getGenerateTransferTxRequest().getRecipientPid(),
                recipient_public_key: gproto_message.getGenerateTransferTxRequest().getRecipientPublicKey()
            }
        };
    } else if (gproto_message.hasPrivacyAppConfig()) { 
        return {
            privacy_app_config: {
                budget: gproto_message.getPrivacyAppConfig().getBudget(),
                numValidators: gproto_message.getPrivacyAppConfig().getNumvalidators(),
                validatorPublicKey: gproto_message.getPrivacyAppConfig().getValidatorpublickeyList()
            }
        }
    }
    throw new Error("unknown grpc request")
}

function privacy_reply_message_json_2_google_protobuf(json_res) {
    let grpc_reply = new proto.PrivacyWalletResponse();
    if (json_res.hasOwnProperty('privacy_wallet_config_response')) {
        let internal_resp = new proto.PrivacyWalletConfigResponse();
        internal_resp.setSucc(json_res.privacy_wallet_config_response.succ);
        grpc_reply.setPrivacyWalletConfigResponse(internal_resp);
    } else if (json_res.hasOwnProperty('user_registration_response')) {
        let internal_resp = new proto.UserRegistrationResponse();
        internal_resp.setPid(json_res.user_registration_response.pid);
        internal_resp.setRcm1(Uint8Array.from(json_res.user_registration_response.rcm1));
        internal_resp.setRcm1Sig(Uint8Array.from(json_res.user_registration_response.rcm1_sig));
        grpc_reply.setUserRegistrationResponse(internal_resp);
    } else if (json_res.hasOwnProperty('user_registration_update_response')) {
        let internal_resp = new proto.UserRegistrationUpdateResponse();
        internal_resp.setSucc(json_res.user_registration_update_response.succ);
        grpc_reply.setUserRegistrationUpdateResponse(internal_resp);
    } else if (json_res.hasOwnProperty("generate_tx_response")) {
        let internal_resp = new proto.GenerateTxResponse();
        internal_resp.setTx(Uint8Array.from(json_res.generate_tx_response.tx));
        internal_resp.setFinal(json_res.generate_tx_response.final);
        internal_resp.setNumOfOutputCoins(json_res.generate_tx_response.num_of_output_coins);
        grpc_reply.setGenerateTxResponse(internal_resp);
    } else if (json_res.hasOwnProperty("claim_coins_response")) {
        let internal_resp = new proto.ClaimCoinsReponse();
        internal_resp.setSucc(json_res.claim_coins_response.succ);
        grpc_reply.setClaimCoinsResponse(internal_resp);
    } else if (json_res.hasOwnProperty("get_state_response")) {
        let internal_resp = new proto.GetStateResponse();
        internal_resp.setBudget(json_res.get_state_response.budget);
        internal_resp.setBalance(json_res.get_state_response.balance);
        internal_resp.setUserId(json_res.get_state_response.user_id);
        for (const [k, v] of Object.entries(json_res.get_state_response.coins)) {
            internal_resp.getCoinsMap().set(k, v);
        }
        grpc_reply.setGetStateResponse(internal_resp);
    } else if (json_res.hasOwnProperty("privacy_app_config_response")) {
        let internal_resp = new proto.PrivacyAppConfigResponse();
        internal_resp.setConfiguration(Uint8Array.from(json_res.privacy_app_config_response.configuration));
        grpc_reply.setPrivacyAppConfigResponse(internal_resp);
    } else if (json_res.hasOwnProperty("err")) {
        console.log(json_res, " - failed resp: ", err);
        grpc_reply.setErr(json_res.err);
    }
    return grpc_reply;
}

module.exports = {
    privacy_request_message_google_protobuf_2_json: privacy_request_message_google_protobuf_2_json,
    privacy_reply_message_json_2_google_protobuf: privacy_reply_message_json_2_google_protobuf,
}