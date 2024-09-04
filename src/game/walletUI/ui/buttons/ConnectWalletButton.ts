import { Scene, GameObjects } from 'phaser';
import { GenericButton } from './GenericButton'; // Adjust path as needed

export class ConnectWalletButton extends GameObjects.Container {
    connectButton: GenericButton;
    private handleWalletConnection: () => void;

    constructor(scene: Scene, x: number, y: number, handleWalletConnection: () => void) {
        super(scene, x, y);

        this.handleWalletConnection = handleWalletConnection;

        // Connect Button
        this.connectButton = new GenericButton(scene, 0, 0, 'Connect Wallet', () => this.connectToWallet(), 0x5dbea3, 0x33b249,200, 50);
        this.add(this.connectButton);
        this.connectButton.bloom()

        // Initially set visibility
        this.setVisible(true);
        scene.add.existing(this);
    }

    private connectToWallet() {
        // Set the button to a loading state
        this.connectButton.showLoadingState();

        // Invoke the callback for connecting to the wallet
        this.handleWalletConnection();
        this.connectButton.resetState()
    }
}
