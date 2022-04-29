import { ethers } from 'ethers';

declare const window;

export enum TransactionStatus {
    Pending = 'Pending',
    Complete = 'Complete',
    Failed = 'Failed'
}

export enum NetworkType {
    Ethereum = 'Ethereum',
    Polygon = 'Polygon',
    Solana = 'Solana'
}

export enum NetworkEnvironment {
    Emulator = 'Emulator',
    Testnet = 'Testnet',
    Mainnet = 'Mainnet'
}

export enum NFTContractType {
    ERC721 = 'ERC721',
    ERC1155 = 'ERC1155'
}

export enum NetworkChain {
    EVMLocal = 1337,
    Ethereum = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Polygon = 137,
    Mumbai = 80001
}

export interface Transaction {
    hash: string;
}

export interface TokenInformation {
    id: number;
    price: number;
    supply: number;
    remaining: number;
    totalSupply: number;
    maxPerAddress: number;
}

export interface ContractInformation {
    name: string;
    symbol: string;
    isBuyEnabled: boolean;
    presaleDate?: Date;
    publicSaleDate?: Date;
    saleClosesAt?: Date;
}

export interface Metadata {
    name: string;
    description: string;
    image: string;
}

export interface Config {
    contractId: string;
    contractAddress: string;
    contractType: NFTContractType;
    networkType: NetworkType;
    networkEnvironment: NetworkEnvironment;
    networkChain: NetworkChain;
    enableLogging?: boolean;
    onWalletChange?: (isValid: boolean) => void;
}

export class Contract {
    private signer: ethers.Signer;

    constructor(private config: Config) {
        if (config.enableLogging) {
            this.log('HM - Logging has been enabled');
        }

        const onChange = async () => {
            this.signer = undefined;

            try {
                await this.connect();
                this.config.onWalletChange
                    ? this.config.onWalletChange(true)
                    : null;
            } catch (e) {
                this.log(`HM - Failed to connect to wallet: ${e.message}`);
                this.config.onWalletChange
                    ? this.config.onWalletChange(false)
                    : false;
            }
        };

        window.ethereum.on('accountsChanged', onChange);
        window.ethereum.on('chainChanged', onChange);
    }

    public async getTestWETH(amount = 0.1) {
        if (
            ![NetworkChain.Mumbai, NetworkChain.EVMLocal].includes(
                this.config.networkChain
            )
        ) {
            this.log('HM - Can only get test WETH on Mumbai');
            throw new Error('HM - Can only get test WETH on Mumbai');
        }

        await this.connect();

        this.log(`HM - Getting ${amount} test WETH...`);
        const wethContract = this.getWETHContract();

        const transaction = await wethContract.deposit({
            value: ethers.utils.parseEther(amount.toString())
        });

        await this.waitForTransaction(transaction);

        this.log(`HM - ${amount} test WETH deposited`);
    }

    public async isWalletValid(): Promise<boolean> {
        try {
            await this.connect();
            this.log(`HM - Wallet valid`);
            return true;
        } catch (e) {
            this.log(`HM - Walled invalid: ${e.message}`);
            return false;
        }
    }

