import Common from "../src/common";

class ContractInfo {
    contractName: string; // the contract name
    abi: string; // the created abi
    code: Uint8Array|string; // the created wsam
}

const contractMap = new Map<string, ContractInfo>();
const defContName = "defaultContract";
const contractNameCacheKey = "contractNameKey";
const privateKeyCacheKey = "privateKey";
const accountNameCacheKey = "accountKey";

export class ContractUtil {
     static createContractFromInfo(name: string, abi: string, code: Uint8Array|string): ContractInfo|null {
         if (name.length > 0) {
            const contract = new ContractInfo();
            contract.contractName = name;
            if (abi.length) {
                contract.abi = abi;
            }
            if (typeof code === "string") {
                if (code.length > 0) {
                    contract.code = code;
                }
            } else if (code.byteLength > 0) {
                contract.code = code;
            }
            return contract;
        }
         return null;
    }
    // update abi and wsam of contract which name is defaultContract ,if the ContractInfo
    // of defaultContract not exist create it
    static addNewContractInfo( abi: string, code: ArrayBuffer): void {
         const name = defContName;
         const wsam = new Uint8Array(code);
        // @ts-ignore
         let contract = null;
         if (contractMap.has(name)) {
            contract = contractMap.get(name);
            if (abi.length > 0) {
                contract.abi = abi;
            }
            if (wsam.byteLength)  {
                contract.code = wsam;
            }
        } else {
            contract = ContractUtil.createContractFromInfo(name, abi, wsam);
        }
         if (contract != null) {
            contractMap.set(name, contract);
        }
    }

    // remove local contact by contract name
    static removeContractByName(name: string): void {
        if (name.length > 0 && contractMap.has(name)) {
            contractMap.delete(name);
        }
    }
    // get local contact by contract name
    static getContractByName(name: string): ContractInfo|null {
        if (name.length > 0 && contractMap.has(name)) {
            return contractMap.get(name);
        }
        return null;
    }
    // update name of local default contract
    static updateDefaultContractName(name: string): void {
         if (!Common.judgeStrIsEmpty(name) && name !== defContName && !contractMap.has(name) && contractMap.has(defContName)) {
             const contract = contractMap.get(defContName);
             contractMap.set(name, contract);
             contractMap.delete(defContName);
         }
    }
}

export function saveContractName(name: string) {
    if (!Common.judgeStrIsEmpty(name) && sessionStorage.getItem(contractNameCacheKey) == null) {
        sessionStorage.setItem(contractNameCacheKey, name);
    }
}

export function mdCacheContractName(name: string) {
    if (!Common.judgeStrIsEmpty(name)) {
        if (sessionStorage.getItem(contractNameCacheKey))  {
            sessionStorage.setItem(contractNameCacheKey, name);
        } else {
            saveContractName(name);
        }
    }
}

export function rmCachedContractName() {
    if (sessionStorage.getItem(contractNameCacheKey)) {
        sessionStorage.removeItem(contractNameCacheKey);
    }
}

export function getCachedContractName(): string|null {
    return sessionStorage.getItem(contractNameCacheKey);
}

export function savePrivateKey(priKey: string) {
    if (!Common.judgeStrIsEmpty(priKey) && sessionStorage.getItem(privateKeyCacheKey) == null) {
        sessionStorage.setItem(privateKeyCacheKey, priKey);
    }
}

export function rmCachedPrivateKey() {
    if (sessionStorage.getItem(privateKeyCacheKey)) {
        sessionStorage.removeItem(privateKeyCacheKey);
    }
}

export function mdCachedPrivateKey(priKey: string) {
    if (!Common.judgeStrIsEmpty(priKey)) {
        if (sessionStorage.getItem(privateKeyCacheKey)) {
            sessionStorage.setItem(privateKeyCacheKey, priKey);
        } else {
            savePrivateKey(priKey);
        }
    }
}

export function getCachedPriKey(): string|null {
    return sessionStorage.getItem(privateKeyCacheKey);
}

export  function saveAccountName(name: string) {
    if (!Common.judgeStrIsEmpty(name) && sessionStorage.getItem(accountNameCacheKey) == null) {
        sessionStorage.setItem(accountNameCacheKey, name);
    }
}

export  function mdCachedAccountName(name: string) {
    if (!Common.judgeStrIsEmpty(name)) {
        if (sessionStorage.getItem(accountNameCacheKey) == null)  {
            saveAccountName(name);
        } else  {
            sessionStorage.setItem(accountNameCacheKey, name);
        }
    }
}

export function rmCachedAccountName(account: string) {
    if (sessionStorage.getItem(accountNameCacheKey)) {
        sessionStorage.removeItem(accountNameCacheKey);
    }
}

export function getCachedAccountName(): string|null {
    return sessionStorage.getItem(accountNameCacheKey);
}
