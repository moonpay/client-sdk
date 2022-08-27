import { ethers } from 'ethers';

export interface IWalletProvider {
    getWeb3Provider: () => Promise<ethers.providers.Web3Provider>;
    addAccountChangedEventListener: (
        callback: (accounts: string[]) => void
    ) => void;
    addChainChangedEventListener: (callback: (chainId: number) => void) => void;
    removeAccountChangedEventListener: (
        callback: (accounts: string[]) => void
    ) => void;
    removeChainChangedEventListener: (
        callback: (chainId: number) => void
    ) => void;
}
