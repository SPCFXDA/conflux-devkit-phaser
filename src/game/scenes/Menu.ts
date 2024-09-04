import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { WalletPlugin } from '../plugins/wallet/WalletPlugin';
import { WalletMenu } from '../walletUI/WalletMenu'
export class Menu extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    private walletPlugin: WalletPlugin;
    private walletMenu: WalletMenu;
    private core: Phaser.GameObjects.Image;
    private espace: Phaser.GameObjects.Image;
    
    constructor ()
    {
        super('Menu');
    }

    create ()
    {
        this.walletPlugin = this.plugins.get('WalletPlugin') as WalletPlugin;
        if (!this.walletPlugin) {
            console.error('WalletPlugin not found');
            return;
        }

        // Initialize Wallet HUD
        this.walletMenu = new WalletMenu(this, this.walletPlugin);
   
        EventBus.emit('menu-scene-ready', this);
    }

    changeScene ()
    {
        console.log("Menu ChangeScene from react?")
    }
}
