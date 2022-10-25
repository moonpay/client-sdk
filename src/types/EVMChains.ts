import { NetworkChain } from './Enums';

export default {
    [NetworkChain.EVMLocal]: {
        chainId: '0x539',
        chainName: 'Local',
        rpcUrls: ['http://localhost:8545'],
        nativeCurrency: {
            name: 'ETH Test',
            symbol: 'ETEST',
            decimals: 18
        }
    },
    [NetworkChain.Mumbai]: {
        chainId: '0x13881',
        chainName: 'Mumbai',
        rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com'],
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        }
    },
    [NetworkChain.Polygon]: {
        chainId: '0x89',
        chainName: 'Polygon',
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com'],
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        }
    },
    [NetworkChain.Goerli]: {
        chainId: '0x5',
        chainName: 'Goerli',
        rpcUrls: [
            'https://eth-goerli.g.alchemy.com/v2/PLCh4QRFSaauIUqazgnZ97NsgKYHYeJr'
        ],
        blockExplorerUrls: ['https://etherscan.io'],
        nativeCurrency: {
            name: 'ETH',
            symbol: 'GoerliETH',
            decimals: 18
        }
    },
    [NetworkChain.Ethereum]: {
        chainId: '0x1',
        chainName: 'Ethereum',
        rpcUrls: [
            'https://eth-mainnet.g.alchemy.com/v2/zCcvsCCvVTijakQFV7RPcFG7UuhWnu1A'
        ],
        blockExplorerUrls: ['https://etherscan.io'],
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        }
    }
};
