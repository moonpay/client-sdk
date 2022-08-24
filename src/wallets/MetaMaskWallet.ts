import { Logger } from './../helpers/Logger';
import { IWallet } from './../types/IWallet';

export default class MetaMaskWallet implements IWallet {
    public isConnected = false;

    constructor(private readonly logger: Logger) {
        this.isConnected = !!(window?.ethereum as any)?.selectedAddress;
    }

    getWeb3Provider() {
        if (!window.ethereum) {
            this.logger.log('connect', 'MetaMask wallet not found', true);
        }

        return window.ethereum;
    }
}
