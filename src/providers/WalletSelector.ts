import { WalletProvider } from '../types/Enums';
import { Logger } from '../helpers/Logger';

const stylesheet = `
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

        #hm-dialog-header {
            padding-bottom: 24px;
            position: relative;
            font-size: 20px;
        }

        #hm-dialog-header-title {
            text-align: center;
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

        .hm-wallet {
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

        .hm-wallet:hover {
            background: #3D3D3D;
        }

        .hm-wallet-logo img {
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

const html = `
    <div id="hm-overlay">
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
    public static init() {
        document.body.insertAdjacentHTML('beforeend', html + stylesheet);
    }

    public static selectWallet(logger: Logger): Promise<WalletProvider> {
        return new Promise((resolve, reject) => {
            const overlay = document.getElementById('hm-overlay');
            const dialog = document.getElementById('hm-dialog');

            overlay.classList.add('hm-overlay--active');
            dialog.classList.add('hm-dialog--active');

            const closeButton = document.getElementById(
                'hm-dialog-header-close'
            );

            const onClose = () => {
                logger.log('selectWallet', 'User closed wallet selector');

                overlay.classList.remove('hm-overlay--active');
                dialog.classList.remove('hm-dialog--active');

                reject();
            };

            overlay.onclick = onClose;
            closeButton.onclick = onClose;

            const wallets = document.querySelectorAll('.hm-wallet');

            for (const wallet of wallets) {
                wallet.addEventListener('click', (e) => {
                    e.stopPropagation();

                    return resolve(
                        wallet.getAttribute('data-wallet') as WalletProvider
                    );
                });
            }
        });
    }
}
