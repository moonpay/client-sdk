import { IWallet } from '../types/IWallet';
import { Logger } from './../helpers/Logger';

export default class MetaMaskWallet implements IWallet {
    public isConnected = false;

    constructor(private readonly logger: Logger) {
        this.isConnected = !!(window?.ethereum as any)?.selectedAddress;
    }

    connect: () => void;
    getAccount: () => any;
    getBalance: () => Promise<number>;

    public async getWeb3Provider() {
        if (!window.ethereum) {
            this.logger.log('connect', 'MetaMask wallet not found', true);
        }

        return window.ethereum;
    }
}
