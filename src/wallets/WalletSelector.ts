import { WalletApp } from '../types/Enums';

const walletSelectorStylesheet = `
    <style>
        #hm-overlay {
            background: rgba(0,0,0,.5);
            bottom: 0;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            color: #FFF;
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 18px;
            left: 0;
            position: fixed;
            right: 0;
            top: 0;
            visibility: hidden;
            opacity: 0;
            z-index: 1000;
            transition: all .15s ease-in;
        }

        #hm-overlay.hm-overlay--active {
            visibility: visible;
            opacity: 1;
        }

        #hm-dialog {
            background: #2B2B2B;
            width: 100%;
            z-index: 100;
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
            padding: 24px 24px 60px 24px;
            visibility: hidden;
            opacity: 0;
            transform: translateY(100px);
            transition: all .2s ease-in;
        }

        #hm-dialog.hm-dialog--active {
            visibility: visible;
            opacity: 1;
            transform: translateY(0px);
        }

        .hm-dialog-header {
            padding-bottom: 24px;
            position: relative;
            font-size: 20px;
        }

        .hm-dialog-header-title {
            font-size: 22px;
            margin: 0;
            text-align: center;
            font-weight: 400;
        }

        #hm-dialog-header-close {
            align-items: center;
            cursor: pointer;
            display: flex;
            justify-content: center;
            height: 20px;
            width: 20px;
            opacity: 0.5;
            position: absolute;
            right: 0;
            top: 0;
            transition: all .15s ease-in;
        }

        #hm-dialog-header-close:hover {
            opacity: 1;
        }

        .hm-wallets {
            margin-bottom: 20px;
        }

        .hm-wallet,
        .hm-payment-provider {
            border: 1px solid #3D3D3D;
            border-radius: 16px;
            display: flex;
            align-items: center;
            padding: 16px;
            justify-content: space-between;
            cursor: pointer;
            margin-bottom: 12px;
            background: transparent;
            transition: background .15s ease-in-out;
        }

        .hm-wallet:hover,
        .hm-payment-provider:hover {
            background: #3D3D3D;
        }

        .hm-wallet-logo img,
        .hm-payment-provider-logo img {
            width: 32px;
            height: 32px;
        }

        .hm-dialog-close-line {
            height: 100%;
            width: 2px;
            background-color: white;
            transform: rotate(135deg) translateY(-2px);
        }

        .hm-dialog-close-line--last {
            transform: rotate(-135deg) translate(-1px, -1px);
        }

        .hm-wallet-divider {
            border: 1px solid #3D3D3D;
        }

        .hm-payment-providers {
            margin: 20px 0px;
        }

        .hm-disabled-wallet {
            background: #343434;
            cursor: not-allowed;
            color: gray;
            opacity: 0.3;
        }

        .hm-hidden-wallet {
            display: none;
        }

        @media screen and (min-width: 440px) {
            #hm-overlay {
                align-items: center;
            }

            #hm-dialog {
                border-radius: 16px;
                max-width: 350px;
                padding: 24px;
                transform: translateY(30px);
            }
        }
    </style>
`;

type Config = {
    walletSelector?: {
        wallets: {
            name: string;
            logo: string;
            walletApp: WalletApp;
            // meta
            isDisabled?: boolean;
        }[];
    };
};

const walletSelectorHtml = (config: Config) => {
    const { walletSelector } = config;

    if (!walletSelector) {
        return '';
    }

    const { wallets } = walletSelector;

    if (!wallets) {
        return '';
    }

    const walletElements = wallets
        .map((wallet) => {
            const { name, logo, walletApp, isDisabled } = wallet;

            return `
                <div class="hm-wallet ${
                    isDisabled && 'hm-disabled-wallet'
                }" data-wallet="${walletApp}">
                    <div class="hm-wallet-name">${name}</div>
                    <div class="hm-wallet-logo"><img src="${logo}" alt="${name}"/></div>
                </div>
            `;
        })
        .join('');

    return `
        <div id="hm-overlay">
            <div id="hm-dialog">
                <div class="hm-dialog-header">
                    <h2 class="hm-dialog-header-title">Connect Wallet</h2>
                    <div id="hm-dialog-header-close">
                        <span class="hm-dialog-close-line"></span>
                        <span class="hm-dialog-close-line hm-dialog-close-line--last"></span>
                    </div>
                </div>

                <div class="hm-wallets">
                    ${walletElements}
                </div>
            </div>
        </div>
    `;
};

export class WalletSelector {
    public static init() {
        const overlay = document.getElementById('hm-overlay');
        const dialog = document.getElementById('hm-dialog');
        const selectorConfig = {
            walletSelector: {
                wallets: [
                    {
                        name: 'MoonPay',
                        logo: 'https://hypermint.com/client-sdk/resources/moonpay.svg',
                        walletApp: WalletApp.MoonPay,
                        isDisabled: false
                    },
                    {
                        name: 'WalletConnect',
                        logo: 'https://hypermint.com/client-sdk/resources/walletconnect.svg',
                        walletApp: WalletApp.WalletConnect,
                        isDisabled: false
                    },
                    {
                        name: 'MetaMask',
                        logo: 'https://hypermint.com/client-sdk/resources/metamask.svg',
                        walletApp: WalletApp.Metamask,
                        isDisabled: !window.ethereum
                    },
                    {
                        name: 'Coinbase Wallet',

                        logo: 'https://hypermint.com/client-sdk/resources/coinbase.png',
                        walletApp: WalletApp.Coinbase,
                        isDisabled: false
                    }
                ]
            }
        };

        if (!overlay || !dialog) {
            document.body.insertAdjacentHTML(
                'beforeend',
                walletSelectorHtml(selectorConfig) + walletSelectorStylesheet
            );
        }
    }

    public static selectWallet(
        configuredWallets: WalletApp[] = [
            WalletApp.MoonPay,
            WalletApp.WalletConnect,
            WalletApp.Metamask,
            WalletApp.Coinbase
        ]
    ): Promise<WalletApp> {
        return new Promise((resolve, reject) => {
            const overlay = document.getElementById('hm-overlay');
            const dialog = document.getElementById('hm-dialog');

            overlay.classList.add('hm-overlay--active');
            dialog.classList.add('hm-dialog--active');

            const closeButton = document.getElementById(
                'hm-dialog-header-close'
            );
            // hide any wallets that are not configured
            const configuredWalletsElements =
                document.querySelectorAll('.hm-wallet');

            for (const wallet of configuredWalletsElements) {
                const walletApp = wallet.getAttribute(
                    'data-wallet'
                ) as WalletApp;

                console.log(walletApp, configuredWallets.includes(walletApp));
                if (!configuredWallets.includes(walletApp)) {
                    wallet.classList.add('hm-hidden-wallet');
                }
            }

            const onClose = () => {
                WalletSelector.closeSelector();
                reject();
            };

            overlay.onclick = onClose;
            closeButton.onclick = onClose;

            const wallets = document.querySelectorAll('.hm-wallet');

            for (const wallet of wallets) {
                // skip disabled wallets
                if (
                    wallet.classList.contains('hm-hidden-wallet') ||
                    wallet.classList.contains('hm-disabled-wallet')
                ) {
                    continue;
                }
                wallet.addEventListener('click', () => {
                    return resolve(
                        wallet.getAttribute('data-wallet') as WalletApp
                    );
                });
            }
        });
    }

    public static closeSelector() {
        const overlay = document.getElementById('hm-overlay');
        const dialog = document.getElementById('hm-dialog');

        if (overlay) overlay.classList.remove('hm-overlay--active');
        if (dialog) dialog.classList.remove('hm-dialog--active');
    }
}
