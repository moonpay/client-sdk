import { ethers } from 'ethers';

export interface IWallet {
    getProvider: () => Promise<ethers.providers.Web3Provider>;
}
