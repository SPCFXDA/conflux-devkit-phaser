import { Scene } from 'phaser';
import { GenericButton } from './GenericButton'; // Ensure to adjust the import path

export class OptionButton extends GenericButton {
    constructor(scene: Scene, x: number, y: number, key: string, onSelect: () => void, options: {
        text?: string,
        alignLogo?: 'right' | 'left' | 'center',
        alignText?: 'right' | 'left' | 'center',
        logoDisplaySize?: { x: number, y: number } | null,
        color?: number,
        borderColor?: number,
        width?: number,
        height?: number
    } = {}) {
        const {
            text = '',
            alignLogo = 'center',
            alignText = 'center',
            logoDisplaySize = null,
            color = 0x999999,
            borderColor = 0x666666,
            width = 180,
            height = 50
        } = options;

        super(scene, x, y, text, onSelect, color, borderColor, width, height);

        // Create a logo if a key is provided
        const logo = scene.add.image(0, 0, key);
        if (logoDisplaySize) {
            logo.setDisplaySize(logoDisplaySize.x, logoDisplaySize.y);
        }
        logo.setOrigin(0.5);

        // Align logo
        this.alignElement(logo, this.width, alignLogo);

        // Adjust label text alignment if necessary
        this.text.setAlign(alignText);
        this.alignElement(this.text, this.width, alignText);

        // Add the logo and text to the button container
        this.add(logo);
        this.add(this.text);

        // Store key in data
        this.setData('key', key);
    }

    // Reuse the alignElement method from the original OptionCreator for alignment
    private alignElement(element: Phaser.GameObjects.GameObject, width: number, alignment: string) {
        if (alignment === 'left') {
            element.x = -width / 4;
        } else if (alignment === 'center') {
            element.x = 0;
        } else if (alignment === 'right') {
            element.x = width / 4;
        }
    }
}
