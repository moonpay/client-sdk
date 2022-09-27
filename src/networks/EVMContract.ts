import { IWalletProvider } from './../types/IWalletProvider';
import { BigNumber, ethers } from 'ethers';
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
import { IContract } from '../types/IContractEvm';
import { Transaction } from '../types/Transaction';
import { WalletFactory } from '../providers/WalletFactory';
import { BaseContract } from './BaseContract';
import { WalletSelector } from '../providers/WalletSelector';
import { formatEther } from 'ethers/lib/utils';
import { IConnectedWallet } from '../types/Wallet';

export class EVMContract extends BaseContract implements IContract {
    private signer: ethers.Signer;

    private walletProvider: IWalletProvider;

    private ethereumProvider: any;

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
        },
        [NetworkChain.Goerli]: {
            chainId: '0x5',
            chainName: 'Goerli',
            rpcUrls: [
                'https://eth-goerli.g.alchemy.com/v2/PLCh4QRFSaauIUqazgnZ97NsgKYHYeJr'
            ],
            blockExplorerUrls: ['https://etherscan.io'],
            nativeCurrency: {
                name: 'ETH',
                symbol: 'GoerliETH',
                decimals: 18
            }
        },
        [NetworkChain.Ethereum]: {
            chainId: '0x1',
            chainName: 'Ethereum',
            rpcUrls: [
                'https://eth-mainnet.g.alchemy.com/v2/zCcvsCCvVTijakQFV7RPcFG7UuhWnu1A'
            ],
            blockExplorerUrls: ['https://etherscan.io'],
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
            }
        }
    };

    constructor(private config: Config) {
        super(config);
        WalletSelector.init();
    }

    public async getConnectedWallet(): Promise<IConnectedWallet> {
        try {
            if (!this.ethereumProvider) throw new Error();

            if (!this.signer) throw new Error();

            let contract = await this.getEVMContract();

            if (this.isPolygon()) {
                contract = await EVMHelpers.getWETHContract(
                    this.config,
                    this.signer
                );
            }

            const address = await this.signer.getAddress();

            const balance: string = this.isPolygon()
                ? await contract.balanceOf(address)
                : await this.signer.getBalance();

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
            try {
                wallet = await WalletSelector.selectWallet(this.logger);
            } catch (e) {
                this.logger.log('connect', 'Failed selecting wallet', true);
                return;
            }
        }

        // TODO: it would be good for the selector to have a loading state and only close after transaction is sent
        WalletSelector.closeSelector(this.logger);

        const walletFactory = new WalletFactory(this.logger, this.config);

        this.walletProvider = await walletFactory.getProvider(wallet);

        let provider = await this.walletProvider.getWeb3Provider();

        this.ethereumProvider = provider.provider;

        const network = await provider.getNetwork();

        if (network.chainId !== this.config.networkChain) {
            this.logger.log('connect', 'Switching network...');

            const chain = this.chains[this.config.networkChain];

            if (!chain) {
                this.logger.log('connect', 'Failed to select network', true);

                return;
            }

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

            if (this.isPolygon()) {
                const contract = EVMHelpers.getWETHContract(
                    this.config,
                    this.signer
                );

                balance = await contract.balanceOf(
                    await this.signer.getAddress()
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

        if (this.isPolygon()) {
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
            let gasLimit = BigNumber.from(200_000);

            const transactionArgs: Partial<ethers.Transaction> = {};

            if (!this.isPolygon()) {
                transactionArgs.value = ethers.utils.parseEther(
                    totalPrice.toString()
                );
            }

            try {
                const estimatedGasLimit = await contract.estimateGas.buy(
                    amount,
                    transactionArgs
                );

                gasLimit = estimatedGasLimit;
            } catch {
                this.logger.log('buy', 'Unable to calculate gas limit', false);
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
                const estimatedGasLimit = await contract.estimateGas.buy(
                    tokenId,
                    amount,
                    transactionArgs
                );

                gasLimit = estimatedGasLimit;
            } catch {
                this.logger.log('buy', 'Unable to calculate gas limit', false);
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

        if (this.isPolygon()) {
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
            let gasLimit = BigNumber.from(200_000);

            const transactionArgs: Partial<ethers.Transaction> = {};

            if (!this.isPolygon()) {
                transactionArgs.value = ethers.utils.parseEther(
                    totalPrice.toString()
                );
            }

            try {
                const estimatedGasLimit =
                    await contract.estimateGas.buyAuthorised(
                        amount,
                        gweiPrice,
                        maxPerAddress,
                        expires,
                        signature,
                        transactionArgs
                    );

                gasLimit = estimatedGasLimit;
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
                const estimatedGasLimit =
                    await contract.estimateGas.buyAuthorised(
                        tokenId,
                        amount,
                        gweiPrice,
                        maxPerAddress,
                        expires,
                        signature,
                        transactionArgs
                    );

                gasLimit = estimatedGasLimit;
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

    public async burn(
        tokenId: number,
        amount: number = 1
    ): Promise<Transaction> {
        try {
            const contract = await this.getEVMContract();
            let burnTransaction: Transaction;
            if (this.config.contractType === NFTContractType.ERC721) {
                this.logger.log('burn', 'starting ERC 721 token burn', false);
                burnTransaction = await contract.burn(tokenId);
                return burnTransaction;
            } else {
                let address = await this.signer.getAddress();
                this.logger.log('burn', 'starting ERC 1155 token burn', false);
                burnTransaction = await contract.burn(address, tokenId, amount);
                return burnTransaction;
            }
        } catch (error) {
            this.logger.log('burn', error.message, true);
        }
    }

    private isPolygon(): boolean {
        return this.config.networkType === NetworkType.Polygon;
    }

    private isMumbai(): boolean {
        return this.config.networkChain === NetworkChain.Mumbai;
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
        this.ethereumProvider.on(
            'chainChanged',
            this.onWalletChainChanged.bind(this)
        );

        this.ethereumProvider.on(
            'accountsChanged',
            this.onAccountChanged.bind(this)
        );
    }

    private async removeChangeEventListeners(): Promise<void> {
        this.ethereumProvider.removeListener(
            'chainChanged',
            this.onWalletChainChanged.bind(this)
        );

        this.ethereumProvider.removeListener(
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
