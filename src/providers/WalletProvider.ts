import { Web3Provider } from '@ethersproject/providers';
import { Logger } from '../helpers/Logger';
import { IWalletProvider } from './../types/IWalletProvider';

export default abstract class WalletProvider implements IWalletProvider {
    constructor(protected readonly logger: Logger) {}

    abstract getWeb3Provider(): Promise<Web3Provider>;

    protected isAndroid(): boolean {
        return (
            typeof navigator !== 'undefined' &&
            /android/i.test(navigator.userAgent)
        );
    }

    private isSmallIOS(): boolean {
        return (
            typeof navigator !== 'undefined' &&
            /iPhone|iPod/.test(navigator.userAgent)
        );
    }

    public isMobile(): boolean {
        return this.isAndroid() || this.isSmallIOS();
    }
}
