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
        
        #hm-overlay {
            background: rgba(0,0,0,.5);
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
        }
        
        #hm-dialog {
            background: #2B2B2B;
            width: 350px;
            margin: auto;
            z-index: 100;
            border-radius: 16px;
            padding: 24px;
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
            position: absolute;
            opacity: 0.5;
            top: 0;
            right: 0;
            cursor: pointer;
        }
        
        #hm-dialog-header-close:hover {
            opacity: 1;
        }
        
        #hm-wallets {
        
        }
        
        #hm-wallet {
            border: 1px solid #3D3D3D;
            border-radius: 16px;
            display: flex;
            align-items: center;
            padding: 16px;
            justify-content: space-between;
            cursor: pointer;
            margin-bottom: 12px;
        }
        
        #hm-wallet:hover {
            background: #3D3D3D;
        }
        
        #hm-wallet-logo {
        
        }
        
        #hm-wallet-logo img {
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
                <div id="hm-wallet">
                    <div id="hm-wallet-name">MoonPay</div>
                    <div id="hm-wallet-logo"><img src="https://hypermint.com/client-sdk/resources/moonpay.svg" alt="MoonPay"/></div>
                </div>
                
                <div id="hm-wallet">
                    <div id="hm-wallet-name">MetaMask</div>
                    <div id="hm-wallet-logo"><img src="https://hypermint.com/client-sdk/resources/metamask.png" alt="MetaMask"/></div>
                </div>
                
               <div id="hm-wallet">
                    <div id="hm-wallet-name">Coinbase Wallet</div>
                    <div id="hm-wallet-logo"><img src="https://hypermint.com/client-sdk/resources/coinbase.png" alt="Coinbase Wallet"/></div>
                </div>
                
                <div id="hm-wallet">
                    <div id="hm-wallet-name">WalletConnect</div>
                    <div id="hm-wallet-logo"><img src="https://hypermint.com/client-sdk/resources/walletconnect.svg" alt="WalletConnect"/></div>
                </div>
            </div>
        </div>
    </div>
`;

export class WalletSelector {
    public static open() {
        let container = document.getElementById('hm-container');

        if (container) {
            container.style.display = 'flex';
        } else {
            document.body.innerHTML += stylesheet + html;

            container = document.getElementById('hm-container');
            container.onclick = WalletSelector.close;

            const closeButton = document.getElementById(
                'hm-dialog-header-close'
            );
            closeButton.onclick = WalletSelector.close;
        }
    }

    private static close() {
        document.getElementById('hm-container').style.display = 'none';
    }
}
