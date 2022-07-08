export enum TransactionStatus {
    Pending = 'Pending',
    Complete = 'Complete',
    Failed = 'Failed'
}

export enum NetworkType {
    Ethereum = 'Ethereum',
    Polygon = 'Polygon',
    Solana = 'Solana'
}

export enum NetworkEnvironment {
    Emulator = 'Emulator',
    Testnet = 'Testnet',
    Mainnet = 'Mainnet'
}

export enum NFTContractType {
    ERC721 = 'ERC721',
    ERC1155 = 'ERC1155'
}

export enum NetworkChain {
    EVMLocal = 1337,
    Ethereum = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Goerli = 5,
    Polygon = 137,
    Mumbai = 80001
}
