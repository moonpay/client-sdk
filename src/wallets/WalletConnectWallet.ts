import { ExternalProvider } from '@ethersproject/providers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { IWallet } from '../types/IWallet';

export default class WalletConnectWallet implements IWallet {
    connect: () => void;
    getAccount: () => any;
    getBalance: () => Promise<number>;

    public async getWeb3Provider(): Promise<ExternalProvider> {
        const provider = new WalletConnectProvider({
            rpc: {
                5: 'https://eth-goerli.g.alchemy.com/v2/PLCh4QRFSaauIUqazgnZ97NsgKYHYeJr'
            }
        });

        console.log(
            '🚀 ~ file: WalletConnectWallet.ts ~ line 17 ~ WalletConnectWallet ~ getWeb3Provider ~ provider',
            provider
        );

        await provider.enable();

        return provider;
    }
}
