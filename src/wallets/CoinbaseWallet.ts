import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { IWallet } from '../types/IWallet';

export default class CoinbaseWallet implements IWallet {
    private readonly wallet: CoinbaseWalletSDK;

    constructor() {
        this.wallet = new CoinbaseWalletSDK({
            appName: 'HyperMint' // TODO: make options configurable in the SDK init
        });
    }

    connect: () => void;

    getBalance: () => Promise<number>;

    public async getWeb3Provider() {
        return this.wallet.makeWeb3Provider();
    }

    public getAccount() {
        const provider = this.wallet.makeWeb3Provider();

        const accounts = provider.request({
            method: 'eth_requestAccounts'
        });

        console.log(
            '🚀 ~ file: CoinbaseWallet.ts ~ line 23 ~ CoinbaseWallet ~ getAccount ~ accounts',
            accounts
        );

        if (!accounts) return null;

        return accounts[0];
    }
}
