import { ethers } from 'ethers';

export interface IWalletProvider {
    getWeb3Provider: () => Promise<ethers.providers.Web3Provider>;
    getWalletUserData?: () => object
}
