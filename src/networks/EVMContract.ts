import { ethers } from 'ethers';
import { EVMHelpers } from '../helpers/EVMHelpers';
import { GenericHelpers } from '../helpers/GenericHelpers';
import { HMAPI } from '../helpers/HMAPI';
import { Config } from '../types/Config';
import { ContractInformation } from '../types/ContractInformation';
import {
    NetworkType,
    NFTContractType,
    TransactionStatus
} from '../types/Enums';
import { ERC1155, ERC721 } from '../types/EVMABIs';
import { IContract } from '../types/IContract';
import { Transaction } from '../types/Transaction';
import { BaseContract } from './BaseContract';

declare const window;

export class EVMContract extends BaseContract implements IContract {
    private signer: ethers.Signer;

    constructor(private config: Config) {
        super(config);

        const onChange = async () => {
            this.signer = undefined;

            try {
                await this.connect();

                this.config.onWalletChange
                    ? this.config.onWalletChange(true)
                    : null;
            } catch (e) {
                this.logger.log(
                    'constructor',
                    `Failed to connect to wallet: ${e.message}`
                );
                this.config.onWalletChange
                    ? this.config.onWalletChange(false)
                    : false;
            }
        };

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', onChange);
            window.ethereum.on('chainChanged', onChange);
        }
    }

    public async getTestWETH(amount = 0.1) {
        if (this.isPolygon()) {
            this.logger.log(
                'getTestWETH',
                'Can only get test WETH on Mumbai',
                true
            );
        }

        await this.connect();

        this.logger.log('getTestWETH', `Getting ${amount} test WETH...`);

        const wethContract = EVMHelpers.getWETHContract(
            this.config,
            this.signer
        );

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

    public async connect() {
        this.logger.log('connect', 'Connecting...');

        if (!window.ethereum) {
            this.logger.log('connect', 'MetaMask wallet not found', true);
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();

        if (network.chainId !== this.config.networkChain) {
            this.logger.log(
                'connect',
                'Wrong network selected in MetaMask',
                true
            );
        }

        const accounts = await provider.send('eth_requestAccounts', []);

        if (!accounts.length) {
            this.logger.log('connect', 'No MetaMask accounts found', true);
        }

        this.signer = provider.getSigner();

        this.logger.log('connect', 'Connected');
    }

    public async getTokenBalance(tokenId?: number): Promise<number> {
        this.logger.log(
            'getTokenBalance',
            `Getting token ${tokenId} balance...`
        );

        const contract = await this.getEVMContract();

        let balance;

        if (this.config.contractType === NFTContractType.ERC721) {
            balance = await contract.balanceOf(await this.signer.getAddress());
        } else {
            if (tokenId === undefined) {
                this.logger.log('getTokenBalance', 'Token id required', true);
            }

            balance = await contract.balanceOf(
                await this.signer.getAddress(),
                tokenId
            );
        }

        const result = balance.toNumber();
        this.logger.log(
            'getTokenBalance',
            `Token balance of ${tokenId}: ${result}`
        );
        return result;
    }

    public async getWalletBalance(): Promise<number> {
        if (!this.signer) {
            await this.connect();
        }

        try {
            this.logger.log('getWalletBalance', `Getting wallet balance...`);

            let balance: ethers.BigNumber;

            if (this.config.networkType === NetworkType.Polygon) {
                const contract = EVMHelpers.getWETHContract(
                    this.config,
                    this.signer
                );
                balance = await contract.balanceOf(
                    window.ethereum.selectedAddress
                );
            } else {
                balance = await this.signer.getBalance();
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
        const contract = await this.getEVMContract();

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

        const isPolygon = this.config.networkType === NetworkType.Polygon;

        if (isPolygon) {
            this.logger.log('buy', 'Creating approve transaction...');

            const wethContract = EVMHelpers.getWETHContract(
                this.config,
                this.signer
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
            if (isPolygon) {
                buyTransaction = await contract.buy(amount);
            } else {
                buyTransaction = await contract.buy(amount, {
                    value: ethers.utils.parseEther(totalPrice.toString())
                });
            }
        } else {
            if (isPolygon) {
                buyTransaction = await contract.buy(tokenId, amount);
            } else {
                buyTransaction = await contract.buy(tokenId, amount, {
                    value: ethers.utils.parseEther(totalPrice.toString())
                });
            }
        }

        if (wait) {
            this.logger.log('buy', 'Waiting on buy transaction...');
            await this.waitForTransaction(buyTransaction);
        }

        return buyTransaction;
    }

    public async buyAuthorised(
        amount: number,
        tokenId: number = 0,
        wait = true,
        ethPrice?: number,
        expires?: number,
        signature?: string
    ): Promise<Transaction> {
        const contract = await this.getEVMContract();
        const address = await this.signer.getAddress();
        this.logger.log(
            'buyAuthorised',
            `Buying ${tokenId ?? ''} x${amount}. Validating...`
        );

        let maxPerAddress;
        if (!ethPrice || !expires || !signature) {
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
            ethPrice = authoriseResponse.price;
            expires = authoriseResponse.expires;
            signature = authoriseResponse.signature;
        }

        const { totalPrice, contractInfo } = await this.validateBuy(
            amount,
            tokenId,
            maxPerAddress,
            ethPrice
        );

        if (
            contractInfo.publicSaleAt &&
            new Date() > contractInfo.publicSaleAt
        ) {
            this.logger.log('buyAuthorised', `Buy complete`, true);
        }

        const isPolygon = this.config.networkType === NetworkType.Polygon;

        if (isPolygon) {
            this.logger.log('buyAuthorised', 'Creating approve transaction...');

            const wethContract = EVMHelpers.getWETHContract(
                this.config,
                this.signer
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
        let gweiPrice = ethers.utils.parseEther(ethPrice.toString());

        if (this.config.contractType === NFTContractType.ERC721) {
            if (isPolygon) {
                buyTransaction = await contract.buyAuthorised(
                    amount,
                    gweiPrice,
                    expires,
                    signature
                );
            } else {
                buyTransaction = await contract.buyAuthorised(
                    amount,
                    gweiPrice,
                    expires,
                    signature,
                    {
                        value: ethers.utils.parseEther(totalPrice.toString())
                    }
                );
            }
        } else {
            if (isPolygon) {
                buyTransaction = await contract.buyAuthorised(
                    tokenId,
                    amount,
                    gweiPrice,
                    expires,
                    signature
                );
            } else {
                buyTransaction = await contract.buyAuthorised(
                    tokenId,
                    amount,
                    gweiPrice,
                    expires,
                    signature,
                    {
                        value: ethers.utils.parseEther(totalPrice.toString())
                    }
                );
            }
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
        amount?: number
    ): Promise<Transaction> {
        const contract = await this.getEVMContract();

        this.logger.log('transfer', `Transferring ${tokenId} to ${to}...`);

        let transaction;

        if (this.config.contractType === NFTContractType.ERC721) {
            transaction = await contract[
                'safeTransferFrom(address,address,uint256)'
            ](await this.signer.getAddress(), to, tokenId);
        } else {
            transaction = await contract[
                'safeTransferFrom(address,address,uint256,bytes)'
            ](await this.signer.getAddress(), to, tokenId, '0x');
        }

        this.logger.log(
            'transfer',
            `Transfer started ${tokenId} to ${to}: ${transaction.hash}`
        );

        return transaction;
    }

    public async getTransactionStatus(
        transaction: Transaction
    ): Promise<TransactionStatus> {
        if (!this.signer) {
            await this.connect();
        }

        this.logger.log(
            'getTransactionStatus',
            `Getting transaction status for ${transaction.hash}`
        );

        const receipt = await this.signer.provider.getTransactionReceipt(
            transaction.hash
        );

        if (receipt) {
            if (receipt.status === 0) {
                this.logger.log(
                    'getTransactionStatus',
                    `${transaction.hash} : Failed`
                );
                return TransactionStatus.Failed;
            }

            this.logger.log(
                'getTransactionStatus',
                `${transaction.hash} : Complete`
            );
            return TransactionStatus.Complete;
        }

        this.logger.log(
            'getTransactionStatus',
            `${transaction.hash} : Pending`
        );
        return TransactionStatus.Pending;
    }

    public async waitForTransaction(
        transaction: Transaction
    ): Promise<TransactionStatus> {
        let status: TransactionStatus;

        this.logger.log(
            'waitForTransaction',
            `Waiting for transaction ${transaction.hash}...`
        );

        do {
            status = await this.getTransactionStatus(transaction);

            if (status === TransactionStatus.Pending) {
                await GenericHelpers.sleep(1);
            }
        } while (status === TransactionStatus.Pending);

        this.logger.log(
            'waitForTransaction',
            `Transaction ${transaction.hash}: ${status}`
        );

        return status;
    }

    private isPolygon(): boolean {
        return this.config.networkType === NetworkType.Polygon;
    }

    private async getEVMContract(): Promise<ethers.Contract> {
        if (!this.signer) {
            await this.connect();
        }

        return new ethers.Contract(
            this.config.contractAddress,
            this.config.contractType === NFTContractType.ERC721
                ? ERC721
                : ERC1155,
            this.signer
        );
    }

    private async validateBuy(
        amount: number,
        tokenId = 0,
        overrideMaxPerAddress?: number,
        overrideTokenPrice?: number
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

        let maxPerAddress = tokenInfo.maxPerAddress;
        if (overrideMaxPerAddress) {
            maxPerAddress = overrideMaxPerAddress;
        }

        if (maxPerAddress) {
            const balance = await this.getTokenBalance(tokenId);

            if (balance + amount > maxPerAddress) {
                this.logger.log('validateBuy', `Exceeds max per address`, true);
            }
        }

        this.logger.log('validateBuy', `Checking price...`);
        let price = tokenInfo.price * amount;
        if (overrideTokenPrice) {
            price = overrideTokenPrice * amount;
        }

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
}
