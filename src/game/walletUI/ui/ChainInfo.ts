export class ChainInfo extends Phaser.GameObjects.Container {
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