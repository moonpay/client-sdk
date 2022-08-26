import { ethers } from 'ethers';

export interface IWallet {
    connect: () => void;
    getAccount: () => any;
    getBalance: () => Promise<number>;
    getWeb3Provider: () => Promise<ethers.providers.ExternalProvider>;
}
