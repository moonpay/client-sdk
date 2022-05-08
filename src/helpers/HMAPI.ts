import { BuyTokensRequest } from '../types/BuyTokensRequest';
import { Config } from '../types/Config';
import { ContractInformation } from '../types/ContractInformation';
import { TokenInformation } from '../types/TokenInformation';

export class HMAPI {
    public static async getContract(
        config: Config
    ): Promise<ContractInformation> {
        const url = `${HMAPI.getHMBaseUrl(config)}/client/contract/${
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

    public static async getTokens(config: Config): Promise<TokenInformation[]> {
        const url = `${HMAPI.getHMBaseUrl(config)}/client/contract/${
            config.contractId
        }/tokens`;

        return (await fetch(url)).json();
    }

    public static async getToken(
        config: Config,
        tokenId: number
    ): Promise<TokenInformation> {
        const url = `${HMAPI.getHMBaseUrl(config)}/client/contract/${
            config.contractId
        }/tokens/${tokenId}`;

        return (await fetch(url)).json();
    }

    public static async getSolanaApproveInstruction(
        config: Config,
        destination: string,
        tokenId = 1,
        amount = 1
    ) {
        const url = `${HMAPI.getHMBaseUrl(config)}/client/buy-solana`;

        const data: BuyTokensRequest = {
            destination,
            tokenId,
            amount,
            contractId: config.contractId
        };

        return (
            await fetch(url, {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
        ).json();
    }

    private static getHMBaseUrl(config: Config) {
        return config.hmURL ?? 'https://api.hypermint.com';
    }
}
