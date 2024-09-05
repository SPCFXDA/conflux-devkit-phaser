import { GenericButton } from './buttons/GenericButton'; // Adjust path as needed
import { WalletPlugin } from '../../plugins/wallet/WalletPlugin';
import { BaseModal } from './modals/BaseModal';

export class Submenu extends Phaser.GameObjects.Container {
    private submenuRect: BaseModal;
    private submenuButtons: GenericButton[];
    private walletPlugin: WalletPlugin;
    private resultText: Phaser.GameObjects.Text; // Text object for displaying results

    constructor(scene: Phaser.Scene, x: number, y: number, walletPlugin: WalletPlugin) {
        super(scene, x, y);
        this.scene = scene
        this.walletPlugin = walletPlugin;

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
            color: '#00ff00',
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
                        this.toggleSubmenu(false);
                        await this.walletPlugin.disconnectWallet();
                        this.updateResultText('');
                        console.log('Wallet disconnected');
                        // this.scene.scene.start('MainMenu')
                        // this.scene.scene.launch('Menu')
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
