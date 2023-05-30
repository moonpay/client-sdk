import { AuthoriseEVMBuyResponse } from '../types/AuthoriseEVMBuyResponse';
import { BuyTokensRequest } from '../types/BuyTokensRequest';
import { BuyTokensResponse } from '../types/BuyTokensResponse';
import { ContractConfig } from '../types/ContractConfig';
import { ContractInformation } from '../types/ContractInformation';
import { TokenInformation } from '../types/TokenInformation';
import { UpdateBuyTokenRequest } from '../types/UpdateBuyTokenRequest';
import { BaseConfig } from '../types/BaseConfig';
import { AuthenticateStartResponse } from '../types/AuthenticateStartResponse';
import { AuthenticateConfig } from '../types/AuthenticateConfig';
import { AuthenticateCompleteInput } from '../types/AuthenticateCompleteInput';
import { AuthenticateCompleteResponse } from '../types/AuthenticateCompleteResponse';

// TODO: convert to a stateful API client rather than statics
export class HMAPI {
    public static async getContract(
        config: ContractConfig
    ): Promise<ContractInformation> {
        const url = `${HMAPI.getHMBaseUrl(config)}/nft-contract/${
            config.contractId
        }`;

        const result: ContractInformation = await (await fetch(url)).json();

        const dateFields = ['presaleAt', 'publicSaleAt', 'saleClosesAt'];

        for (const field of dateFields) {
            if (result[field]) {
                result[field] = new Date(result[field]);
            }
        }

        return result;
    }

    public static async getTokens(
        config: ContractConfig
    ): Promise<TokenInformation[]> {
        const url = `${HMAPI.getHMBaseUrl(config)}/nft-contract/${
            config.contractId
        }/tokens`;

        return (await fetch(url)).json();
    }

    public static async getToken(
        config: ContractConfig,
        tokenId: number
    ): Promise<TokenInformation> {
        const url = `${HMAPI.getHMBaseUrl(config)}/nft-contract/${
            config.contractId
        }/token/${tokenId}`;

        return (await fetch(url)).json();
    }

    public static async getTokenAllocationForAddress(
        config: ContractConfig,
        tokenId: string,
        walletAddress: string
    ) {
        const url = `${HMAPI.getHMBaseUrl(config)}/nft-contract/${
            config.contractId
        }/token/${tokenId}/allocation/${walletAddress}`;

        return (await fetch(url)).json();
    }

    public static async getSolanaApproveInstruction(
        config: ContractConfig,
        destination: string,
        tokenId = 1,
        amount = 1
    ): Promise<BuyTokensResponse> {
        const url = `${HMAPI.getHMBaseUrl(config)}/solana/buy`;

        const data: BuyTokensRequest = {
            destination,
            tokenId,
            amount,
            contractId: config.contractId
        };

        const result = await (
            await fetch(url, {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
        ).json();

        if (result.error) {
            throw new Error(result.error);
        }

        return result;
    }

    public static async updateSolanaBuyRequest(
        config: ContractConfig,
        mintId: string,
        transactionHash: string
    ): Promise<boolean> {
        const url = `${HMAPI.getHMBaseUrl(config)}/solana/buy`;

        const data: UpdateBuyTokenRequest = {
            mintId,
            transactionHash
        };

        return (
            await fetch(url, {
                method: 'PATCH',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
        ).json();
    }

    public static async authoriseEVMBuy(
        config: ContractConfig,
        tokenId: number,
        address: string,
        amount: number
    ): Promise<AuthoriseEVMBuyResponse> {
        const url = `${HMAPI.getHMBaseUrl(config)}/nft-contract/${
            config.contractId
        }/token/${tokenId}/authorise-buy?address=${address}&amount=${amount}`;

        return (await fetch(url)).json();
    }

    public static async getMoonPayWidgetUrl(
        config: ContractConfig,
        tokenId: number,
        walletAddress?: string,
    ): Promise<string> {
        const url = `${HMAPI.getHMBaseUrl(config)}/moonpay/widget/${
            config.contractId
        }/${tokenId}${
            walletAddress ? `?walletAddress=${walletAddress}` : ""
        }`;

        const result = await fetch(url);

        return result.text();
    }

    public static async startAuthentication(
        config: AuthenticateConfig,
        address: string
    ): Promise<AuthenticateStartResponse> {
        const url = `${HMAPI.getHMBaseUrl(config)}/authenticate/${
            config.appId
        }/${address}`;

        const response = await (await fetch(url)).json();

        if (response.error) {
            throw new Error(response.error);
        }

        return response;
    }

    public static async completeAuthentication(
        config: AuthenticateConfig,
        address: string,
        input: AuthenticateCompleteInput
    ): Promise<AuthenticateCompleteResponse> {
        const url = `${HMAPI.getHMBaseUrl(config)}/authenticate/${
            config.appId
        }/${address}`;

        const response = await (
            await fetch(url, {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(input)
            })
        ).json();

        if (response.error) {
            throw new Error(response.error);
        }

        return response;
    }

    private static getHMBaseUrl(config: BaseConfig) {
        return config.hmURL ?? 'https://api.hypermint.com/v1';
    }
}
