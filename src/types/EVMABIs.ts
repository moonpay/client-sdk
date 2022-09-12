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
        inputs: [
            {
                internalType: 'string',
                name: '__name',
                type: 'string'
            },
            {
                internalType: 'string',
                name: '__symbol',
                type: 'string'
            },
            {
                internalType: 'uint256',
                name: '_price',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_totalSupply',
                type: 'uint256'
            },
            {
                internalType: 'string',
                name: '_contractMetadataURI',
                type: 'string'
            },
            {
                internalType: 'string',
                name: '_tokenMetadataURI',
                type: 'string'
            },
            {
                internalType: 'bool',
                name: '_allowBuy',
                type: 'bool'
            },
            {
                internalType: 'address',
                name: '_customerAddress',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '_presaleAddress',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: '_maxPerAddress',
                type: 'uint256'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'constructor'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'totalMinted',
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
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'approved',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'Approval',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'operator',
                type: 'address'
            },
            {
                indexed: false,
                internalType: 'bool',
                name: 'approved',
                type: 'bool'
            }
        ],
        name: 'ApprovalForAll',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address'
            }
        ],
        name: 'OwnershipTransferred',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'from',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'Transfer',
        type: 'event'
    },
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
                name: 'to',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
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
                name: '_amount',
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
                name: '_amount',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_price',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_maxPerAddress',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_expires',
                type: 'uint256'
            },
            {
                internalType: 'bytes',
                name: '_signature',
                type: 'bytes'
            }
        ],
        name: 'buyAuthorised',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'contractURI',
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
        name: 'customerAddress',
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
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'getApproved',
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
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'operator',
                type: 'address'
            }
        ],
        name: 'isApprovedForAll',
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
        inputs: [],
        name: 'maxPerAddress',
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
                internalType: 'address[]',
                name: '_accounts',
                type: 'address[]'
            },
            {
                internalType: 'uint256[]',
                name: '_amounts',
                type: 'uint256[]'
            }
        ],
        name: 'mintBatch',
        outputs: [],
        stateMutability: 'nonpayable',
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
        name: 'owner',
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
        name: 'presaleAddress',
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
        name: 'primaryRoyaltyFee',
        outputs: [
            {
                internalType: 'uint96',
                name: '',
                type: 'uint96'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'primaryRoyaltyReceiver',
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
        name: 'purchaseTokenAddress',
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
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '_tokenId',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_salePrice',
                type: 'uint256'
            }
        ],
        name: 'royaltyInfo',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            },
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
            },
            {
                internalType: 'bytes',
                name: '_data',
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
        inputs: [],
        name: 'secondaryRoyaltyFee',
        outputs: [
            {
                internalType: 'uint96',
                name: '',
                type: 'uint96'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'secondaryRoyaltyReceiver',
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
        inputs: [
            {
                internalType: 'bool',
                name: '_allowBuy',
                type: 'bool'
            }
        ],
        name: 'setAllowBuy',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'operator',
                type: 'address'
            },
            {
                internalType: 'bool',
                name: 'approved',
                type: 'bool'
            }
        ],
        name: 'setApprovalForAll',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_customerAddress',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '_presaleAddress',
                type: 'address'
            }
        ],
        name: 'setCustomerAddresses',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '_presale',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_publicSale',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_saleClosed',
                type: 'uint256'
            }
        ],
        name: 'setDates',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: '_contractURI',
                type: 'string'
            },
            {
                internalType: 'string',
                name: '_tokenURI',
                type: 'string'
            }
        ],
        name: 'setMetadataURIs',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: '_newName',
                type: 'string'
            },
            {
                internalType: 'string',
                name: '_newSymbol',
                type: 'string'
            }
        ],
        name: 'setNameAndSymbol',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_purchaseToken',
                type: 'address'
            }
        ],
        name: 'setPurchaseToken',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_primaryReceiver',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '_secondaryReceiver',
                type: 'address'
            },
            {
                internalType: 'uint96',
                name: '_primaryFee',
                type: 'uint96'
            },
            {
                internalType: 'uint96',
                name: '_secondaryFee',
                type: 'uint96'
            }
        ],
        name: 'setRoyalty',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '_price',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_supply',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_maxPerAddress',
                type: 'uint256'
            }
        ],
        name: 'setTokenData',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'supply',
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
                internalType: 'bytes4',
                name: '_interfaceId',
                type: 'bytes4'
            }
        ],
        name: 'supportsInterface',
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
        inputs: [],
        name: 'tokenMetadataURI',
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
                name: '_tokenId',
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
        name: 'transferContractOwnership',
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
                name: 'tokenId',
                type: 'uint256'
            }
        ],
        name: 'transferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address'
            }
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'version',
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
        inputs: [
            {
                internalType: 'string',
                name: '_name',
                type: 'string'
            },
            {
                internalType: 'string',
                name: '_symbol',
                type: 'string'
            },
            {
                internalType: 'string',
                name: '_contractMetadataURI',
                type: 'string'
            },
            {
                internalType: 'string',
                name: '_tokenMetadataURI',
                type: 'string'
            },
            {
                internalType: 'bool',
                name: '_allowBuy',
                type: 'bool'
            },
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'customerAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'collectionOwnerAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'authorisationAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'purchaseTokenAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'managerPrimaryRoyaltyAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'customerPrimaryRoyaltyAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'secondaryRoyaltyAddress',
                        type: 'address'
                    }
                ],
                internalType: 'struct HyperMintERC1155.Addresses',
                name: '_addresses',
                type: 'tuple'
            }
        ],
        stateMutability: 'nonpayable',
        type: 'constructor'
    },
    {
        inputs: [],
        name: 'ArrayLengthMismatch',
        type: 'error'
    },
    {
        inputs: [],
        name: 'BuyDisabled',
        type: 'error'
    },
    {
        inputs: [],
        name: 'ContractCallBlocked',
        type: 'error'
    },
    {
        inputs: [],
        name: 'InsufficientPaymentValue',
        type: 'error'
    },
    {
        inputs: [],
        name: 'MaxPerTransactionsExceeded',
        type: 'error'
    },
    {
        inputs: [],
        name: 'MaxSupplyExceeded',
        type: 'error'
    },
    {
        inputs: [],
        name: 'NewSupplyTooLow',
        type: 'error'
    },
    {
        inputs: [],
        name: 'NotAuthorised',
        type: 'error'
    },
    {
        inputs: [],
        name: 'PublicSaleClosed',
        type: 'error'
    },
    {
        inputs: [],
        name: 'SaleClosed',
        type: 'error'
    },
    {
        inputs: [],
        name: 'SignatureExpired',
        type: 'error'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'account',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'operator',
                type: 'address'
            },
            {
                indexed: false,
                internalType: 'bool',
                name: 'approved',
                type: 'bool'
            }
        ],
        name: 'ApprovalForAll',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousCollectionOwner',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newCollectionOwner',
                type: 'address'
            }
        ],
        name: 'CollectionOwnershipTransferred',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousContractManager',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newContractManager',
                type: 'address'
            }
        ],
        name: 'ContractOwnershipTransferred',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'operator',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'from',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                indexed: false,
                internalType: 'uint256[]',
                name: 'ids',
                type: 'uint256[]'
            },
            {
                indexed: false,
                internalType: 'uint256[]',
                name: 'values',
                type: 'uint256[]'
            }
        ],
        name: 'TransferBatch',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'operator',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'from',
                type: 'address'
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'to',
                type: 'address'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'id',
                type: 'uint256'
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'value',
                type: 'uint256'
            }
        ],
        name: 'TransferSingle',
        type: 'event'
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'string',
                name: 'value',
                type: 'string'
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'id',
                type: 'uint256'
            }
        ],
        name: 'URI',
        type: 'event'
    },
    {
        inputs: [
            {
                internalType: 'uint256[]',
                name: '_newSupplies',
                type: 'uint256[]'
            },
            {
                internalType: 'uint256[]',
                name: '_newPrices',
                type: 'uint256[]'
            },
            {
                internalType: 'uint256[]',
                name: '_maxPerTransactions',
                type: 'uint256[]'
            }
        ],
        name: 'addTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'addresses',
        outputs: [
            {
                internalType: 'address',
                name: 'customerAddress',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'collectionOwnerAddress',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'authorisationAddress',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'purchaseTokenAddress',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'managerPrimaryRoyaltyAddress',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'customerPrimaryRoyaltyAddress',
                type: 'address'
            },
            {
                internalType: 'address',
                name: 'secondaryRoyaltyAddress',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
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
                internalType: 'address[]',
                name: 'accounts',
                type: 'address[]'
            },
            {
                internalType: 'uint256[]',
                name: 'ids',
                type: 'uint256[]'
            }
        ],
        name: 'balanceOfBatch',
        outputs: [
            {
                internalType: 'uint256[]',
                name: '',
                type: 'uint256[]'
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
                name: '_id',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_amount',
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
                name: '_id',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_totalPrice',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_maxPerAddress',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_expires',
                type: 'uint256'
            },
            {
                internalType: 'bytes',
                name: '_signature',
                type: 'bytes'
            }
        ],
        name: 'buyAuthorised',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'collectionOwner',
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
        name: 'contractManager',
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
        name: 'contractURI',
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
                        name: 'maxPerTransactions',
                        type: 'uint256[]'
                    }
                ],
                internalType: 'struct HyperMintERC1155.TokenInfo',
                name: 'tokenInfo',
                type: 'tuple'
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
                internalType: 'address',
                name: 'operator',
                type: 'address'
            }
        ],
        name: 'isApprovedForAll',
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
                internalType: 'bytes32[]',
                name: 'proof',
                type: 'bytes32[]'
            },
            {
                internalType: 'bytes32',
                name: 'root',
                type: 'bytes32'
            },
            {
                internalType: 'bytes32',
                name: 'leaf',
                type: 'bytes32'
            }
        ],
        name: 'isValid',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        stateMutability: 'pure',
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
        name: 'maxPerTransactions',
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
                internalType: 'address[]',
                name: '_to',
                type: 'address[]'
            },
            {
                internalType: 'uint256[][]',
                name: '_ids',
                type: 'uint256[][]'
            },
            {
                internalType: 'uint256[][]',
                name: '_amounts',
                type: 'uint256[][]'
            }
        ],
        name: 'mintBatch',
        outputs: [],
        stateMutability: 'nonpayable',
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
        name: 'owner',
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
        name: 'primaryRoyaltyFee',
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
        name: 'renounceContractOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '_tokenId',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_salePrice',
                type: 'uint256'
            }
        ],
        name: 'royaltyInfo',
        outputs: [
            {
                internalType: 'address',
                name: 'royaltyAddress',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'royaltyAmount',
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
        inputs: [],
        name: 'secondaryRoyaltyFee',
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
                components: [
                    {
                        internalType: 'address',
                        name: 'customerAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'collectionOwnerAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'authorisationAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'purchaseTokenAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'managerPrimaryRoyaltyAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'customerPrimaryRoyaltyAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'secondaryRoyaltyAddress',
                        type: 'address'
                    }
                ],
                internalType: 'struct HyperMintERC1155.Addresses',
                name: '_addresses',
                type: 'tuple'
            }
        ],
        name: 'setAddresses',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'bool',
                name: '_allowBuy',
                type: 'bool'
            }
        ],
        name: 'setAllowBuy',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'operator',
                type: 'address'
            },
            {
                internalType: 'bool',
                name: 'approved',
                type: 'bool'
            }
        ],
        name: 'setApprovalForAll',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '_publicSale',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_saleClosed',
                type: 'uint256'
            }
        ],
        name: 'setDates',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: '_contractURI',
                type: 'string'
            },
            {
                internalType: 'string',
                name: '_tokenURI',
                type: 'string'
            }
        ],
        name: 'setMetadataURIs',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: '_newName',
                type: 'string'
            },
            {
                internalType: 'string',
                name: '_newSymbol',
                type: 'string'
            }
        ],
        name: 'setNameAndSymbol',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '_primaryFee',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_secondaryFee',
                type: 'uint256'
            }
        ],
        name: 'setRoyalty',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '_id',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_price',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_supply',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '_maxPerAddress',
                type: 'uint256'
            }
        ],
        name: 'setTokenData',
        outputs: [],
        stateMutability: 'nonpayable',
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
        inputs: [
            {
                internalType: 'bytes4',
                name: '_interfaceId',
                type: 'bytes4'
            }
        ],
        name: 'supportsInterface',
        outputs: [
            {
                internalType: 'bool',
                name: 'result',
                type: 'bool'
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
                name: '_tokenId',
                type: 'uint256'
            }
        ],
        name: 'totalSupply',
        outputs: [
            {
                internalType: 'uint256',
                name: '_totalSupply',
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
                name: 'newCollectionOwner',
                type: 'address'
            }
        ],
        name: 'transferCollectionOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newContractManager',
                type: 'address'
            }
        ],
        name: 'transferContractManagerOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [],
        name: 'transferContractOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
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
    },
    {
        inputs: [],
        name: 'version',
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
