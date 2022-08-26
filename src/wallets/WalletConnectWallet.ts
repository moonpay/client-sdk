import WalletConnectProvider from '@walletconnect/web3-provider';
import { IWallet } from '../types/IWallet';
import { ethers } from 'ethers';

export default class WalletConnectWallet implements IWallet {
    public async getSigner(): Promise<ethers.Signer> {
        const provider = new WalletConnectProvider({
            rpc: {
                5: 'https://eth-goerli.g.alchemy.com/v2/PLCh4QRFSaauIUqazgnZ97NsgKYHYeJr',
                1337: 'http://localhost:8545'
            }
        });

        console.log(provider);

        const result = await provider.enable();

        console.log(result);

        throw new Error('Not implemented');
    }
}
