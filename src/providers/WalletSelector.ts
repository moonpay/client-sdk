import { WalletProvider } from '../types/Enums';
import { Logger } from '../helpers/Logger';

const stylesheet = `
    <style>
        #hm-container {
            display: flex;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #FFF;
            font-size: 18px;
        }

        #hm-container #hm-overlay {
            background: rgba(0,0,0,.5);
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
        }

        #hm-container #hm-dialog {
            background: #2B2B2B;
            width: 350px;
            margin: auto;
            z-index: 100;
            border-radius: 16px;
            padding: 24px;
        }

        #hm-container #hm-dialog-header {
            padding-bottom: 24px;
            position: relative;
            font-size: 20px;
        }

        #hm-container #hm-dialog-header-title {
            text-align: center;
        }

        #hm-container #hm-dialog-header-close {
            position: absolute;
            opacity: 0.5;
            top: 0;
            right: 0;
            cursor: pointer;
        }

        #hm-container #hm-dialog-header-close:hover {
            opacity: 1;
        }

        #hm-container .hm-wallet {
            border: 1px solid #3D3D3D;
            border-radius: 16px;
            display: flex;
            align-items: center;
            padding: 16px;
            justify-content: space-between;
            cursor: pointer;
            margin-bottom: 12px;
        }

        #hm-container .hm-wallet:hover {
            background: #3D3D3D;
        }

        #hm-container .hm-wallet-logo img {
          width: 32px;
          height: 32px;
        }
    </style>
`;

const html = `
    <div id="hm-container">
        <div id="hm-overlay"></div>

        <div id="hm-dialog">
            <div id="hm-dialog-header">
                <div id="hm-dialog-header-title">Connect Wallet</div>
                <div id="hm-dialog-header-close">X</div>
            </div>

            <div id="hm-wallets">
<!--                <div class="hm-wallet">-->
<!--                    <div class="hm-wallet-name">MoonPay</div>-->
<!--                    <div class="hm-wallet-logo"><img src="https://hypermint.com/client-sdk/resources/moonpay.svg" alt="MoonPay"/></div>-->
<!--                </div>-->

                <div class="hm-wallet" data-wallet="${WalletProvider.Metamask}">
                    <div class="hm-wallet-name">MetaMask</div>
                    <div class="hm-wallet-logo"><img src="https://hypermint.com/client-sdk/resources/metamask.png" alt="MetaMask"/></div>
                </div>

               <div class="hm-wallet" data-wallet="${WalletProvider.Coinbase}">
                    <div class="hm-wallet-name">Coinbase Wallet</div>
                    <div class="hm-wallet-logo"><img src="https://hypermint.com/client-sdk/resources/coinbase.png" alt="Coinbase Wallet"/></div>
                </div>

                <div class="hm-wallet" data-wallet="${WalletProvider.WalletConnect}">
                    <div class="hm-wallet-name">WalletConnect</div>
                    <div class="hm-wallet-logo"><img src="https://hypermint.com/client-sdk/resources/walletconnect.svg" alt="WalletConnect"/></div>
                </div>
            </div>
        </div>
    </div>
`;

export class WalletSelector {
    public static selectWallet(logger: Logger): Promise<WalletProvider> {
        return new Promise(
            (
                resolve: (provider: WalletProvider) => void,
                reject: () => void
            ) => {
                document.body.innerHTML += stylesheet + html;

                const container = document.getElementById('hm-container');
                const closeButton = document.getElementById(
                    'hm-dialog-header-close'
                );

                const onClose = () => {
                    container.remove();
                    logger.log(
                        'selectWallet',
                        'User closed wallet selector',
                        true
                    );
                };

                container.onclick = onClose;
                closeButton.onclick = onClose;

                const wallets = document.getElementsByClassName('hm-wallet');

                for (const wallet of wallets) {
                    wallet.addEventListener('click', (e) => {
                        e.stopPropagation();
                        container.remove();
                        resolve(
                            wallet.getAttribute('data-wallet') as WalletProvider
                        );
                    });
                }
            }
        );
    }
}
