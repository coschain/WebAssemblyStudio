import add from "react-icons/md/add";

namespace Common {
    export function judgeStrIsEmpty(str: string): boolean {
        return !(str && str.length > 0);
    }

    const nodeAddrCacheKey = "addrCacheKey";

    export function getCurrentNodeAddress() {
        const addr = sessionStorage.getItem(nodeAddrCacheKey);
        if (addr) {
            return addr;
        }

        return "https://testnode.contentos.io";
    }

    export function mdCurrentNodeAddress(addr: string) {
        if (!judgeStrIsEmpty(addr)) {
            sessionStorage.setItem(nodeAddrCacheKey, addr);
        }
    }
}

export default Common;
