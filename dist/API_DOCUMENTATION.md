# Krillcoin Core API documentation
**This documentation describes the API of the [Betanet](https://github.com/krillcoin-network/core/tree/betanet) branch.**

All Krillcoin Core classes reside in the `Krillcoin.` namespace.

## Krillcoin

### Basic initialization

```js
Krillcoin.init($ => {
    // $ is the Krillcoin.Core instance
});
```

### Initialization with error callback
- `Krillcoin.ERR_WAIT`: An instance of Krillcoin Core is already running in another window of the same origin. When all other windows are closed, the success callback will be invoked.
- `Krillcoin.ERR_UNSUPPORTED`: This browser is not supported.
- `Krillcoin.ERR_UNKNOWN`: An unknown error occured while loading.
- `Krillcoin.Wallet.ERR_INVALID_WALLET_SEED` : An invalid wallet seed has been provided.

```js
Krillcoin.init($ => {
    // $ is the Krillcoin.Core instance
}, code => {
    switch (code) {
        case Krillcoin.ERR_WAIT:
            alert('Another Krillcoin instance is already running');
            break;
        case Krillcoin.ERR_UNSUPPORTED:
            alert('Browser not supported');
            break;
        case Krillcoin.Wallet.ERR_INVALID_WALLET_SEED:
            alert("Invalid wallet seed");
            break;
        default:
            alert('Krillcoin initialization error');
            break;
    }
});
```

### Initialization with options
You can pass some options to initialization.  

| Option        | Description           |
| ------------- |:-------------:|
| **_walletSeed_** | Wallet seed (See [Krillcoin.Wallet](#wallet)) |

```js
const options = {
  walletSeed: "d6a651dcc13dab2e9d05d..."
}

Krillcoin.init($ => {
    // $ is the Krillcoin.Core instance
}, code => {
  // Handle errors
},
  options
);
```

### Get an existing instance
```js
Krillcoin.get().then($ => {
    // $ is the Krillcoin.Core instance
});
```

## Krillcoin.Core

### Properties
- `network`: [Krillcoin.Network](#network)
- `consensus`: [Krillcoin.Consensus](#consensus)
- `accounts`: [Krillcoin.Accounts](#accounts)
- `blockchain`: [Krillcoin.Blockchain](#blockchain)
- `mempool`: [Krillcoin.Mempool](#mempool)
- `wallet`: [Krillcoin.Wallet](#wallet)
- `miner`: [Krillcoin.Miner](#miner)

### Methods
No public methods.

### Events
No events.


<a name="network"></a>
## Krillcoin.Network
The network will not connect automatically, call `$.network.connect()` to do so.

### Properties
- `peerCount`
- `peerCountWebSocket`
- `peerCountWebRtc`
- `bytesReceived`
- `bytesSent`

### Methods
- `connect()`
- `disconnect()`

### Events
- `peers-changed`
- `peer-joined (peer)`
- `peer-left (peer)`

### Examples
Connect to the network:
```js
$.network.connect()
```

Listen for peer connections:
```js
$.network.on('peers-changed', () => console.log('Peers changed'));
$.network.on('peer-joined', peer => console.log(`Peer ${peer} joined`));
$.network.on('peer-left', peer => console.log(`Peer ${peer} left`));
```


<a name="consensus"></a>
## Krillcoin.Consensus

### Properties
- `established`

### Methods
No public methods.

### Events
- `syncing (targetHeight)`
- `established`
- `lost`

### Examples
Listen for `established` event:
```js
$.consensus.on('established', () => console.log('consensus established!'))
```


<a name="accounts"></a>
## Krillcoin.Accounts

### Properties
No public properties.

### Methods
- `getBalance(address)`
- `commitBlock(block)`
- `revertBlock(block)`
- `async hash()`

### Events
- `<<base64(address)>> (balance, address)` when balance of address changes.

### Examples
Query an account's balance:
```js
$.accounts.getBalance(<<address>>).then(balance => {
    console.log(balance.value)
    console.log(balance.nonce)
})
```
Listen for an account balance change:
```js
$.accounts.on('a09rjiARiVYh2zJS0/1pYKZg4/A=').then(balance => {
    console.log(balance)
})
```


<a name="blockchain"></a>
## Krillcoin.Blockchain

### Properties
- `head`
- `headHash`
- `totalWork`
- `height`
- `path`
- `busy`

### Methods
- `pushBlock(block)`
- `getBlock(hash)`
- `getNextCompactTarget()`
- `async accountsHash()`

### Events
- `head-changed`
- `ready`

### Examples
Show the blockchain sync progress
```js
let targetHeight = 0;
$.consensus.on('syncing', _targetHeight => {
    targetHeight = _targetHeight;
})

$.blockchain.on('head-changed', () => {
    const height = $.blockchain.height;
    ui.setProgress(height / targetHeight);
})
```


<a name="mempool"></a>
## Krillcoin.Mempool

### Properties
No public properties.

### Methods
- `pushTransaction(transaction)`
- `getTransaction(hash)`
- `getTransactions(maxCount = 5000)`

### Events
- `transaction-added`
- `transactions-ready`


<a name="wallet"></a>
## Krillcoin.Wallet

### Properties
- `address`
- `publicKey`

### Methods
- `createTransaction(recipientAddr, value, fee, nonce)`
- `dump()`

### Events
No events.

### Examples
Create a transaction:
```js
$.wallet.createTransaction(recipientAddr, value, fee, nonce).then(transaction => {
    console.log(transaction)
})
```

Dump and restore wallet:  
```js
var walletSeed = $.wallet.dump();
var restoredWallet = await Wallet.load(walletSeed);
```

<a name="miner"></a>
## Krillcoin.Miner
Mining should not start before consensus is established and stop when consensus is lost. The Miner does not explicitely enforce this, but callers should ensure this behavior.

```js
// Start mining automatically once consensus is (re-)established.
$.consensus.on('established', () => $.miner.startWork());

// Stop mining when consensus is lost. All clients should do this!
$.consensus.on('lost', () => $.miner.stopWork());
```

### Properties
- `working`
- `address`
- `hashrate`

### Methods
- `startWork()`
- `stopWork()`

### Events
- `start`
- `stop`
- `block-mined`
- `hashrate-changed`
