import { ethers } from 'ethers';

export interface IWalletProvider {
    getProvider: () => Promise<ethers.providers.Web3Provider>;
    onAccountsChanged: (accounts: string[]) => void;
    onChainChanged: (chainId: number) => void;
}
