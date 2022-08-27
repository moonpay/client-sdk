import { IWalletProvider } from './../types/IWalletProvider';
import { ethers } from 'ethers';
import { EVMHelpers } from '../helpers/EVMHelpers';
import { GenericHelpers } from '../helpers/GenericHelpers';
import { HMAPI } from '../helpers/HMAPI';
import { Config } from '../types/Config';
import { ContractInformation } from '../types/ContractInformation';
import {
    NetworkChain,
    NetworkType,
    NFTContractType,
    TransactionStatus,
    WalletProvider
} from '../types/Enums';
import { ERC1155, ERC721 } from '../types/EVMABIs';
import { IContract } from '../types/IContract';
import { Transaction } from '../types/Transaction';
import { WalletFactory } from '../providers/WalletFactory';
import { BaseContract } from './BaseContract';
import { WalletSelector } from '../providers/WalletSelector';

declare const window;

export class EVMContract extends BaseContract implements IContract {
    private signer: ethers.Signer;

    private walletProvider: IWalletProvider;

    private chains = {
        [NetworkChain.EVMLocal]: {
            chainId: '0x539',
            chainName: 'Local',
            rpcUrls: ['http://localhost:8545'],
            nativeCurrency: {
                name: 'ETH Test',
                symbol: 'ETEST',
                decimals: 18
            }
        },
        [NetworkChain.Mumbai]: {
            chainId: '0x13881',
            chainName: 'Mumbai',
            rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
            blockExplorerUrls: ['https://mumbai.polygonscan.com'],
            nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
            }
        },
        [NetworkChain.Polygon]: {
            chainId: '0x89',
            chainName: 'Polygon',
            rpcUrls: ['https://polygon-rpc.com'],
            blockExplorerUrls: ['https://polygonscan.com'],
            nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
            }
        }
    };

    constructor(private config: Config) {
        super(config);
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
            await this.connect(); // TODO: Might be best to send a requestAccounts rather than just init the connect everytime
            this.logger.log('isWalletValid', `Wallet valid`);
            return true;
        } catch (e) {
            this.logger.log('isWalletValid', `Walled invalid: ${e.message}`);
            return false;
        }
    }

    public async connect(wallet?: WalletProvider) {
        if (this.signer) {
            return;
        }

        if (!wallet) {
            wallet = await WalletSelector.selectWallet(this.logger);
        }

        const walletFactory = new WalletFactory(this.logger, this.config);
        this.walletProvider = await walletFactory.getProvider(wallet);

        let provider = await this.walletProvider.getWeb3Provider();

        const network = await provider.getNetwork();

        if (network.chainId !== this.config.networkChain) {
            this.logger.log('connect', 'Switching network...');

            const chain = this.chains[this.config.networkChain];

            try {
                await provider.send('wallet_switchEthereumChain', [
                    { chainId: chain.chainId }
                ]);
            } catch (switchError) {
                this.logger.log(
                    'connect',
                    'Adding network...',
                    false,
                    switchError
                );

                try {
                    await provider.send('wallet_addEthereumChain', [chain]);
                } catch (addError) {
                    this.logger.log(
                        'connect',
                        'Failed to select network',
                        true,
                        addError
                    );
                }
            }

            provider = await this.walletProvider.getWeb3Provider();
        }

        if (wallet !== WalletProvider.WalletConnect) {
            const accounts = await provider.send('eth_requestAccounts', []);

            if (!accounts.length) {
                this.logger.log('connect', 'No accounts found', true);
            }
        }

        await this.registerChangeEventListeners();

        this.signer = provider.getSigner();

        this.logger.log('connect', 'Connected');
    }

    public disconnect() {
        this.signer = undefined;
        this.removeChangeEventListeners();
        this.logger.log('disconnect', 'Disconnected');
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

    public async getTotalMinted(tokenId?: number): Promise<number> {
        this.logger.log(
            'getTotalMinted',
            `Getting token ${tokenId} total minted...`
        );

        const contract = await this.getEVMContract();

        let balance;

        if (this.config.contractType === NFTContractType.ERC721) {
            balance = await contract.totalMinted(
                await this.signer.getAddress()
            );
        } else {
            if (tokenId === undefined) {
                this.logger.log('getTotalMinted', 'Token id required', true);
            }

            // TODO: Migrate to total minted
            balance = await contract.balanceOf(
                await this.signer.getAddress(),
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
        tokenId = 0,
        wait = true,
        ethPrice?: number,
        maxPerAddress?: number,
        expires?: number,
        signature?: string
    ): Promise<Transaction> {
        const contract = await this.getEVMContract();
        const address = await this.signer.getAddress();
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
        const gweiPrice = ethers.utils.parseEther(totalPrice.toString());

        if (this.config.contractType === NFTContractType.ERC721) {
            if (isPolygon) {
                buyTransaction = await contract.buyAuthorised(
                    amount,
                    gweiPrice,
                    maxPerAddress,
                    expires,
                    signature
                );
            } else {
                buyTransaction = await contract.buyAuthorised(
                    amount,
                    gweiPrice,
                    maxPerAddress,
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
                    maxPerAddress,
                    expires,
                    signature
                );
            } else {
                buyTransaction = await contract.buyAuthorised(
                    tokenId,
                    amount,
                    gweiPrice,
                    maxPerAddress,
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

    public async transfer(to: string, tokenId: number): Promise<Transaction> {
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

    private async registerChangeEventListeners(): Promise<void> {
        await Promise.all([
            this.walletProvider.addAccountChangedEventListener(
                this.onWalletAccountsChanged
            ),
            this.walletProvider.addChainChangedEventListener(
                this.onWalletChainChanged
            )
        ]);
    }

    private async removeChangeEventListeners(): Promise<void> {
        await Promise.all([
            this.walletProvider.removeAccountChangedEventListener(
                this.onWalletAccountsChanged
            ),
            this.walletProvider.removeChainChangedEventListener(
                this.onWalletChainChanged
            )
        ]);
    }

    private async onWalletAccountsChanged(): Promise<void> {
        this.disconnect();

        let walletChangeIsValid = false;

        try {
            await this.connect();

            walletChangeIsValid = true;
        } catch (e) {
            this.logger.log(
                'constructor',
                `Failed to connect to wallet: ${e.message}`
            );
        } finally {
            this.config.onWalletChange
                ? this.config.onWalletChange(walletChangeIsValid)
                : null;
        }
    }

    private async onWalletChainChanged(chainId: number): Promise<void> {
        this.disconnect();

        let walletChangeIsValid = false;

        try {
            await this.connect();

            walletChangeIsValid = true;
        } catch (e) {
            this.logger.log(
                'constructor',
                `Failed to connect to wallet: ${e.message}`
            );
        } finally {
            this.config.onWalletChange
                ? this.config.onWalletChange(walletChangeIsValid)
                : null;
        }
    }
}
