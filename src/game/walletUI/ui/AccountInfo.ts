export class AccountInfo extends Phaser.GameObjects.Container {
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
        console.log("updateAccountInfo", accountInfo)
        const truncatedAddress = accountInfo.slice(0, 7) + '...' + accountInfo.slice(-5);    
        console.log("updateAccountInfo",truncatedAddress)
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