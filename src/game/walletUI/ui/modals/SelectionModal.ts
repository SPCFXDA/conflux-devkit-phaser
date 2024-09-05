import { Scene, GameObjects } from 'phaser';
import { WalletPlugin } from '../../../plugins/wallet/WalletPlugin';
import { OptionButton } from '../buttons/OptionButton'; // Use the updated OptionButton class
import { BaseModal } from './BaseModal'; // Import the BaseModal class

export class SelectionModal extends BaseModal {
    private spaceOptions: OptionButton[] = [];
    private managerOptions: OptionButton[] = [];
    private selectedSpace: OptionButton | null = null;
    private selectedManager: OptionButton | null = null;
    private onConfirmCallback: (space: string, manager: string) => Promise<void>;
    private onCancelCallback: () => void;
    private walletPlugin: WalletPlugin;

    constructor(
        scene: Scene,
        x: number,
        y: number,
        walletPlugin: WalletPlugin,
        onConfirm: (space: string, manager: string) => Promise<void>,
        onCancel: () => void
    ) {
        super(scene, x, y, () => this.confirmSelection().then(), () => this.cancelSelection(), 500, 400);

        this.modalWidth = 800; // Default modal width
        this.modalHeight = 600; // Default modal height

        this.walletPlugin = walletPlugin;
        this.onConfirmCallback = onConfirm;
        this.onCancelCallback = onCancel;

        this.populateSpaceOptions();
    }

    // Populate space options using the wallet plugin
    private populateSpaceOptions() {
        this.clearOptions(this.spaceOptions);

        const spaces = this.walletPlugin.getAvailableSpaces();
        this.spaceOptions = this.createOptions(spaces, -100, this.selectSpace.bind(this));

        if (spaces.length > 0) {
            this.selectSpace(this.spaceOptions[0]);
        }
    }

    // Populate manager options based on the selected space
    private populateManagerOptions() {
        if (!this.selectedSpace) return;

        this.clearOptions(this.managerOptions);

        const managers = this.walletPlugin.getAvailableManagers();
        this.managerOptions = this.createOptions(managers, 0, this.selectManager.bind(this), { text: '', alignLogo: 'center' });

        if (managers.length > 0) {
            this.selectManager(this.managerOptions[0]);
        }
    }

    // Create selectable options dynamically using OptionButton
    private createOptions(
        items: string[],
        yOffset: number,
        selectCallback: (option: OptionButton) => void,
        options: { text?: string, alignLogo?: "right" | "left" | "center", alignText?: "right" | "left" | "center" } = {}
    ): OptionButton[] {
        const optionWidth = 200;
        const spacing = 10;
        const totalWidth = items.length * optionWidth + (items.length - 1) * spacing;
        let startX = -totalWidth / 2 + optionWidth / 2;

        return items.map(item => {
            const optionButton = new OptionButton(
                this.scene,
                startX,
                yOffset,
                item,
                () => selectCallback(optionButton),
                { text: item, alignLogo: 'left', alignText: 'right', ...options }
            );

            startX += optionWidth + spacing;
            this.add(optionButton);
            return optionButton;
        });
    }

    // Handle space selection
    private selectSpace(optionButton: OptionButton) {
        this.selectedSpace = optionButton;
        this.updateOptionHighlight(this.spaceOptions, optionButton);
        this.walletPlugin.setCurrentSpace(optionButton.getData('key') as 'core' | 'espace');
        this.populateManagerOptions();
    }

    // Handle manager selection
    private selectManager(optionButton: OptionButton) {
        this.selectedManager = optionButton;
        this.updateOptionHighlight(this.managerOptions, optionButton);
    }

    private updateOptionHighlight(
        options: OptionButton[],
        selectedOption: OptionButton,
    ) {
        options.forEach(option => {
            option.bloom(option === selectedOption ? true : false);
        });
    }

    // Clear all options from the modal
    private clearOptions(options: OptionButton[]) {
        options.forEach(option => option.destroy());
        options.length = 0;
    }

    // Confirm the selection of space and manager
    private async confirmSelection() {
        if (this.selectedSpace && this.selectedManager) {
            const space = this.selectedSpace.getData('key');
            const manager = this.selectedManager.getData('key');
            await this.onConfirmCallback(space, manager)
            this.hide();
        }
    }

    private cancelSelection() {
        this.onCancelCallback();
        this.hide();
    }
}
