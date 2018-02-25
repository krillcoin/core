class Utils {
    static loadScript(scriptSrc) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.addEventListener('load', resolve);
            script.addEventListener('error', reject);
            setTimeout(reject, 10000);
            script.src =scriptSrc;
            document.body.appendChild(script);
        });
    }

    static getAccount($, address) {
        if ($.clientType !== DevUi.ClientType.NANO) {
            return $.accounts.get(address);
        } else {
            return Utils.awaitConsensus($)
                .then(() => $.consensus.getAccount(address))
                .then(account => account || Krill.Account.INITIAL);
        }
    }

    static broadcastTransaction($, tx) {
        if ($.clientType !== DevUi.ClientType.NANO) {
            return $.mempool.pushTransaction(tx);
        } else {
            return Utils.awaitConsensus($).then(() => $.consensus.relayTransaction(tx));
        }
    }

    static awaitConsensus($) {
        if ($.consensus.established) return Promise.resolve();
        return new Promise(resolve => {
            const onConsensus = () => {
                $.consensus.off('established', onConsensus);
                resolve();
            };
            $.consensus.on('established', onConsensus);
        });
    }

    static humanBytes(bytes) {
        var i = 0;
        var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        while (bytes > 1024) {
            bytes /= 1024;
            i++;
        }
        return (Number.isInteger(bytes) ? bytes : bytes.toFixed(2)) + ' ' + units[i];
    }

    static satoshisToCoins(value) {
        return Krill.Policy.satoshisToCoins(value).toFixed(Math.log10(Krill.Policy.SATOSHIS_PER_COIN));
    }

    static hash(data, algorithm) {
        switch (algorithm) {
            case Krill.Hash.Algorithm.BLAKE2B: return Krill.Crypto.blake2bSync(data);
            case Krill.Hash.Algorithm.SHA256: return Krill.Crypto.sha256(data);
            // case Krill.Hash.Algorithm.ARGON2D intentionally omitted
            default: throw new Error('Invalid hash algorithm');
        }
    }

    static readAddress(input) {
        try {
            const address =  Krill.Address.fromUserFriendlyAddress(input.value);
            input.classList.remove('error');
            return address;
        } catch (e) {
            input.classList.add('error');
            return null;
        }
    }

    static readNumber(input) {
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            input.classList.add('error');
            return null;
        } else {
            input.classList.remove('error');
            return value;
        }
    }

    static readBase64(input) {
        try {
            const buffer = Krill.BufferUtils.fromBase64(input.value);
            input.classList.remove('error');
            return buffer;
        } catch(e) {
            input.classList.add('error');
            return null;
        }
    }

    /** async */
    static isBasicWalletAddress($, address) {
        return $.walletStore.list()
            .then(walletAddresses => walletAddresses.some(walletAddress => address.equals(walletAddress)));
    }

    /** async */
    static isMultiSigWalletAddress($, address) {
        return $.walletStore.listMultiSig()
            .then(walletAddresses => walletAddresses.some(walletAddress => address.equals(walletAddress)));
    }
}
