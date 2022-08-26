import WalletConnectProvider from '@walletconnect/web3-provider';
import { IWallet } from '../types/IWallet';
import { ethers } from 'ethers';
import { Config } from '../types/Config';
import { Logger } from '../helpers/Logger';

export default class WalletConnectWallet implements IWallet {
    constructor(
        private readonly logger: Logger,
        private readonly config: Config
    ) {}

    public async getProvider(): Promise<ethers.providers.Web3Provider> {
        try {
            const walletConnectProvider = new WalletConnectProvider({
                rpc: {
                    // TODO: add other providers
                    5: 'https://eth-goerli.g.alchemy.com/v2/PLCh4QRFSaauIUqazgnZ97NsgKYHYeJr',
                    1337: 'http://localhost:8545'
                },
                chainId: this.config.networkChain
            });

            await walletConnectProvider.enable();

            return new ethers.providers.Web3Provider(walletConnectProvider);
        } catch (e) {
            this.logger.log(
                'getProvider',
                'Unable to connect to WalletConnect',
                true
            );
        }
    }
}