    public async connect() {
        this.log('HM (connect) - Connecting...');

        if (!window.ethereum) {
            this.log('HM (connect) - MetaMask not found');
            throw new Error('HM (connect) - MetaMask not found');
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();

        if (network.chainId !== this.config.networkChain) {
            this.log('HM (connect) - Wrong network selected in MetaMask');
            throw new Error(
                'HM (connect) - Wrong network selected in MetaMask'
            );
        }

        const accounts = await provider.send('eth_requestAccounts', []);

        if (!accounts.length) {
            this.log('HM (connect) - No MetaMask accounts found');
            throw new Error('HM (connect) - No MetaMask accounts found');
        }

        this.log('HM (connect) - Connected');

        this.signer = provider.getSigner();
    }

    public async getTokenBalance(tokenId?: number): Promise<number> {
        if (!this.signer) {
            await this.connect();
        }

        this.log(`HM (getTokenBalance) - Getting token ${tokenId} balance...`);

        const contract = await this.getContract();

        let balance;

        if (this.config.contractType === NFTContractType.ERC721) {
            balance = await contract.balanceOf(await this.signer.getAddress());
        } else {
            if (tokenId === undefined) {
                this.log('HM (getTokenBalance) - Token id required');
                throw new Error('HM (getTokenBalance) - Token id required');
            }

            balance = await contract.balanceOf(
                await this.signer.getAddress(),
                tokenId
            );
        }

        const result = balance.toNumber();
        this.log(
            `HM (getTokenBalance) - Token balance of ${tokenId}: ${result}`
        );
        return result;
    }

    public async getContract(): Promise<ethers.Contract> {
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

    public async getWalletBalance(): Promise<number> {
        if (!this.signer) {
            await this.connect();
        }

        this.log(`HM (getWalletBalance) - Getting wallet balance...`);

        let balance: ethers.BigNumber;

        if (
            [
                NetworkChain.Mumbai,
                NetworkChain.Polygon,
                NetworkChain.EVMLocal
            ].includes(this.config.networkChain)
        ) {
            const contract = this.getWETHContract();
            balance = await contract.balanceOf(window.ethereum.selectedAddress);
        } else {
            balance = await this.signer.getBalance();
        }

        const result = Number(ethers.utils.formatEther(balance));
        this.log(`HM (getWalletBalance) - Wallet balance: ${result}`);
        return result;
    }

    public async burn(tokenId: number, amount?: number): Promise<Transaction> {
        const contract = await this.getContract();

        try {
            let transaction;

            if (this.config.contractType === NFTContractType.ERC721) {
                transaction = await contract.burn(
                    await this.signer.getAddress(),
                    tokenId
                );
            } else {
                transaction = await contract.burn(
                    await this.signer.getAddress(),
                    tokenId,
                    amount
                );
            }

            this.log(
                `HM (burn) - Burn started ${tokenId}: ${transaction.hash}`
            );

            return transaction;
        } catch (e) {
            this.log(`HM (burn) - Failed to burn ${tokenId}: ${e.message}`);
            throw new Error(
                `HM (burn) - Failed to burn ${tokenId}: ${e.message}`
            );
        }
    }

    public async burnBatch(
        tokenIds: number[],
        amounts?: number[]
    ): Promise<Transaction> {
        const contract = await this.getContract();

        if (this.config.contractType !== NFTContractType.ERC1155) {
            this.log(`HM (burnBatch) - Cannot batch burn ERC721 tokens`);
            throw new Error(`HM (burnBatch) - Cannot batch burn ERC721 tokens`);
        }

        try {
            const transaction = await contract.burnBatch(
                await this.signer.getAddress(),
                tokenIds,
                amounts
            );

            this.log(
                `HM (burnBatch) - Burn started ${tokenIds.join(', ')}: ${
                    transaction.hash
                }`
            );

            return transaction;
        } catch (e) {
            this.log(
                `HM (burnBatch) - Failed to burn ${tokenIds.join(', ')}: ${
                    e.message
                }`
            );
            throw new Error(
                `HM (burnBatch) - Failed to burn ${tokenIds.join(', ')}: ${
                    e.message
                }`
            );
        }
    }

    public async buy(
        amount: number,
        tokenId?: number,
        wait = true
    ): Promise<Transaction> {
        const contract = await this.getContract();

        this.log(
            `HM (buy) - Buying ${tokenId ?? ''} x ${amount}. Validating...`
        );

        const { price, contractInfo } = await this.validateBuy(amount, tokenId);

        if (
            contractInfo.publicSaleDate &&
            new Date() < contractInfo.publicSaleDate
        ) {
            this.log(`HM (buy) - Public sale closed`);
            throw new Error(`HM (buy) - Public sale closed`);
        }

        if (
            contractInfo.saleClosesAt &&
            new Date() > contractInfo.saleClosesAt
        ) {
            this.log(`HM (buy) - Sale closed`);
            throw new Error(`HM (buy) - Sale closed`);
        }

        const isPolygon = this.config.networkType === NetworkType.Polygon;

        if (isPolygon) {
            const wethContract = this.getWETHContract();
            const approveTransaction = await wethContract.approve(
                this.config.contractAddress,
                ethers.utils.parseEther(price.toString())
            );

            await this.waitForTransaction(approveTransaction);
        }

        let buyTransaction;

        if (this.config.contractType === NFTContractType.ERC721) {
            if (isPolygon) {
                buyTransaction = await contract.buy(amount);
            } else {
                buyTransaction = await contract.buy(amount, {
                    value: ethers.utils.parseEther(price.toString())
                });
            }
        } else {
            if (isPolygon) {
                buyTransaction = await contract.buy(tokenId, amount);
            } else {
                buyTransaction = await contract.buy(tokenId, amount, {
                    value: ethers.utils.parseEther(price.toString())
                });
            }
        }

        if (wait) {
            await this.waitForTransaction(buyTransaction);
        }

        return buyTransaction;
    }

    public async getPrice(amount: number, tokenId?: number): Promise<number> {
        const contract = await this.getContract();

        this.log(
            `HM (buy) - Getting price${tokenId ? ` of ${tokenId}` : ''}...`
        );

        let price: ethers.BigNumber;

        if (this.config.contractType === NFTContractType.ERC721) {
            price = await contract.price();
        } else {
            price = await contract.prices(tokenId);
        }

        const result = Number(ethers.utils.formatEther(price.mul(amount)));
        this.log(`HM (buy) - Price: ${result}`);
        return result;
    }

    public async buyPresale(
        v: string,
        r: string,
        s: string,
        amount: number,
        tokenId?: number,
        wait = true
    ): Promise<Transaction> {
        const contract = await this.getContract();

        this.log(
            `HM (buyPresale) - Buying ${
                tokenId ?? ''
            } x${amount}. Validating...`
        );

        const { price, contractInfo } = await this.validateBuy(amount, tokenId);

        if (!contractInfo.presaleDate) {
            this.log(
                `HM (buyPresale) - Buy presale is not enabled on this contract`
            );
            throw new Error(
                `HM (buyPresale) - Buy presale is not enabled on this contract`
            );
        }

        if (new Date() < contractInfo.presaleDate) {
            this.log(`HM (buyPresale) - Presale closed`);
            throw new Error(`HM (buyPresale) - Presale closed`);
        }

        if (
            contractInfo.publicSaleDate &&
            new Date() > contractInfo.publicSaleDate
        ) {
            this.log(`HM (buyPresale) - Presale complete`);
            throw new Error(`HM (buyPresale) - Presale complete`);
        }

        const isPolygon = this.config.networkType === NetworkType.Polygon;

        if (isPolygon) {
            const wethContract = this.getWETHContract();
            const approveTransaction = await wethContract.approve(
                this.config.contractAddress,
                ethers.utils.parseEther(price.toString())
            );

            await this.waitForTransaction(approveTransaction);
        }

        let buyTransaction;

        if (this.config.contractType === NFTContractType.ERC721) {
            if (isPolygon) {
                buyTransaction = await contract.buyPresale(amount, v, r, s);
            } else {
                buyTransaction = await contract.buyPresale(amount, v, r, s, {
                    value: ethers.utils.parseEther(price.toString())
                });
            }
        } else {
            if (isPolygon) {
                buyTransaction = await contract.buyPresale(
                    tokenId,
                    amount,
                    v,
                    r,
                    s
                );
            } else {
                buyTransaction = await contract.buyPresale(
                    tokenId,
                    amount,
                    v,
                    r,
                    s,
                    {
                        value: ethers.utils.parseEther(price.toString())
                    }
                );
            }
        }

        if (wait) {
            await this.waitForTransaction(buyTransaction);
        }

        return buyTransaction;
    }

    public async getTokenInformation(): Promise<TokenInformation[]> {
        const contract = await this.getContract();

        this.log(`HM (getTokenInformation) - Getting token information...`);

        const tokenInfo = await contract.getTokenInfo();

        const tokens: TokenInformation[] = [];

        if (this.config.contractType === NFTContractType.ERC721) {
            const token = {
                id: 0,
                price: Number(ethers.utils.formatEther(tokenInfo.price)),
                supply: tokenInfo.supply.toNumber(),
                totalSupply: tokenInfo.totalSupply.toNumber(),
                maxPerAddress: tokenInfo.maxPerAddress.toNumber()
            } as TokenInformation;

            token.remaining = token.totalSupply - token.supply;

            tokens.push(token);
        } else {
            for (let i = 0; i < tokenInfo.supplies.length; i++) {
                const token = {
                    id: i,
                    price: Number(
                        ethers.utils.formatEther(tokenInfo.prices[i])
                    ),
                    supply: tokenInfo.supplies[i].toNumber(),
                    totalSupply: tokenInfo.totalSupplies[i].toNumber(),
                    maxPerAddress: tokenInfo.maxPerAddresses[i].toNumber()
                } as TokenInformation;

                token.remaining = token.totalSupply - token.supply;
                tokens.push(token);
            }
        }

        this.log(`HM (getTokenInformation) - Done`, tokens);

        return tokens;
    }

    public async getContractInformation(): Promise<ContractInformation> {
        const contract = await this.getContract();

        this.log(
            `HM (getContractInformation) - Getting contract information...`
        );

        const presaleAt = (await contract.presaleDate()).toNumber();
        const publicSaleAt = (await contract.publicSaleDate()).toNumber();
        const saleClosesAt = (await contract.saleCloseDate()).toNumber();

        const result = {
            name: await contract.name(),
            symbol: await contract.symbol(),
            isBuyEnabled: await contract.allowBuy(),
            presaleDate: presaleAt ? new Date(presaleAt * 1000) : undefined,
            publicSaleDate: publicSaleAt
                ? new Date(publicSaleAt * 1000)
                : undefined,
            saleClosesAt: saleClosesAt
                ? new Date(saleClosesAt * 1000)
                : undefined
        };

        this.log('HM (getContractInformation) - Done', result);

        return result;
    }

    public async transfer(
        to: string,
        tokenId: number,
        amount?: number
    ): Promise<Transaction> {
        const contract = await this.getContract();

        this.log(`HM (transfer) - Transferring ${tokenId} to ${to}...`);

        let transaction;

        if (this.config.contractType === NFTContractType.ERC721) {
            transaction = await contract.safeTransferFrom(
                await this.signer.getAddress(),
                to,
                tokenId
            );
        } else {
            transaction = await contract.safeTransferFrom(
                await this.signer.getAddress(),
                to,
                tokenId,
                amount,
                '0x'
            );
        }

        this.log(
            `HM (transfer) - Transfer started ${tokenId} to ${to}: ${transaction.hash}`
        );

        return transaction;
    }

    public async getTokenMetadataUrl(tokenId: number): Promise<string> {
        const contract = await this.getContract();

        this.log(
            `HM (getTokenMetadataUrl) - Getting metadata url for ${tokenId}...`
        );

        const url =
            this.config.contractType === NFTContractType.ERC721
                ? await contract.tokenURI(tokenId)
                : (await contract.uri(tokenId)).replace('{id}', tokenId);

        this.log(
            `HM (getTokenMetadataUrl) - Metadata url for ${tokenId}: ${url}`
        );

        return url;
    }

    public async getTokenMetadata(tokenId: number): Promise<Metadata> {
        this.log(`HM (getTokenMetadata) - Getting metadata for ${tokenId}...`);

        const data = await (
            await fetch(await this.getTokenMetadataUrl(tokenId))
        ).json();

        if (data) {
            const keys = ['image'];

            for (const key of keys) {
                data[key] = data[key].replace(
                    'ipfs://',
                    'https://ipfs.io/ipfs/'
                );
            }
        }

        this.log(`HM (getTokenMetadata) - Metadata for ${tokenId}`, data);

        return data;
    }

    public async getTransactionStatus(
        transaction: Transaction
    ): Promise<TransactionStatus> {
        if (!this.signer) {
            await this.connect();
        }

        this.log(
            `HM (getTransactionStatus) - Getting transaction status for ${transaction.hash}`
        );

        const receipt = await this.signer.provider.getTransactionReceipt(
            transaction.hash
        );

        if (receipt) {
            if (receipt.status === 0) {
                this.log(
                    `HM (getTransactionStatus) - ${transaction.hash} : Failed`
                );
                return TransactionStatus.Failed;
            }

            this.log(
                `HM (getTransactionStatus) - ${transaction.hash} : Complete`
            );
            return TransactionStatus.Complete;
        }

        this.log(`HM (getTransactionStatus) - ${transaction.hash} : Pending`);
        return TransactionStatus.Pending;
    }

    public async waitForTransaction(
        transaction: Transaction
    ): Promise<TransactionStatus> {
        let status: TransactionStatus;

        this.log(
            `HM (waitForTransaction) - Waiting for transaction ${transaction.hash}...`
        );

        do {
            status = await this.getTransactionStatus(transaction);

            if (status === TransactionStatus.Pending) {
                await this.sleep(1);
            }
        } while (status === TransactionStatus.Pending);

        this.log(
            `HM (waitForTransaction) - Transaction ${transaction.hash}: ${status}`
        );

        return status;
    }

    public async getMoonPayWidgetUrl(tokenId: number): Promise<string> {
        const response = await fetch(
            `https://api.hypermint.com/moonpay/widget/${this.config.contractId}/${tokenId}`
        );

        const url = await response.text();

        this.log(`HM - MoonPay Widget Url: ${url}`);

        return url;
    }

    private async validateBuy(
        amount: number,
        tokenId = 0
    ): Promise<{ price: number; contractInfo: ContractInformation }> {
        const contractInfo = await this.getContractInformation();

        if (!contractInfo.isBuyEnabled) {
            this.log(`HM (buy) - Buying on this contract is disabled`);
            throw new Error(`HM (buy) - Buying on this contract is disabled`);
        }

        const tokenInfo = await this.getTokenInformation();

        if (tokenInfo[tokenId].remaining < amount) {
            this.log(
                `HM (buy) - Insufficient tokens: Requested: ${amount}, Remaining: ${tokenInfo[tokenId].remaining}`
            );
            throw new Error(
                `HM (buy) - Insufficient tokens: Requested: ${amount}, Remaining: ${tokenInfo[tokenId].remaining}`
            );
        }

        if (tokenInfo[tokenId].maxPerAddress) {
            const balance = await this.getTokenBalance(tokenId);

            if (balance + amount > tokenInfo[tokenId].maxPerAddress) {
                this.log(`HM (buy) - Exceeds max per address`);
                throw new Error(`HM (buy) - Exceeds max per address`);
            }
        }

        this.log(`HM (buy) - Checking price...`);
        const price = await this.getPrice(amount, tokenId);

        this.log(`HM (buy) - Checking wallet balance...`);
        const walletBalance = await this.getWalletBalance();

        if (walletBalance < price) {
            this.log(
                `HM (buy) - Insufficient funds: Wallet balance: ${walletBalance}, Required: ${price}`
            );
            throw new Error(
                `HM (buy) - Insufficient funds: Wallet balance: ${walletBalance}, Required: ${price}`
            );
        }

        return { price, contractInfo };
    }

    private log(message: string, data?: any) {
        if (this.config.enableLogging) {
            console.log(message);

            if (data) {
                console.log(data);
            }
        }
    }

    private async sleep(seconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000 * seconds);
        });
    }

    private getWETHContract() {
        let address;

        switch (this.config.networkChain) {
            case NetworkChain.EVMLocal:
                address = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
                break;

            case NetworkChain.Mumbai:
                address = '0xf42C211eC35A17d6192e44928c65f7a65fBfEDF2';
                break;

            case NetworkChain.Polygon:
                address = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619';
                break;

            default:
                throw new Error(
                    `HM (getWETHContract) - Cannot get WETH contract for network ${this.config.networkChain}`
                );
        }

        return new ethers.Contract(address, WETHABI, this.signer);
    }
}

