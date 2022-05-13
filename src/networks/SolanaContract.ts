import { Buffer } from 'buffer';
import { HMAPI } from '../helpers/HMAPI';
import { Config } from '../types/Config';
import { NetworkEnvironment, TransactionStatus } from '../types/Enums';
import { IContract } from '../types/IContract';
import { Transaction } from '../types/Transaction';
import { BaseContract } from './BaseContract';

declare const window;
declare const solanaWeb3: any;

export class SolanaContract extends BaseContract implements IContract {
    private walletAddress;

    constructor(private config: Config) {
        super(config);
    }

    private static parseTransaction(transaction: any): any {
        transaction.feePayer = new solanaWeb3.PublicKey(transaction.feePayer);

        for (const instruction of transaction.instructions) {
            instruction.programId = new solanaWeb3.PublicKey(
                instruction.programId
            );

            instruction.data = instruction.data.data;

            for (const key of instruction.keys) {
                key.pubkey = new solanaWeb3.PublicKey(key.pubkey);
            }
        }

        for (const signature of transaction.signatures) {
            signature.publicKey = new solanaWeb3.PublicKey(signature.publicKey);

            if (signature.signature) {
                signature.signature = Buffer.from(signature.signature.data);
            }
        }

        return new solanaWeb3.Transaction(transaction);
    }

    public async buy(
        amount: number,
        tokenId = 1,
        wait = false
    ): Promise<Transaction> {
        await this.connect();

        this.logger.log('buy', `Buying token ${tokenId} x ${amount}`);

        const result = await HMAPI.getSolanaApproveInstruction(
            this.config,
            this.walletAddress.toString(),
            tokenId,
            amount
        );

        const transaction = SolanaContract.parseTransaction(result);

        const connection = this.getConnection();

        this.logger.log('buy', 'Prompting for signature...');

        const signedTransaction = await window.solana.signTransaction(
            transaction
        );

        this.logger.log('buy', 'Sending transaction...');
        const signature = await connection.sendRawTransaction(
            signedTransaction.serialize()
        );

        this.logger.log('buy', 'Confirming transaction...');
        await connection.confirmTransaction(signature);

        this.logger.log('buy', `Done: ${signature}`);

        return {
            hash: signature
        };
    }

    public buyPresale(): Promise<Transaction> {
        throw new Error('Not supported');
    }

    public async connect() {
        this.logger.log('connect', 'Connecting...');

        if (!window.solana) {
            this.logger.log('connect', 'Solana wallet not found', true);
        }

        if (!window.solana.isPhantom) {
            this.logger.log('connect', 'Phantom wallet not found', true);
        }

        const response = await window.solana.connect();
        this.walletAddress = response.publicKey;

        this.logger.log('connect', 'Connected');
    }

    public async getTokenBalance(tokenId = 1): Promise<number> {
        throw new Error('Not yet supported');
    }

    getTransactionStatus(transaction: Transaction): Promise<TransactionStatus> {
        return Promise.resolve(undefined);
    }

    public async getWalletBalance(): Promise<number> {
        this.logger.log('getWalletBalance', 'Getting wallet balance...');

        await this.connect();
        const connection = this.getConnection();

        const balance = await connection.getBalance(
            new solanaWeb3.PublicKey(this.walletAddress)
        );

        const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;

        this.logger.log('getWalletBalance', `Balance: ${solBalance}`);

        return solBalance;
    }

    public async isWalletValid(): Promise<boolean> {
        try {
            await this.connect();
            this.logger.log('isWalletValid', `Wallet valid`);
            return true;
        } catch (e) {
            this.logger.log('isWalletValid', `Walled invalid: ${e.message}`);
            return false;
        }
    }

    transfer(
        to: string,
        tokenId: number,
        amount: number | undefined
    ): Promise<Transaction> {
        return Promise.resolve(undefined);
    }

    waitForTransaction(transaction: Transaction): Promise<TransactionStatus> {
        return Promise.resolve(undefined);
    }

    private getConnection() {
        if (this.config.networkEnvironment === NetworkEnvironment.Testnet) {
            return new solanaWeb3.Connection(
                solanaWeb3.clusterApiUrl('devnet')
            );
        }

        return new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl('mainnet-beta')
        );
    }
}
