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
            background: #3D3D3D;m
        }

        #hm-container .hm-wallet-logo img {
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
    </style>
`;

const html = `
    <div id="hm-container">
        <div id="hm-overlay"></div>

        <div id="hm-dialog">
            <div id="hm-dialog-header">
                <div id="hm-dialog-header-title">Connect Wallet</div>
                <div id="hm-dialog-header-close">
                    <span class="hm-dialog-close-line"></span>
                    <span class="hm-dialog-close-line hm-dialog-close-line--last"></span>
                </div>
            </div>

            <div id="hm-wallets">
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
        return new Promise((resolve) => {
            document.body.insertAdjacentHTML('beforeend', html + stylesheet);

            const container = document.getElementById('hm-container');
            const closeButton = document.getElementById(
                'hm-dialog-header-close'
            );

            const onClose = () => {
                container.remove();
                logger.log('selectWallet', 'User closed wallet selector');
            };

            container.onclick = onClose;
            closeButton.onclick = onClose;

            const wallets = document.querySelectorAll('.hm-wallet');

            for (const wallet of wallets) {
                wallet.addEventListener('click', (e) => {
                    e.stopPropagation();
                    container.remove();

                    return resolve(
                        wallet.getAttribute('data-wallet') as WalletProvider
                    );
                });
            }
        });
    }
}
