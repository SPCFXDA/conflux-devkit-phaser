    import { Scene, GameObjects } from 'phaser';
    import { GenericButton } from './buttons/GenericButton'; // Adjust path as needed
    import { WalletPlugin } from '../../plugins/wallet/WalletPlugin';
    import { Address } from 'viem';
    import { BaseModal } from './modals/BaseModal';

    // AccountInfo Class: Manages account display and improved rounded rectangle
    class AccountInfo extends Phaser.GameObjects.Container {
        private accountGraphics: Phaser.GameObjects.Graphics;
        private accountLabel: Phaser.GameObjects.Text;

        constructor(scene: Phaser.Scene, x: number, y: number) {
            super(scene, x, y);

            // Create the rounded account rectangle
            this.accountGraphics = scene.add.graphics();
            this.add(this.accountGraphics);

            // Create the account label
            this.accountLabel = scene.add.text(-120, -30, '', { 
                fontFamily: 'monoBold', 
                fontSize: '16px', 
                stroke: '#000000', // Add black stroke to the text
                strokeThickness: 4 // Stroke thickness
            }).setOrigin(0, 0.5);
            this.add(this.accountLabel);

            // Update rectangle for the first time
            this.updateAccountRect();
        }

        public updateAccountInfo(accountInfo: string) {
            const truncatedAddress = accountInfo.slice(0, 7) + '...' + accountInfo.slice(-5);
            this.accountLabel.setText(`${truncatedAddress}`);
            this.updateAccountRect();
        }

        private updateAccountRect() {
            const labelWidth = this.accountLabel.width + 30; // Adjust width for padding
            const rectHeight = this.accountLabel.height + 10; // Adjust height for padding

            const labelX = -labelWidth / 2 + 0;
            const labelY = -30;

            // Update label position
            this.accountLabel.setX(labelX);
            this.accountLabel.setY(labelY);

            // Clear previous graphics
            this.accountGraphics.clear();

            // Add a black border (stroke)
            this.accountGraphics.lineStyle(6, 0xA0a0a0); // Black border, 4px width

            // Use fillGradientStyle to apply a gradient fill
            // this.accountGraphics.fillGradientStyle(0xaaaaaa, 0x888888, 0x888888, 0xaaaaaa, 1);
            this.accountGraphics.fillStyle(0xaaaaaa);
            // Draw the rounded rectangle with gradient fill and black border
            this.accountGraphics.fillRoundedRect(labelX - 10, labelY - rectHeight / 2, labelWidth, rectHeight, { tl: 0, tr: 0, bl: 0, br: 0 });

            // Draw border after filling (optional)
            this.accountGraphics.strokeRoundedRect(labelX - 10, labelY - rectHeight / 2, labelWidth, rectHeight, { tl: 0, tr: 0, bl: 0, br: 0 });
        }
    }

    // 2. ChainInfo Class: Manages chain information with an improved rounded rectangle
    class ChainInfo extends Phaser.GameObjects.Container {
        // private chainGraphics: Phaser.GameObjects.Graphics;
        private chainLabel: Phaser.GameObjects.Text;
        private chainLogo: Phaser.GameObjects.Image;

        // private containerWidth: number; // The width of the container (WalletPanel) for alignment

        constructor(scene: Phaser.Scene, _containerWidth: number, y: number) {
            super(scene, 0, y);

            // this.containerWidth = containerWidth;

            // Create the chain graphics object for custom shapes
            // this.chainGraphics = scene.add.graphics();
            // this.add(this.chainGraphics);

            // Create the chain label
            this.chainLabel = scene.add.text(105, 75, '', { 
                fontFamily: 'monoBold', 
                fontSize: '16px', 
                color: '#ffffff', 
                stroke: '#000000', // Black stroke around the text
                strokeThickness: 2 // Thickness of the stroke
            }).setOrigin(0, 0.5); // Set origin to 1 for right-alignment

            this.chainLogo = scene.add.image(50, 50, 'espace').setOrigin(0, 0); // Set origin to 1 for right-alignment
            this.add(this.chainLabel);
            this.add(this.chainLogo);
        }

        public updateChainInfo(chainInfo: string) {
            this.chainLabel.setText(`${chainInfo}`);
        }
    }


    // 3. Submenu Class: Handles submenu visibility and buttons
