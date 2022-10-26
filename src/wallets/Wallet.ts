import { WalletApp } from '../types/Enums';
import { WalletSelector } from './WalletSelector';
import { Logger } from '../helpers/Logger';
import { BaseConfig } from '../types/BaseConfig';
import MetaMaskWalletProvider from './providers/MetaMaskWalletProvider';
import CoinbaseWalletProvider from './providers/CoinbaseWalletProvider';
import WalletConnectProvider from './providers/WalletConnectProvider';
import { Web3Provider } from '@ethersproject/providers';
import EVMChains from '../types/EVMChains';
import { providers, Signer } from 'ethers';
import { IWalletProvider } from '../types/IWalletProvider';

export class Wallet {
    private _logger = new Logger();
    private readonly walletMap: { [key in WalletApp]: IWalletProvider } = {
        [WalletApp.Metamask]: new MetaMaskWalletProvider(this._logger),
        [WalletApp.Coinbase]: new CoinbaseWalletProvider(this._logger),
        [WalletApp.WalletConnect]: new WalletConnectProvider(
            this._logger,
            this.config
        )
    };
    private _provider: IWalletProvider;
    private _signer: Signer;
    private _web3Provider: Web3Provider;
    private _app: WalletApp;

    constructor(private config: BaseConfig) {
        this._logger.setConfig(config);
        WalletSelector.init();
    }

    public get isConnected(): boolean {
        return !!this._signer;
    }

    public getApp(): WalletApp {
        return this._app;
    }

    public setSigner(signer: Signer) {
        this._logger.log('signer', 'Setting custom signer...');
        this._signer = signer;
    }

    public async getWeb3Provider(): Promise<Web3Provider> {
        if (!this._web3Provider) {
            await this.connect();
        }

        return this._web3Provider;
    }

    public async getSigner(): Promise<Signer> {
        if (!this._signer) {
            await this.connect();
        }

        return this._signer;
    }

    public async getProvider(): Promise<providers.ExternalProvider> {
        if (!this._web3Provider) {
            await this.connect();
        }

        return this._web3Provider.provider;
    }

    public async connect(walletApp?: WalletApp) {
        this._logger.log('connect', 'Connecting...');

        if (!walletApp) {
            try {
                walletApp = await WalletSelector.selectWallet();
            } catch (e) {
                this._logger.log('connect', 'Failed selecting wallet', true, e);
            }
        }

        this._app = walletApp;
        this._provider = this.walletMap[walletApp];
        this._web3Provider = await this._provider.getWeb3Provider();

        const network = await this._web3Provider.getNetwork();

        if (network.chainId !== this.config.networkChain) {
            this._logger.log('connect', 'Switching network...');

            const chain = EVMChains[this.config.networkChain];

            if (!chain) {
                this._logger.log('connect', 'Failed to select network', true);
            }

            try {
                await this._web3Provider.send('wallet_switchEthereumChain', [
                    { chainId: chain.chainId }
                ]);
            } catch (switchError) {
                this._logger.log(
                    'connect',
                    'Adding network...',
                    false,
                    switchError
                );

                try {
                    await this._web3Provider.send('wallet_addEthereumChain', [
                        chain
                    ]);
                } catch (addError) {
                    this._logger.log(
                        'connect',
                        'Failed to select network',
                        true,
                        addError
                    );
                }
            }

            this._web3Provider = await this._provider.getWeb3Provider();
        }

        if (walletApp !== WalletApp.WalletConnect) {
            const accounts = await this._web3Provider.send(
                'eth_requestAccounts',
                []
            );

            if (!accounts.length) {
                this._logger.log('connect', 'No accounts found', true);
            }
        }

        this._signer = this._web3Provider.getSigner();
        this._logger.log('connect', 'Connected');
    }
}
