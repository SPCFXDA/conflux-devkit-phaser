import { Scene } from 'phaser';
import { GenericButton } from './buttons/GenericButton'; // Adjust path as needed
import { WalletPlugin } from '../../plugins/wallet/WalletPlugin';
import { BaseModal } from './modals/BaseModal';
import { Submenu } from './Submenu';
import { AccountInfo } from './AccountInfo';
import { ChainInfo } from './ChainInfo';
// import { EventBus } from '../../EventBus';
// 4. WalletPanel Class: Orchestrates everything
export class WalletPanel extends Phaser.GameObjects.Container {
    private menuButton: GenericButton;
    private submenu: Submenu;
    private accountInfo: AccountInfo;
    private chainInfo: ChainInfo;

    constructor(scene: Scene, x: number, y: number, walletPlugin: WalletPlugin) {
        super(scene, x, y);

        // Create the submenu
        this.submenu = new Submenu(scene, -70, 175, walletPlugin);
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