// 3. Submenu Class: Handles submenu visibility and buttons
class Submenu extends Phaser.GameObjects.Container {
    private submenuRect: BaseModal;
    private submenuButtons: GenericButton[];
    private walletPlugin: WalletPlugin;
    private updateUIWithWalletStatus: () => void;
    private resultText: Phaser.GameObjects.Text; // Text object for displaying results

    constructor(scene: Phaser.Scene, x: number, y: number, walletPlugin: WalletPlugin, updateUIWithWalletStatus: () => void) {
        super(scene, x, y);

        this.walletPlugin = walletPlugin;
        this.updateUIWithWalletStatus = updateUIWithWalletStatus;

        // Initialize submenu buttons array
        this.submenuButtons = [];
        this.createSubmenuButtons(scene);

        // Calculate the height of the modal dynamically based on the number of buttons
        const modalHeight = this.calculateModalHeight();
        const modalWidth = 600;  // Set a fixed width for the modal

        // Create the modal (BaseModal) with dynamic height
        this.submenuRect = new BaseModal(scene, 0, 0, null, null, modalWidth, modalHeight);
        this.add(this.submenuRect);

        // Position the buttons inside the modal, aligned to the bottom right
        this.positionButtons(modalWidth, modalHeight);

        // Create and position the result text area on the left of the submenu buttons
        this.resultText = scene.add.text(-modalWidth / 2 + 20, -modalHeight / 2 + 20, '', {
            fontFamily: 'monoBold',
            fontSize: '14px',
            color: '#ffffff',
            wordWrap: { width: modalWidth / 2 - 40 }
        }).setOrigin(0, 0);

        this.add(this.resultText);
    }

    private createSubmenuButtons(scene: Phaser.Scene) {
        const buttonData = [
            {
                label: 'View Balance',
                action: async (button: GenericButton) => {
                    button.showLoadingState();
                    try {
                        const balance = await this.walletPlugin.getBalance();
                        this.updateResultText(`Balance: ${balance}`);
                        console.log('Balance:', balance);
                    } catch (error) {
                        this.updateResultText(`Error: ${error.message}`);
                        console.error('Error fetching balance:', error);
                    } finally {
                        button.resetState();
                    }
                }
            },
            {
                label: 'Send Transaction',
                action: async (button: GenericButton) => {
                    button.showLoadingState();
                    try {
                        const account = this.walletPlugin.currentAccount;
                        if (account) {
                            await this.walletPlugin.sendTransaction(account, '0.1');
                            this.updateResultText('Transaction sent');
                            console.log('Transaction sent');
                        }
                    } catch (error) {
                        this.updateResultText(`Error: ${error.message}`);
                        console.error('Error sending transaction:', error);
                    } finally {
                        button.resetState();
                    }
                }
            },
            {
                label: 'Get Block Number',
                action: async (button: GenericButton) => {
                    button.showLoadingState();
                    try {
                        const blockNumber = await this.walletPlugin.getBlockNumber();
                        this.updateResultText(`Block Number: ${blockNumber}`);
                        console.log('Block Number:', blockNumber);
                    } catch (error) {
                        this.updateResultText(`Error: ${error.message}`);
                        console.error('Error fetching block number:', error);
                    } finally {
                        button.resetState();
                    }
                }
            },
            {
                label: 'Get block',
                action: async (button: GenericButton) => {
                    button.showLoadingState();
                    try {
                        const block = await this.walletPlugin.getPublicClient().getBlock()
                        BigInt.prototype.toJSON = function() {
                            return this.toString();
                          }
                        this.updateResultText(`${JSON.stringify(block, null, 2)}`);
                        console.log('block:', block);
                    } catch (error) {
                        this.updateResultText(`Error: ${error.message}`);
                        console.error('Error fetching logs:', error);
                    } finally {
                        button.resetState();
                    }
                }
            },
            {
                label: 'Disconnect',
                action: async (button: GenericButton) => {
                    button.showLoadingState();
                    try {
                        await this.walletPlugin.disconnectWallet();
                        this.updateUIWithWalletStatus();
                        this.updateResultText('Wallet disconnected');
                        console.log('Wallet disconnected');
                    } catch (error) {
                        this.updateResultText(`Error: ${error.message}`);
                        console.error('Error disconnecting wallet:', error);
                    } finally {
                        button.resetState();
                    }
                }
            },
        ];
    
        buttonData.forEach(({ label, action }) => {
            const button = new GenericButton(scene, 0, 0, label, () => action(button), 0x1ca9c9, 0x0e5464, 250, 50);
            button.setVisible(false);
            this.submenuButtons.push(button);
        });
    }
    

