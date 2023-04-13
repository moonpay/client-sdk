export interface IConnectedWallet {
    isConnected: boolean;
    address?: string;
    balance?: {
        value: string;
        formatted: string;
    };
    walletUserMetadata?: object;
}
