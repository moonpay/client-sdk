import WalletConnectProvider from '@walletconnect/web3-provider';
import { IWallet } from '../types/IWallet';

export default class WalletConnectWallet implements IWallet {
    public async getProvider(): Promise<any> {
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
