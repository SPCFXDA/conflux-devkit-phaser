import { Scene, GameObjects } from 'phaser';

export class GenericButton extends GameObjects.Container {
    protected background: Phaser.GameObjects.Graphics;
    protected text: Phaser.GameObjects.Text;
    private loadingText: Phaser.GameObjects.Text;
    protected isLoading: boolean;
    protected isDisabled: boolean;
    private onClickCallback: () => void;
    private baseColor: number;
    private borderColor: number;
    private pulseFX: any;
    private pulseTweenFX: any;
    private bloomFX: any;
    width: number;
    height: number;

    constructor(scene: Scene, x: number, y: number, label: string, callback: () => void, 
                color: number = 0x999999, borderColor: number = 0x666666, 
                width: number = 150, height: number = 40, 
                style = {text: {
                    fontFamily: 'monoBold',
                    fontSize: '18px',
                    color: '#ffffff',
                    align: 'center'
                }, loadingText: {
                    fontFamily: 'monoBold',
                    fontSize: '18px',
                    color: '#ffffff',
                    align: 'center'
                } }) {
        super(scene, x, y);

        this.isLoading = false;
        this.isDisabled = false;
        this.onClickCallback = callback;
        this.baseColor = color; // Store the base color
        this.borderColor = borderColor; // Store the border color
        this.width = width; // Store the width
        this.height = height; // Store the height

        this.bloomFX = null;
        this.pulseFX = null;
        this.pulseTweenFX = null;
        
        // Background
        this.background = scene.add.graphics();
        this.drawButton();
        this.add(this.background);

        // Label
        this.text = scene.add.text(0, 0, label, style.text).setOrigin(0.5);
        this.text.setStroke("#000000", 4);
        this.add(this.text);

        // Loading Text
        this.loadingText = scene.add.text(0, 0, 'Loading...', style.loadingText).setOrigin(0.5);
        this.loadingText.setVisible(false);
        this.loadingText.setStroke("#000000", 4);

        this.add(this.loadingText);

        // Set size and interaction
        this.setSize(this.width, this.height);
        this.setInteractive();

        // Input events
        this.on('pointerdown', this.handlePointerDown, this);
        this.on('pointerup', this.handlePointerUp, this);
        this.on('pointerout', this.handlePointerOut, this);
        this.on('pointerover', this.handlePointerOver, this); // Add pointerover event
    }

    private drawButton(isHighlighted: boolean = false) {
        const radius = 10; // Radius for rounded corners
        this.background.clear();
        this.background.lineStyle(4, this.borderColor); // Border color and thickness
        
        // Determine the color to use based on whether the button is highlighted
        const fillColor = isHighlighted ? this.highlightColor(this.baseColor) : this.baseColor;
        const borderColor = isHighlighted ? this.darkenColor(this.borderColor) : this.borderColor;
        
        this.background.fillStyle(fillColor);
        this.background.fillRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, radius); // Draw rounded rectangle
        this.background.strokeRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, radius); // Draw border
    }

    protected handlePointerDown() {
        if (!this.isDisabled && !this.isLoading) {
            this.background.clear();
            this.background.lineStyle(2, this.darkenColor(this.borderColor)); // Darker border shade
            this.background.fillStyle(this.darkenColor(this.baseColor)); // Darker button shade
            this.background.fillRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 10); // Draw rounded rectangle
            this.background.strokeRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 10); // Draw border
            this.text.setY(2); // Simulate button press effect
        }
    }

    protected handlePointerUp() {
        if (!this.isDisabled && !this.isLoading) {
            this.drawButton(); // Reset to original button appearance
            this.text.setY(0);
            this.onClickCallback();
        }
    }

    protected handlePointerOut() {
        if (!this.isDisabled && !this.isLoading) {
            this.drawButton(); // Reset to original button appearance
            this.text.setY(0);
        }
    }

    protected handlePointerOver() {
        if (!this.isDisabled && !this.isLoading) {
            this.drawButton(true); // Highlight the button
        }
    }

    public showLoadingState() {
        this.isLoading = true;
        this.text.setVisible(false);
        this.loadingText.setVisible(true);
    }

    public resetState() {
        this.isLoading = false;
        this.text.setVisible(true);
        this.loadingText.setVisible(false);
    }

    public setPressedState(isPressed: boolean) {
        if (isPressed) {
            this.background.clear();
            this.background.lineStyle(2, this.darkenColor(this.borderColor)); // Darker border shade
            this.background.fillStyle(this.darkenColor(this.baseColor)); // Darker button shade
            this.background.fillRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 10); // Draw rounded rectangle
            this.background.strokeRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 10); // Draw border
            this.text.setY(2); // Simulate button press effect
        } else {
            this.drawButton(); // Reset to original button appearance
            this.text.setY(0);
        }
    }

    // Utility function to darken a color
    private darkenColor(color: number, percent: number = 0.2): number {
        const amount = Math.floor(255 * percent);
        const R = Math.max((color >> 16) - amount, 0);
        const G = Math.max(((color >> 8) & 0x00FF) - amount, 0);
        const B = Math.max((color & 0x0000FF) - amount, 0);
        return (R << 16) + (G << 8) + B;
    }

    // Utility function to highlight a color
    private highlightColor(color: number, percent: number = 0.1): number {
        const amount = Math.floor(255 * percent);
        const R = Math.min((color >> 16) + amount, 255);
        const G = Math.min(((color >> 8) & 0x00FF) + amount, 255);
        const B = Math.min((color & 0x0000FF) + amount, 255);
        return (R << 16) + (G << 8) + B;
    }

    glowPulse(active: boolean = true) {
        if(active) {
            if(!this.pulseFX) {
                this.pulseFX = this.background.postFX.addGlow(this.highlightColor(this.baseColor), 0, 0, false, 0.1, 24);
                this.pulseTweenFX = this.scene.tweens.add({
                    targets: this.pulseFX,
                    outerStrength: 5,
                    yoyo: true,
                    loop: -1,
                    ease: 'sine.inout'
                });
            }
    
        } else {
            this.background.postFX.remove(this.bloomFX)
            this.pulseFX = null;
            this.pulseTweenFX.remove()
        }
    }

    bloom(active: boolean = true) {
        if(active) {
            this.bloomFX = this.bloomFX ? this.bloomFX : this.background.postFX.addBloom(0xffffff, 1.5, 1.5, 1.5, 1.5);
        } else {
            if(this.bloomFX) {
                this.background?.postFX.remove(this.bloomFX)
                this.bloomFX = null;    
            }
        }
    }
}
