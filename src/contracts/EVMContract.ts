import { BigNumber, ethers, Signer } from 'ethers';
import { EVMHelpers } from '../helpers/EVMHelpers';
import { GenericHelpers } from '../helpers/GenericHelpers';
import { HMAPI } from '../helpers/HMAPI';
import { ContractConfig } from '../types/ContractConfig';
import { ContractInformation } from '../types/ContractInformation';
import {
    NetworkChain,
    NetworkType,
    NFTContractType,
    TransactionStatus,
    WalletApp
} from '../types/Enums';
import { ERC1155, ERC721 } from '../types/EVMABIs';
import { IContract } from '../types/IContractEvm';
import { Transaction } from '../types/Transaction';
import { TransactionAndStatus } from '../types/TransactionAndStatus';
import { BaseContract } from './BaseContract';
import { formatEther } from 'ethers/lib/utils';
import { IConnectedWallet } from '../types/Wallet';
import { Wallet } from '../wallets/Wallet';

export class EVMContract extends BaseContract implements IContract {
    public wallet: Wallet;
    /*
    Allows the constructor to kick off fetching contract information for config
    to avoid the user having to wait
 */
    private fetchContractPromise?: Promise<void>;

    constructor(private config: ContractConfig) {
        super(config);
        this.wallet = new Wallet(config);

        if (!config.contractAddress) {
            this.fetchContractPromise = this.loadConfigFromId();
        }
    }

    public async getConnectedWallet(): Promise<IConnectedWallet> {
        if (!this.wallet.isConnected) {
            return {
                isConnected: false
            };
        }

        try {
            // eslint-disable-next-line prefer-const
            let { contract, signer } = await this.getEVMContract();

            if (this.isPolygon()) {
                contract = await EVMHelpers.getWETHContract(
                    this.config,
                    signer
                );
            }

            const address = await signer.getAddress();

            const balance: string = this.isPolygon()
                ? await contract.balanceOf(address)
                : await signer.getBalance();

            return {
                isConnected: true,
                address,
                balance: {
                    value: balance,
                    formatted: formatEther(balance)
                }
            };
        } catch (e) {
            return {
                isConnected: false,
                address: undefined,
                balance: undefined
            };
        }
    }

