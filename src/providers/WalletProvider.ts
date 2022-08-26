import { Web3Provider } from '@ethersproject/providers';
import { Logger } from '../helpers/Logger';
import { IWalletProvider } from './../types/IWalletProvider';

export default abstract class WalletProvider implements IWalletProvider {
    constructor(protected readonly logger: Logger) {}

    abstract getProvider(): Promise<Web3Provider>;
    abstract onAccountsChanged(accounts: string[]): void;
    abstract onChainChanged(chainId: number): void;
}
