import { Scene } from 'phaser';
import { WalletPlugin } from '../plugins/wallet/WalletPlugin';
import { EventBus } from '../EventBus';
import { SelectionModal } from './ui/modals/SelectionModal'; // Import SelectionModal
import { ConnectWalletButton } from './ui/buttons/ConnectWalletButton';
import { WalletPanel } from './ui/WalletPanel';

export class WalletMenu {
    private scene: Scene;
    private walletPlugin: WalletPlugin;
    private connectButton: ConnectWalletButton;
    private walletPanel: WalletPanel;
    private selectionModal: SelectionModal; // Add modal instance

    constructor(scene: Scene, walletPlugin: WalletPlugin) {
        this.scene = scene;
        this.walletPlugin = walletPlugin;

        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        // Initialize the selection modal with the walletPlugin
        this.selectionModal = new SelectionModal(scene, centerX, centerY, walletPlugin, this.handleWalletConnection.bind(this), this.handleModalCancel.bind(this));
        this.connectButton = new ConnectWalletButton(scene, centerX, centerY, () => {
            this.connectButton.setVisible(false);
            this.selectionModal.setVisible(true);
        });

        this.walletPanel = new WalletPanel(scene, this.scene.scale.width - 235, 60, walletPlugin);
        this.walletPanel.setVisible(false);
        this.setupEventListeners();

    }

    private setupEventListeners() {
        // Listen to wallet events
        EventBus.on('walletConnected', (account: string) => this.updateUIWithWalletStatus(account), this);
        EventBus.on('walletDisconnected', () => this.updateUIWithWalletStatus(null), this);
    }

    private handleModalCancel() {
        this.connectButton.setVisible(true);
    }

    private async handleWalletConnection(space: string, managerName: string) {
        try {
            // Set the current space
            this.walletPlugin.setCurrentSpace(space as 'core' | 'espace');

            // Set the current manager based on the name
            if (managerName === 'MetaMask') {
                this.walletPlugin.setCurrentManager('MetaMask');
            } else if (managerName === 'Fluent') {
                this.walletPlugin.setCurrentManager('Fluent');
            } else {
                throw new Error(`Unknown manager type: ${managerName}`);
            }

            // Attempt to connect with the selected manager
            await this.walletPlugin.connect()
        } catch (error) {
            console.error('Error setting space or manager:', error);
            this.connectButton.setVisible(true); // Re-show the connect button on error
        }
    }

    private async updateUIWithWalletStatus(account: string | null) {
        if (account !== null && this.connectButton && this.walletPanel) {
            try {
                this.connectButton.setVisible(false);
                this.walletPanel.setVisible(true);
                this.walletPanel.updateAccountInfo(account || '');
                const chain = this.walletPlugin.getChainInfo();
                this.walletPanel.updateChainInfo(chain?.name || '');                    
            } catch (error) {
                console.error("UI Update ERROR", error)
            }
        } else {
            this.connectButton.setVisible(true);
            this.walletPanel.setVisible(false);
        }
    }
    destroy() {
        EventBus.off('walletConnected');
        EventBus.off('walletDisconnected');
    }
}
