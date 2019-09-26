
import Common from "../common";
import {rejects} from "assert";
import * as zlib from "zlib";
import {array} from "prop-types";
import {isCombinedNodeFlagSet} from "tslint";

const cosSdk = require("cos-grpc-js");
const grpc = require("@improbable-eng/grpc-web").grpc;

// @ts-ignore
async function fetchSignedTrx(parameters: { privKey: any, ops: any, cId: string, apiHost: string}) {
    const {privKey, ops, cId, apiHost} = parameters;
    const tx = new cosSdk.transaction.transaction();
    const nonParamsRequest = new cosSdk.grpc.NonParamsRequest();
    // @ts-ignore
    return new Promise((resolve, reject) => {
            return grpc.unary(cosSdk.grpc_service.ApiService.GetChainState, {
                request: nonParamsRequest,
                host: apiHost,
                onEnd: (res: object) => {
                    try {
                        // @ts-ignore
                        const {status, statusMessage, headers, message, trailers} = res;
                        if (status === grpc.Code.OK && message) {
                            const chainState = message.toObject();
                            // @ts-ignore
                            tx.setRefBlockNum(chainState.state.dgpo.headBlockNumber & 0x7ff);
                            // @ts-ignore
                            const buffer = Buffer.from(chainState.state.dgpo.headBlockId.hash.toString(), "base64");
                            tx.setRefBlockPrefix(bytes2BigEndUint32(buffer.slice(8, 12)));
                            // @ts-ignore
                            const expiration = new cosSdk.raw_type.time_point_sec();
                            // @ts-ignore
                            expiration.setUtcSeconds(chainState.state.dgpo.time.utcSeconds + 30);
                            tx.setExpiration(expiration);
                            for (const op of ops) {
                                tx.addOperation(op);
                            }
                            const chainId = new cosSdk.raw_type.chain_id();
                            chainId.setChainEnv(cId);

                            const signTx = new cosSdk.transaction.signed_transaction();
                            signTx.setTrx(tx);
                            const s = signTx.sign(privKey, chainId);
                            const signature = new cosSdk.raw_type.signature_type();
                            signature.setSig(s);
                            signTx.setSignature(signature);
                            resolve(signTx);
                        } else {
                            reject(statusMessage);
                        }
                    } catch (err) {
                        console.log("error is", err);
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
    deployContract: async function(owner: string, contractName: string, abi: string, code: Uint8Array|string,
                                   privKey: string, desc: string, sourceCodeLocation: string, isToMainNet: boolean) {
        try {
            // create  deploy operation
            const contractOp = new cosSdk.operation.contract_deploy_operation();
            const creator = new cosSdk.raw_type.account_name();
            creator.setValue(owner);
            const conName = new cosSdk.raw_type.account_name();
            conName.setValue(contractName);
            contractOp.setOwner(creator);
            contractOp.setContract(contractName);
            contractOp.setUpgradeable(true);
            contractOp.setDescribe(desc);
            contractOp.setUrl(sourceCodeLocation);
            zlib.deflate(abi, function(err: Error | null, result: Buffer) {
                if (err) {
                    console.log("Fail to compress abi, the error is ", err);
                    return {
                        result: null,
                        errorCode: null,
                        errorMsg: "Fail to compress abi, the error is " + err,
                    };
                } else {
                    const abiArray = new Uint8Array(result);
                    contractOp.setAbi(abiArray);
                }
            });
            const wsam = code;
            let buf = wsam;
            if (typeof code === "string") {
                buf = Buffer.from(code, "hex");
            }
            if (wsam instanceof  Uint8Array) {
                buf  = Buffer.from(wsam);
            }
            zlib.deflate(buf, function(err: Error | null, result: Buffer) {
                if (err) {
                    console.log("Fail to compress wasm, the error is ", err);
                    return {
                        result: null,
                        errorCode: null,
                        errorMsg: "Fail to compress wsam, the error is " + err,
                    };
                } else {
                    const wsamArray = new Uint8Array(result);
                    contractOp.setCode(wsamArray);
                }
            });
            // Firstly fetch signed trx
            const apiHost = isToMainNet ? "http://mainnode.contentos.io" : "https://testnode.contentos.io";
            const txRes = await fetchSignedTrx({
                privKey: cosSdk.crypto.privKeyFromWIF(privKey),
                ops: [contractOp],
                cId: isToMainNet ? "main" : "test",
                apiHost: apiHost
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
                    host: apiHost,
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

const bytes2BigEndUint32 = function(byteArray: Buffer) {
    return (byteArray[3] | byteArray[2] << 8 | byteArray[1] << 16 | byteArray[0] << 24) >>> 0;
};
