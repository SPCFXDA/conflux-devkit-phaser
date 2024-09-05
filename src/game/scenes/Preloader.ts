import { Scene } from 'phaser';
import { WalletPlugin } from '../plugins/wallet/WalletPlugin';
import { EventBus } from '../EventBus';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        // Display the background and the loading bar
        this.add.image(512, 384, 'background');
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        // Update the progress bar during asset loading
        this.load.on('progress', (progress: number) => {
            bar.width = 4 + (460 * progress);
        });
    }

    loadFont(name: string, url: string) {
        const newFont = new FontFace(name, `url(${url})`);
        newFont.load()
            .then((loaded) => {
                document.fonts.add(loaded);
            })
            .catch((error) => {
                console.error(`Error loading font: ${error}`);
            });
    }

    preload() {
        // Load custom fonts and plugins
        this.loadFont('monoBold', 'assets/RobotoMono-Bold.ttf');
        this.load.plugin('WalletPlugin', WalletPlugin, true);

        // Load assets for the game
        this.load.setPath('assets');
        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');
        this.load.svg('core', 'core.svg', { scale: 3 });
        this.load.svg('espace', 'espace.svg', { scale: 3 });
        this.load.svg('Fluent', 'logoFluent.svg', { scale: 0.7 });
        this.load.svg('MetaMask', 'logoMetamask.svg', { scale: 1 });
        this.load.svg('phaser', 'phaser-logo.svg', { scale: 1 });
        this.load.svg('conflux', 'conflux.svg', { scale: 1 });
    }

    create() {
        // Start the MainMenu and Menu scenes
        this.scene.start('MainMenu');
        this.scene.launch('Menu');

        // Listen for the 'wallet-connection-changed' event and restart game if wallet is disconnected
        // EventBus.on('walletDisconnected', this.handleWalletDisconnection, this);
        EventBus.on('walletConnected', this.handleWalletConnection.bind(this), this);
        // EventBus.on('walletDisconnected', this.handleWalletDisconnection.bind(this), this);

    }

    restartGame() {
        if (this.scene) {
            this.shutdown();
            // Stop all active scenes before restarting
            this.scene.manager.scenes.forEach((scene) => {
                if (scene.scene.isActive()) {
                    this.scene.stop(scene.scene.key);
                }
            });
        }

        // Restart main scenes
        this.scene.start('MainMenu');
        this.scene.launch('Menu');
    }

    handleWalletConnection(account: string) {
        console.log(`Wallet connected: ${account}`);
        // Update UI or game logic based on wallet connection
    }

    handleWalletDisconnection() {
        console.log("Wallet disconnected, restarting the game...");
        this.scene.start('MainMenu');
        this.scene.launch('Menu');

        // this.restartGame();
    }

    // Clean up event listeners when the scene shuts down
    shutdown() {
        EventBus.off('walletConnected', this.handleWalletConnection, this);
        EventBus.off('walletDisconnected', this.handleWalletDisconnection, this);
    }
}