export const WETHABI = [
    {
        constant: true,
        inputs: [
            {
                name: '',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [
            {
                name: '',
                type: 'uint256'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        constant: false,
        inputs: [
            {
                name: 'guy',
                type: 'address'
            },
            {
                name: 'wad',
                type: 'uint256'
            }
        ],
        name: 'approve',
        outputs: [
            {
                name: '',
                type: 'bool'
            }
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        constant: false,
        inputs: [],
        name: 'deposit',
        outputs: [],
        payable: true,
        stateMutability: 'payable',
        type: 'function'
    }
];

export const ERC721 = [
    {
        inputs: [],
        name: 'allowBuy',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'burn',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            }
        ],
        name: 'buy',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            },
            {
                internalType: 'uint8',
                name: '_v',
                type: 'uint8'
            },
            {
                internalType: 'bytes32',
                name: '_r',
                type: 'bytes32'
            },
            {
                internalType: 'bytes32',
                name: '_s',
                type: 'bytes32'
            }
        ],
        name: 'buyPresale',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'getTokenInfo',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'price',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'supply',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalSupply',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'maxPerAddress',
                        type: 'uint256'
                    }
                ],
                internalType: 'struct HyperMintERC721.TokenInfo',
                name: '',
                type: 'tuple'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'name',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'ownerOf',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'presaleDate',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'price',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'publicSaleDate',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'saleCloseDate',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'symbol',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'tokenURI',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];

