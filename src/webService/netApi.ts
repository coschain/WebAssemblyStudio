import Common from "../common";
import {rejects} from "assert";

const cosSdk = require("cos-grpc-js");
const grpc = require("@improbable-eng/grpc-web").grpc;

// @ts-ignore
async function fetchSignedTrx(parameters: { privKey: any, ops: any }) {
    const {privKey, ops} = parameters;
    const tx = new cosSdk.transaction.transaction();
    const nonParamsRequest = new cosSdk.grpc.NonParamsRequest();
    // @ts-ignore
    return new Promise((resolve, reject) => {
            return grpc.unary(cosSdk.grpc_service.ApiService.GetChainState, {
                request: nonParamsRequest,
                host: Common.getCurrentNodeAddress(),
                onEnd: (res: object) => {
                    try {
                        // @ts-ignore
                        const {status, statusMessage, headers, message, trailers} = res;
                        if (status === grpc.Code.OK && message) {
                            const chainState = message.toObject();
                            // @ts-ignore
                            tx.setRefBlockNum(chainState.state.dgpo.headBlockNumber & 0x7ff);
                            // @ts-ignore
                            tx.setRefBlockPrefix(chainState.state.dgpo.headBlockPrefix);
                            // @ts-ignore
                            const expiration = new cosSdk.raw_type.time_point_sec();
                            // @ts-ignore
                            expiration.setUtcSeconds(chainState.state.dgpo.time.utcSeconds + 30);
                            tx.setExpiration(expiration);
                            for (const op of ops) {
                                tx.addOperation(op);
                            }
                            const signTx = new cosSdk.transaction.signed_transaction();
                            signTx.setTrx(tx);
                            const s = signTx.sign(privKey);
                            const signature = new cosSdk.raw_type.signature_type();
                            signature.setSig(s);
                            signTx.setSignature(signature);
                            resolve(signTx);
                        } else {
                            reject(statusMessage);
                        }
                    } catch (err) {
                        reject(err);
                    }

                }
            });
        }
    ).then(signTx => {
        return {
            tx: signTx,
            err: null,
        };
    }).catch(err => {
        return {
            tx: null,
            err: err,
        };
    });
}

export default {
    cosSdk,
    fetchSignedTrx,
    deployContract: async function(owner: string, contractName: string, abi: string, code: Uint8Array|string, privKey: string) {
        try {
            // create  deploy operation
            const contractOp = new cosSdk.operation.contract_deploy_operation();
            const creator = new cosSdk.raw_type.account_name();
            creator.setValue(owner);
            const conName = new cosSdk.raw_type.account_name();
            conName.setValue(contractName);
            contractOp.setOwner(creator);
            contractOp.setContract(contractName);
            contractOp.setAbi(abi);
            let wsam = code;
            if (typeof code === "string") {
                const buffer = Buffer.from(code, "hex");
                wsam = new Uint8Array(buffer);
            }
            contractOp.setCode(wsam);
            // Firstly fetch signed trx
            const txRes = await fetchSignedTrx({
                privKey: cosSdk.crypto.privKeyFromWIF(privKey),
                ops: [contractOp]
            });
            if (txRes.tx == null) {
                return {
                    result: null,
                    errorCode: null,
                    errorMsg: txRes.err,
                };
            }
            const signedTx = txRes.tx;

            const txHash = signedTx.id().getHexHash();
            const req = new cosSdk.grpc.BroadcastTrxRequest();
            req.setOnlyDeliver(false);
            req.setTransaction(signedTx);
            return new Promise((resolve, reject) => {
                // @ts-ignore
                grpc.unary(cosSdk.grpc_service.ApiService.BroadcastTrx, {
                    request: req,
                    host: Common.getCurrentNodeAddress(),
                    onEnd: (res: object) => {
                        // @ts-ignore
                        const {status, statusMessage, headers, message, trailers} = res;
                        if (status === grpc.Code.OK && message && message.hasInvoice()) {
                            if (message.getInvoice().getStatus() === 200) {
                                resolve(message.getInvoice());
                            } else {
                                const err = {
                                    errCode: message.getInvoice().getStatus(),
                                    msg: message.getInvoice().getErrorInfo()
                                };
                                reject(err);
                            }
                        } else {
                            const err = {
                                errCode: status,
                                msg: statusMessage,
                            };
                            reject(err);
                        }
                    }
                });
            }).then((res) => {
                return {
                    result: txHash,
                    errorCode: null,
                    errorMsg: null,
                };
            }).catch((parameters: { errCode: any, msg: any }) => {
                const {errCode, msg} = parameters;
                return {
                    result: null,
                    errorCode: errCode,
                    errorMsg: msg,
                };
            });
        } catch (err) {
            return {
                result: null,
                errorCode: null,
                errorMsg: err,
            };
        }
    }
};
