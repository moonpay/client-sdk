// @ts-ignore
import { MoonpayWalletSDK } from '@moonpay/login-sdk';
import WalletProvider from './WalletProvider';
import { ethers } from 'ethers';

export default class MoonPayWalletProvider extends WalletProvider {
    private sdk: MoonpayWalletSDK;

    public async getWeb3Provider() {
        const sdk = new MoonpayWalletSDK({
            loginDomain: 'https://buy-sandbox.moonpay.com',
            secureWalletDomain: 'https://web3.moonpay.com',
            apiKey: 'pk_test_123'
        });

        this.sdk = sdk;

        await this.sdk.init();
        const moonpayProvider: ethers.providers.Web3Provider = sdk.provider;

        // trigger login flow by requesting accounts
        await moonpayProvider.send('eth_accounts', []);
        return moonpayProvider;
    }
    public getWalletUserData() {
        const userData = this.sdk.getWalletMetaData();
        return userData;
    }
}
