import { HMAPI } from '../helpers/HMAPI';
import { Logger } from '../helpers/Logger';
import { Config } from '../types/Config';
import { ContractInformation } from '../types/ContractInformation';
import {
    NetworkChain,
    NetworkEnvironment,
    NetworkType,
    NFTContractType
} from '../types/Enums';
import { Metadata } from '../types/Metadata';
import { TokenInformation } from '../types/TokenInformation';
import { WalletSelector } from '../WalletSelector';

export class BaseContract {
    public logger = new Logger();
    private contractInformation: ContractInformation;

    constructor(private _config: Config) {
        this.logger.setConfig(_config);
    }

    public async getMoonPayWidgetUrl(tokenId: number): Promise<string> {
        try {
            const url = await HMAPI.getMoonPayWidgetUrl(this._config, tokenId);

            this.logger.log(
                'getMoonPayWidgetUrl',
                `MoonPay Widget Url: ${url}`
            );

            return url;
        } catch (e) {
            this.logger.log(
                'getMoonPayWidgetUrl',
                `Failed to get MoonPay widget URL: ${e.message}`,
                true,
                e
            );
        }
    }

    public async getTokens(): Promise<TokenInformation[]> {
        try {
            this.logger.log('getTokens', 'Getting tokens from HM servers...');
            const tokens = await HMAPI.getTokens(this._config);

            this.logger.log('getTokens', 'Tokens found', false, tokens);

            return tokens;
        } catch (e) {
            this.logger.log(
                'getTokens',
                `Failed to get tokens: ${e.message}`,
                true,
                e
            );
        }
    }

    public async getToken(tokenId: number): Promise<TokenInformation> {
        try {
            this.logger.log(
                'getToken',
                `Getting token ${tokenId} from HM servers...`
            );

            const token = await HMAPI.getToken(this._config, tokenId);

            this.logger.log('getToken', 'Token found', false, token);

            return token;
        } catch (e) {
            this.logger.log(
                'getToken',
                `Failed to get token ${tokenId}: ${e.message}`,
                true,
                e
            );
        }
    }

    public openWalletSelector() {
        this.logger.log('openWalletSelector', 'Opening wallet selector...');
        WalletSelector.open();
    }

    public async getTokenAllocation(tokenId: string, walletAddress: string) {
        try {
            this.logger.log(
                'getTokenAllocation',
                `Getting token (${tokenId}) allocation for ${walletAddress} from HM servers...`
            );

            const { allocation } = await HMAPI.getTokenAllocationForAddress(
                this._config,
                tokenId,
                walletAddress
            );

            this.logger.log(
                'getTokenAllocation',
                `Allocation`,
                false,
                allocation
            );

            return allocation;
        } catch (e) {
            this.logger.log(
                'getToken',
                `Failed to get token allocation for ${walletAddress}: ${e.message}`,
                true,
                e
            );
        }
    }

    public async getContractInformation(): Promise<ContractInformation> {
        if (this.contractInformation) {
            return this.contractInformation;
        }

        this.logger.log(
            'getContractInformation',
            'Fetching contract information from HM servers...'
        );

        try {
            this.contractInformation = await HMAPI.getContract(this._config);

            this.logger.log(
                'getContractInformation',
                'Contract information found',
                false,
                this.contractInformation
            );

            return this.contractInformation;
        } catch (e) {
            this.logger.log(
                'getContractInformation',
                `Failed to get contract information: ${e.message}`,
                true,
                e
            );
        }
    }

    public async getContractMetadata(): Promise<Metadata> {
        this.logger.log(
            'getContractMetadata',
            `Getting metadata for contract...`
        );

        const contract = await this.getContractInformation();

        const data = await (
            await fetch(await contract.metadata.contractUrl)
        ).json();

        if (data) {
            const keys = ['image'];

            for (const key of keys) {
                data[key] = data[key].replace(
                    'ipfs://',
                    'https://ipfs.io/ipfs/'
                );
            }
        }

        this.logger.log(
            'getContractMetadata',
            `Metadata for contract`,
            false,
            data
        );

        return data;
    }

    public async getTokenMetadata(tokenId: number): Promise<Metadata> {
        this.logger.log(
            'getTokenMetadata',
            `Getting metadata for ${tokenId}...`
        );

        const data = await (
            await fetch(await this.getTokenMetadataUrl(tokenId))
        ).json();

        if (data) {
            const keys = ['image'];

            for (const key of keys) {
                data[key] = data[key].replace(
                    'ipfs://',
                    'https://ipfs.io/ipfs/'
                );
            }
        }

        this.logger.log(
            'getTokenMetadata',
            `Metadata for ${tokenId}`,
            false,
            data
        );

        return data;
    }

    public async getTokenMetadataUrl(tokenId: number): Promise<string> {
        const contract = await this.getContractInformation();

        const url =
            this._config.contractType === NFTContractType.ERC721
                ? `${contract.metadata.tokenUrl}${tokenId}`
                : contract.metadata.tokenUrl.replace(
                      '{id}',
                      tokenId.toString()
                  );

        this.logger.log(
            'getTokenMetadataUrl',
            `Metadata url for ${tokenId}: ${url}`
        );

        return url;
    }

    public getTransactionExplorerUrl(hash: string): string {
        if (this._config.networkType === NetworkType.Solana) {
            return `https://solscan.io/tx/${hash}${
                this._config.networkEnvironment === NetworkEnvironment.Testnet
                    ? '?cluster=devnet'
                    : ''
            }`;
        }

        switch (this._config.networkChain) {
            case NetworkChain.EVMLocal:
                return `https://etherscan.io/tx/${hash}`;
            case NetworkChain.Ropsten:
                return `https://ropsten.etherscan.io/tx/${hash}`;
            case NetworkChain.Rinkeby:
                return `https://rinkeby.etherscan.io/tx/${hash}`;
            case NetworkChain.Polygon:
                return `https://polygonscan.com/tx/${hash}`;
            case NetworkChain.Mumbai:
                return `https://mumbai.polygonscan.com/tx/${hash}`;
            case NetworkChain.Ethereum:
                return `https://etherscan.io/tx/${hash}`;
            default:
                return '';
        }
    }
}
