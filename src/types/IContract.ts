import { ContractInformation } from './ContractInformation';
import { TransactionStatus, WalletProvider } from './Enums';
import { Metadata } from './Metadata';
import { TokenAllocation } from './TokenAllocation';
import { TokenInformation } from './TokenInformation';
import { Transaction } from './Transaction';

export interface IContract {
    connect: (wallet: WalletProvider) => void;
    getConnectedWallet: () => Promise<any>; // TODO: add a connected wallet type
    getContractInformation: () => Promise<ContractInformation>;
    getTokenBalance: () => Promise<number>;
    getTokens: () => Promise<TokenInformation[]>;
    getToken: (tokenId: number) => Promise<TokenInformation>;
    getTokenAllocation: (
        tokenId: string,
        walletAddress: string
    ) => Promise<TokenAllocation>;
    getTokenMetadataUrl: (tokenId: number) => Promise<string>;
    getTokenMetadata: (tokenId: number) => Promise<Metadata>;
    getTransactionStatus: (
        transaction: Transaction
    ) => Promise<TransactionStatus>;
    getWalletBalance: () => Promise<number>;
    isWalletValid: () => Promise<boolean>;
    waitForTransaction: (
        transaction: Transaction
    ) => Promise<TransactionStatus>;

    buy: (
        amount: number,
        tokenId?: number,
        wait?: boolean
    ) => Promise<Transaction>;
    buyAuthorised: (
        amount: number,
        tokenId: number,
        wait?: boolean,
        ethPrice?: number,
        maxPerAddress?: number,
        expires?: number,
        signature?: string
    ) => Promise<Transaction>;

    transfer: (
        to: string,
        tokenId: number,
        amount?: number
    ) => Promise<Transaction>;

    getMoonPayWidgetUrl: (tokenId: number) => Promise<string>;
}
