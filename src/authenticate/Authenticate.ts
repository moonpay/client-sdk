import { AuthenticateConfig } from '../types/AuthenticateConfig';
import { Wallet } from '../wallets/Wallet';
import { NetworkChain, NetworkEnvironment, NetworkType } from '../types/Enums';
import { Logger } from '../helpers/Logger';
import { HMAPI } from '../helpers/HMAPI';

export class Authenticate {
    public logger = new Logger();
    private wallet: Wallet;

    constructor(private _config: AuthenticateConfig) {
        this.logger.setConfig(_config);
        this.wallet = new Wallet({
            ..._config,
            networkEnvironment:
                _config.networkEnvironment ?? NetworkEnvironment.Mainnet,
            networkType: _config.networkType ?? NetworkType.Ethereum,
            networkChain: _config.networkChain ?? NetworkChain.Ethereum
        });
    }

    public async authenticate(): Promise<string> {
        this.logger.log('authentication', 'Attempting authentication...');

        await this.wallet.connect();
        const address = await this.wallet.getAddress();

        try {
            this.logger.log(
                'authentication',
                `Requesting message for address ${address}...`
            );
            const startResponse = await HMAPI.startAuthentication(
                this._config,
                address
            );

            this.logger.log(
                'authentication',
                'Requesting signature from user...'
            );

            const signature = await this.wallet.requestSignature(
                startResponse.message
            );

            this.logger.log(
                'authentication',
                'Validating signature with server...'
            );

            const { token } = await HMAPI.completeAuthentication(
                this._config,
                address,
                {
                    ...startResponse,
                    signature
                }
            );

            this.logger.log('authentication', 'Success', false, {
                token
            });

            return token;
        } catch (e) {
            this.logger.log('authenticate', `Failed: ${e.message}`, true);
        }
    }
}
