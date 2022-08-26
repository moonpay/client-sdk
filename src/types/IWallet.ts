import { ethers } from 'ethers';

export interface IWallet {
    getSigner: () => Promise<ethers.Signer>;
}
