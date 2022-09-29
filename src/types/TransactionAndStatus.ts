import { TransactionStatus } from './Enums';
export interface TransactionAndStatus {
    hash: string;
    transactionStatus: TransactionStatus;
}