    private calculateModalHeight(): number {
        const buttonHeight = 50;  // Each button's height
        const buttonSpacing = 10;  // Space between buttons
        const totalHeight = this.submenuButtons.length * (buttonHeight + buttonSpacing);

        return totalHeight + 140; // Add extra padding
    }

    private positionButtons(modalWidth: number, modalHeight: number) {
        const buttonHeight = 50;  // Each button's height
        const buttonSpacing = 10;  // Space between buttons

        // Start positioning from the bottom right of the modal
        let yOffset = (modalHeight / 2) - buttonHeight / 2 - 20;  // Adjust for padding at the bottom
        const xOffset = (modalWidth / 2) - 140;  // Adjust for right alignment and button width

        this.submenuButtons.forEach((button) => {
            button.setPosition(xOffset, yOffset);
            button.setVisible(false);
            this.add(button);
            yOffset -= (buttonHeight + buttonSpacing);  // Move upwards for the next button
        });
    }

    public toggleSubmenu(visible: boolean) {
        this.submenuRect.setVisible(visible);
        this.submenuButtons.forEach(button => button.setVisible(visible));
        this.resultText.setVisible(visible);
    }

    public getSubmenuRect(): BaseModal {
        return this.submenuRect;
    }

    private updateResultText(text: string) {
        this.resultText.setText(text);
    }
}





    // 4. WalletPanel Class: Orchestrates everything
    export class WalletPanel extends Phaser.GameObjects.Container {
        private menuButton: GenericButton;
        private submenu: Submenu;
        private accountInfo: AccountInfo;
        private chainInfo: ChainInfo;

        constructor(scene: Scene, x: number, y: number, walletPlugin: WalletPlugin, updateUIWithWalletStatus: () => void) {
            super(scene, x, y);

            // Create the submenu
            this.submenu = new Submenu(scene, -70, 175, walletPlugin, updateUIWithWalletStatus);
            this.add(this.submenu);
            const modal = this.submenu.getSubmenuRect()
            // Create chain info
            this.chainInfo = new ChainInfo(scene, -120, -210);
            modal.add(this.chainInfo);

            // Create account info
            this.accountInfo = new AccountInfo(scene, 75, 0);
            this.add(this.accountInfo);



            // Create the menu button and position it on top of the submenu
            this.menuButton = new GenericButton(scene, 190, -30, 'Menu', () => this.toggleSubmenu(), 0x0d669e, 0x2a2a2a, 80, 50);
            this.add(this.menuButton);

            // Add container to the scene
            scene.add.existing(this);
        }

        private toggleSubmenu() {
            const isVisible = !this.submenu.getSubmenuRect().visible;
            this.submenu.toggleSubmenu(isVisible);
            this.menuButton.setPressedState(isVisible); // Assuming this method exists in GenericButton
        }

        public updateChainInfo(chainInfo: string) {
            this.chainInfo.updateChainInfo(chainInfo);
        }

        public updateAccountInfo(accountInfo: string) {
            this.accountInfo.updateAccountInfo(accountInfo);
        }

        // Expose menu button for WalletControls
        public getMenuButton(): GenericButton {
            return this.menuButton;
        }

        // Expose submenu rectangle for WalletControls
        public getSubmenuRect(): BaseModal {
            return this.submenu.getSubmenuRect();
        }
    }