    public async getTestWETH(amount = 0.1) {
        if (!this.isMumbai()) {
            this.logger.log(
                'getTestWETH',
                'Can only get test WETH on Mumbai',
                true
            );
        }

        const signer = await this.wallet.getSigner();

        this.logger.log('getTestWETH', `Getting ${amount} test WETH...`);

        const wethContract = EVMHelpers.getWETHContract(this.config, signer);

        const transaction = await wethContract.deposit({
            value: ethers.utils.parseEther(amount.toString())
        });

        await this.waitForTransaction(transaction);

        this.logger.log('getTestWETH', `${amount} test WETH deposited`);
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

    public async connect(wallet?: WalletApp) {
        if (!this.wallet.isConnected) {
            this.fetchContractPromise && (await this.fetchContractPromise);
            await this.wallet.connect(wallet);
            await this.registerChangeEventListeners();
        }
    }

    public async configuredConnect(walletSelectOptions?: WalletApp[]) {
        if (!this.wallet.isConnected) {
            this.fetchContractPromise && (await this.fetchContractPromise);
            await this.wallet.connect(undefined, walletSelectOptions);
            await this.registerChangeEventListeners();
        }
    }

    public async getSigner(): Promise<ethers.Signer | undefined> {
        const signer = await this.wallet.getSigner();
        if (signer) {
            this.logger.log(
                'getSigner',
                `Signer is ${await signer.getAddress()}`
            );
        }
        return signer;
    }

    public setSigner(signer?: ethers.Signer): void {
        this.wallet.setSigner(signer);
    }

    public disconnect() {
        this.removeChangeEventListeners();
        this.wallet = new Wallet(this.config);
        this.logger.log('disconnect', 'Disconnected');
    }

    public async getTokenBalance(tokenId?: number): Promise<number> {
        this.logger.log(
            'getTokenBalance',
            `Getting token ${tokenId} balance...`
        );

        const { contract, signer } = await this.getEVMContract();

        let balance;

        const isERC721 = this.config.contractType === NFTContractType.ERC721;

        if (isERC721) {
            balance = await contract.balanceOf(await signer.getAddress());
        } else {
            if (tokenId === undefined) {
                this.logger.log('getTokenBalance', 'Token id required', true);
            } else if (tokenId < 0) {
                this.logger.log(
                    'getTokenBalance',
                    'Token id must be non-negative',
                    true
                );
            }
            balance = await contract.balanceOf(
                await signer.getAddress(),
                tokenId
            );
        }

        const result = balance.toNumber();
        this.logger.log(
            'getTokenBalance',
            isERC721
                ? `Token balance: ${result}`
                : `Token balance of ${tokenId}: ${result}`
        );
        return result;
    }

    public async getTotalMinted(tokenId?: number): Promise<number> {
        this.logger.log(
            'getTotalMinted',
            `Getting token ${tokenId} total minted...`
        );

        const { contract, signer } = await this.getEVMContract();

        let balance;

        if (this.config.contractType === NFTContractType.ERC721) {
            balance = await contract.totalMinted(await signer.getAddress());
        } else {
            if (tokenId === undefined) {
                this.logger.log('getTotalMinted', 'Token id required', true);
            }

            balance = await contract.balanceOf(
                await signer.getAddress(),
                tokenId
            );
        }

        const result = balance.toNumber();
        this.logger.log(
            'getTotalMinted',
            `Token balance of ${tokenId}: ${result}`
        );
        return result;
    }

    public async getWalletBalance(): Promise<number> {
        const signer = await this.wallet.getSigner();

        try {
            this.logger.log('getWalletBalance', `Getting wallet balance...`);

            let balance: ethers.BigNumber;

            if (this.isPolygon()) {
                const contract = EVMHelpers.getWETHContract(
                    this.config,
                    signer
                );

                balance = await contract.balanceOf(await signer.getAddress());
            } else {
                balance = await signer.getBalance();
            }

            const result = Number(ethers.utils.formatEther(balance));

            this.logger.log('getWalletBalance', `Wallet balance: ${result}`);

            return result;
        } catch (e) {
            this.logger.log(
                'getWalletBalance',
                `Failed to get balance: ${e.message}`
            );
        }
    }

    public async buy(
        amount: number,
        tokenId?: number,
        wait = true
    ): Promise<Transaction> {
        const { contract, signer } = await this.getEVMContract();

        this.logger.log(
            'buy',
            `Buying ${tokenId ?? ''} x ${amount}. Validating...`
        );

        const { totalPrice, contractInfo } = await this.validateBuy(
            amount,
            tokenId
        );

        if (
            contractInfo.publicSaleAt &&
            new Date() < contractInfo.publicSaleAt
        ) {
            this.logger.log('buy', `Public sale closed`, true);
        }

        if (
            contractInfo.saleClosesAt &&
            new Date() > contractInfo.saleClosesAt
        ) {
            this.logger.log('buy', 'Sale closed', true);
        }

        if (this.isPolygon()) {
            this.logger.log('buy', 'Creating approve transaction...');

            const wethContract = EVMHelpers.getWETHContract(
                this.config,
                signer
            );

            const approveTransaction = await wethContract.approve(
                this.config.contractAddress,
                ethers.utils.parseEther(totalPrice.toString())
            );

            this.logger.log('buy', 'Waiting for approve transaction...');

            await this.waitForTransaction(approveTransaction);
        }

        this.logger.log('buy', 'Creating buy transaction...');

        let buyTransaction;

        if (this.config.contractType === NFTContractType.ERC721) {
            let gasLimit = BigNumber.from(200_000);

            const transactionArgs: Partial<ethers.Transaction> = {};

            if (!this.isPolygon()) {
                transactionArgs.value = ethers.utils.parseEther(
                    totalPrice.toString()
                );
            }

            try {
                gasLimit = await contract.estimateGas.buy(
                    amount,
                    transactionArgs
                );
            } catch (e) {
                this.logger.log(
                    'buy',
                    'Unable to calculate gas limit',
                    false,
                    e
                );
            }

            transactionArgs.gasLimit = gasLimit;

            buyTransaction = await contract.buy(amount, transactionArgs);
        } else {
            let gasLimit = BigNumber.from(200_000);

            const transactionArgs: Partial<ethers.Transaction> = {};

            if (!this.isPolygon()) {
                transactionArgs.value = ethers.utils.parseEther(
                    totalPrice.toString()
                );
            }

            try {
                gasLimit = await contract.estimateGas.buy(
                    tokenId,
                    amount,
                    transactionArgs
                );
            } catch (e) {
                this.logger.log(
                    'buy',
                    'Unable to calculate gas limit',
                    false,
                    e
                );
            }

            transactionArgs.gasLimit = gasLimit;

            buyTransaction = await contract.buy(
                tokenId,
                amount,
                transactionArgs
            );
        }

        if (wait) {
            this.logger.log('buy', 'Waiting on buy transaction...');
            await this.waitForTransaction(buyTransaction);
        }

        return buyTransaction;
    }

    public async buyAuthorised(
        amount: number,
        tokenId = 0,
        wait = true,
        ethPrice?: number,
        maxPerAddress?: number,
        expires?: number,
        signature?: string
    ): Promise<Transaction> {
        const { contract, signer } = await this.getEVMContract();
        const address = await signer.getAddress();

        this.logger.log(
            'buyAuthorised',
            `Buying ${tokenId ?? ''} x ${amount}. Validating...`
        );

        if (
            ethPrice === undefined ||
            !expires ||
            !signature ||
            maxPerAddress === undefined
        ) {
            this.logger.log(
                'buyAuthorised',
                'Fetching signature from HM API...'
            );

            const authoriseResponse = await HMAPI.authoriseEVMBuy(
                this.config,
                tokenId,
                address,
                amount
            );

            this.logger.log(
                'buyAuthorised',
                'API response',
                false,
                authoriseResponse
            );

            if (
                authoriseResponse['error'] != null ||
                authoriseResponse.signature == null
            ) {
                this.logger.log(
                    'buyAuthorised',
                    `An error occurred whilst requesting buy authorisation: ${authoriseResponse['error']}`,
                    true
                );
            }

            maxPerAddress = authoriseResponse.maxPerAddress;
            ethPrice = authoriseResponse.totalPrice;
            expires = authoriseResponse.expires;
            signature = authoriseResponse.signature;
        }

        const { totalPrice } = await this.validateBuy(
            amount,
            tokenId,
            maxPerAddress,
            ethPrice
        );

        this.logger.log('buyAuthorised', `Using price ${totalPrice}`);

        if (this.isPolygon()) {
            this.logger.log('buyAuthorised', 'Creating approve transaction...');

            const wethContract = EVMHelpers.getWETHContract(
                this.config,
                signer
            );
            const approveTransaction = await wethContract.approve(
                this.config.contractAddress,
                ethers.utils.parseEther(totalPrice.toString())
            );

            this.logger.log(
                'buyAuthorised',
                'Waiting for approve transaction...'
            );

            await this.waitForTransaction(approveTransaction);
        }

        let buyTransaction;
        const gweiPrice = ethers.utils.parseEther(totalPrice.toString());

        if (this.config.contractType === NFTContractType.ERC721) {
            let gasLimit = BigNumber.from(200_000);

            const transactionArgs: Partial<ethers.Transaction> = {};

            if (!this.isPolygon()) {
                transactionArgs.value = ethers.utils.parseEther(
                    totalPrice.toString()
                );
            }

            try {
                gasLimit = await contract.estimateGas.buyAuthorised(
                    amount,
                    gweiPrice,
                    maxPerAddress,
                    expires,
                    signature,
                    transactionArgs
                );
            } catch {
                this.logger.log(
                    'buyAuthorised',
                    'Unable to calculate gas limit',
                    false
                );
            }

            transactionArgs.gasLimit = gasLimit;

            buyTransaction = await contract.buyAuthorised(
                amount,
                gweiPrice,
                maxPerAddress,
                expires,
                signature,
                transactionArgs
            );
        } else {
            let gasLimit = BigNumber.from(200_000);

            const transactionArgs: Partial<ethers.Transaction> = {};

            if (!this.isPolygon()) {
                transactionArgs.value = ethers.utils.parseEther(
                    totalPrice.toString()
                );
            }

            try {
                gasLimit = await contract.estimateGas.buyAuthorised(
                    tokenId,
                    amount,
                    gweiPrice,
                    maxPerAddress,
                    expires,
                    signature,
                    transactionArgs
                );
            } catch {
                this.logger.log(
                    'buyAuthorised',
                    'Unable to calculate gas limit',
                    false
                );
            }

            transactionArgs.gasLimit = gasLimit;

            buyTransaction = await contract.buyAuthorised(
                tokenId,
                amount,
                gweiPrice,
                maxPerAddress,
                expires,
                signature,
                transactionArgs
            );
        }

        if (wait) {
            this.logger.log('buyAuthorised', 'Waiting on buy transaction...');
            await this.waitForTransaction(buyTransaction);
        }

        return buyTransaction;
    }

    public async transfer(
        to: string,
        tokenId: number,
        amount = 1
    ): Promise<Transaction> {
        const { contract, signer } = await this.getEVMContract();

        this.logger.log('transfer', `Transferring ${tokenId} to ${to}...`);

        let transaction;

        if (this.config.contractType === NFTContractType.ERC721) {
            transaction = await contract[
                'safeTransferFrom(address,address,uint256)'
            ](await signer.getAddress(), to, tokenId);
        } else {
            transaction = await contract[
                'safeTransferFrom(address,address,uint256,uint256,bytes)'
            ](await signer.getAddress(), to, tokenId, amount, '0x');
        }

        this.logger.log(
            'transfer',
            `Transfer started ${tokenId} to ${to}: ${transaction.hash}`
        );

        return transaction;
    }

    public async getTransactionStatus(
        transaction: any
    ): Promise<TransactionStatus> {
        const receipt = await transaction.wait(); // wait for it to resolve to a receipt

        this.logger.log(
            'getTransactionStatus',
            `${transaction.hash} is resolved. Getting transaction status...`
        );

        if (receipt) {
            // failed
            if (receipt.status === 0) {
                this.logger.log(
                    'getTransactionStatus',
                    `${transaction.hash} is Failed`
                );
                return TransactionStatus.Failed;
            }

            // succeeded
            this.logger.log(
                'getTransactionStatus',
                `${transaction.hash} is Complete`
            );
            return TransactionStatus.Complete;
        }

        // no receipt; still pending
        this.logger.log(
            'getTransactionStatus',
            `${transaction.hash} is Pending`
        );
        return TransactionStatus.Pending;
    }

    public async waitForTransaction(
        transaction: Transaction
    ): Promise<TransactionStatus> {
        let status: TransactionStatus;

        this.logger.log(
            'waitForTransaction',
            `Waiting for transaction ${transaction.hash} to resolve...`
        );

        do {
            status = await this.getTransactionStatus(transaction);

            if (status === TransactionStatus.Pending) {
                await GenericHelpers.sleep(1);
            }
        } while (status === TransactionStatus.Pending);

        return status;
    }

    public async burn(
        tokenId: number,
        amount = 1,
        wait = true
    ): Promise<Transaction | TransactionAndStatus> {
        try {
            const { contract, signer } = await this.getEVMContract();
            let burnTransaction: Transaction;

            if (this.config.contractType === NFTContractType.ERC721) {
                this.logger.log('burn', 'starting ERC 721 token burn', false);
                burnTransaction = await contract.burn(tokenId);
            } else {
                const address = await signer.getAddress();
                this.logger.log('burn', 'starting ERC 1155 token burn', false);
                burnTransaction = await contract.burn(address, tokenId, amount);
            }

            if (wait) {
                this.logger.log('burn', 'Waiting on burn transaction...');

                const transactionStatus = await this.waitForTransaction(
                    burnTransaction
                );

                if (transactionStatus === TransactionStatus.Complete) {
                    this.logger.log(
                        'burn',
                        'returning completed burn transaction'
                    );
                    return {
                        hash: burnTransaction.hash,
                        transactionStatus: TransactionStatus.Complete
                    };
                }
                if (transactionStatus === TransactionStatus.Failed) {
                    this.logger.log(
                        'burn',
                        'returning failed burn transaction'
                    );
                    return {
                        hash: burnTransaction.hash,
                        transactionStatus: TransactionStatus.Failed
                    };
                }
            }

            this.logger.log('burn', 'returning burn transaction');
            return burnTransaction;
        } catch (error) {
            this.logger.log(
                'burn',
                'Error while executing burn either you do not have the token in your wallet or something has gone wrong',
                true
            );
        }
    }

    private async loadConfigFromId() {
        const { network } = await this.getContractInformation();
        const { contractAddress, contractType, chain, type, environment } =
            network;

        this.config = {
            ...this.config,
            contractAddress,
            contractType,
            networkChain: chain,
            networkType: type,
            networkEnvironment: environment
        };

        this.wallet = new Wallet(this.config);
    }

    private isPolygon(): boolean {
        return this.config.networkType === NetworkType.Polygon;
    }

    private isMumbai(): boolean {
        return this.config.networkChain === NetworkChain.Mumbai;
    }

    private async getEVMContract(): Promise<{
        contract: ethers.Contract;
        signer: Signer;
    }> {
        const signer = await this.wallet.getSigner();
        let contract: ethers.Contract;

        if (!ethers.utils.isAddress(this.config.contractAddress)) {
            this.logger.log(
                'getEvmContract',
                'Contract address is not a valid Ethereum address',
                true
            );
        }

        try {
            contract = new ethers.Contract(
                this.config.contractAddress,
                this.config.contractType === NFTContractType.ERC721
                    ? ERC721
                    : ERC1155,
                signer
            );
        } catch (e) {
            this.logger.log('getEVMContract', e.message, true);
        }

        return {
            signer,
            contract: contract
        };
    }

    private async validateBuy(
        amount: number,
        tokenId = 0,
        maxPerAddress?: number,
        overrideTotalPrice?: number
    ): Promise<{ totalPrice: number; contractInfo: ContractInformation }> {
        const contractInfo = await this.getContractInformation();

        if (!contractInfo.allowBuyOnNetwork) {
            this.logger.log(
                'validateBuy',
                `Buying on this contract is disabled`,
                true
            );
        }

        const tokenInfo = await this.getToken(tokenId);

        if (tokenInfo.remaining < amount) {
            this.logger.log(
                'validateBuy',
                `Insufficient tokens: Requested: ${amount}, Remaining: ${tokenInfo.remaining}`,
                true
            );
        }

        const maxPerTransaction = tokenInfo.maxPerTransaction;

        if (maxPerTransaction !== 0 && amount > maxPerTransaction) {
            this.logger.log(
                'validateBuy',
                `${amount} Exceeds max per transaction of ${maxPerTransaction}`,
                true
            );
        }

        if (maxPerAddress) {
            const balance = await this.getTotalMinted(tokenId);

            if (balance + amount > maxPerAddress) {
                this.logger.log('validateBuy', `Exceeds max per address`, true);
            }
        }

        this.logger.log('validateBuy', `Checking price...`);
        const price =
            overrideTotalPrice === undefined
                ? tokenInfo.price * amount
                : overrideTotalPrice;

        this.logger.log('validateBuy', `Checking wallet balance...`);
        const walletBalance = await this.getWalletBalance();

        if (walletBalance < price) {
            this.logger.log(
                'validateBuy',
                `Insufficient funds: Wallet balance: ${walletBalance}, Required: ${price}`,
                true
            );
        }

        return { totalPrice: price, contractInfo };
    }

    private async registerChangeEventListeners() {
        const provider = await this.wallet.getWeb3Provider();
        provider.on('chainChanged', this.onWalletChainChanged.bind(this));
        provider.on('accountsChanged', this.onAccountChanged.bind(this));
    }

    private async removeChangeEventListeners() {
        const provider = await this.wallet.getWeb3Provider();

        provider.removeListener(
            'chainChanged',
            this.onWalletChainChanged.bind(this)
        );

        provider.removeListener(
            'accountsChanged',
            this.onAccountChanged.bind(this)
        );
    }

    private async onWalletChainChanged(chainId: any): Promise<void> {
        const chainIdDecimal = parseInt(chainId, 16);
        const isSupported = chainIdDecimal === this.config.networkChain;

        if (!isSupported) {
            this.logger.log('changeChain', 'Chain is unsupported');
        }

        const event = new CustomEvent('hmWalletChainChanged', {
            detail: {
                chainId,
                isSupported
            }
        });

        window.dispatchEvent(event);
    }

    private async onAccountChanged(accounts): Promise<void> {
        const event = new CustomEvent('hmWalletAccountChanged', {
            detail: {
                accounts
            }
        });

        window.dispatchEvent(event);
    }
}