export const ERC1155 = [
    {
        inputs: [],
        name: 'allowBuy',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'id',
                type: 'uint256'
            }
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'id',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256'
            }
        ],
        name: 'burn',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address'
            },
            {
                internalType: 'uint256[]',
                name: 'ids',
                type: 'uint256[]'
            },
            {
                internalType: 'uint256[]',
                name: 'values',
                type: 'uint256[]'
            }
        ],
        name: 'burnBatch',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'id',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            }
        ],
        name: 'buy',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'id',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            },
            {
                internalType: 'uint8',
                name: '_v',
                type: 'uint8'
            },
            {
                internalType: 'bytes32',
                name: '_r',
                type: 'bytes32'
            },
            {
                internalType: 'bytes32',
                name: '_s',
                type: 'bytes32'
            }
        ],
        name: 'buyPresale',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'getTokenInfo',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256[]',
                        name: 'prices',
                        type: 'uint256[]'
                    },
                    {
                        internalType: 'uint256[]',
                        name: 'supplies',
                        type: 'uint256[]'
                    },
                    {
                        internalType: 'uint256[]',
                        name: 'totalSupplies',
                        type: 'uint256[]'
                    },
                    {
                        internalType: 'uint256[]',
                        name: 'maxPerAddresses',
                        type: 'uint256[]'
                    }
                ],
                internalType: 'struct HyperMintERC1155.TokenInfo',
                name: '',
                type: 'tuple'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'name',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'presaleDate',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        name: 'prices',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'publicSaleDate',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256[]',
                name: 'ids',
                type: 'uint256[]'
            },
            {
                internalType: 'uint256[]',
                name: 'amounts',
                type: 'uint256[]'
            },
            {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes'
            }
        ],
        name: 'safeBatchTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'id',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            },
            {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes'
            }
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'saleCloseDate',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        name: 'supplies',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'symbol',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        name: 'totalSupplies',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        name: 'uri',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
