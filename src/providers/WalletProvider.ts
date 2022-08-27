import { Web3Provider } from '@ethersproject/providers';
import { Logger } from '../helpers/Logger';
import { IWalletProvider } from './../types/IWalletProvider';

export default abstract class WalletProvider implements IWalletProvider {
    constructor(protected readonly logger: Logger) {}

    abstract getWeb3Provider(): Promise<Web3Provider>;

    abstract addAccountChangedEventListener(
        callback: (accounts: string[]) => void
    );

    abstract addChainChangedEventListener(callback: (chainId: number) => void);

    abstract removeAccountChangedEventListener(
        callback: (accounts: string[]) => void
    );

    abstract removeChainChangedEventListener(
        callback: (chainId: number) => void
    );
}
