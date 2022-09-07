import { Web3Provider } from '@ethersproject/providers';
import { Logger } from '../helpers/Logger';
import { IWalletProvider } from './../types/IWalletProvider';

export default abstract class WalletProvider implements IWalletProvider {
    constructor(protected readonly logger: Logger) {}

    abstract getWeb3Provider(): Promise<Web3Provider>;
}
