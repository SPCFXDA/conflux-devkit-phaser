import { Address, createPublicClient, createWalletClient, custom, formatEther, parseEther } from 'viem';
import { confluxESpace } from 'viem/chains';
import { BaseWalletManager } from './BaseWalletManager';
import { EventBus } from '../../../EventBus';  // Assuming EventBus is imported here

declare const window: any;

export class MetaMaskWalletManager extends BaseWalletManager {
    private metamask: any;
    private accountChangedListener: (accounts: Address[]) => void;
    private chainChangedListener: (chainId: string) => void;

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
        this.metamask = window.ethereum && window.ethereum.isMetaMask ? window.ethereum : null;
        this.accountChangedListener = () => {}; // Initial dummy function
        this.chainChangedListener = () => {}; // Initial dummy function
    }

    async getTransactionReceipt(txHash: string) {
        if (!this.publicClient || !this.currentAccount) {
            console.error('Public client is not initialized or no account found.');
            console.log('Emitting metaMaskError: Public client not initialized or no account.');
            EventBus.emit('metaMaskError', 'Public client not initialized or no account.');
            return null;
        }

        return await this.publicClient.getTransactionReceipt(txHash);
    }

    getChainInfo() {
        return confluxESpace;
    }

    isWalletInstalled(): boolean {
        return !!this.metamask;
    }

    async connect(): Promise<Address | undefined> {
        if (!this.isWalletInstalled()) {
            console.error('MetaMask is not installed.');
            console.log('Emitting metaMaskError: MetaMask is not installed.');
            EventBus.emit('metaMaskError', 'MetaMask is not installed.');
            return;
        }

        try {
            const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' });
            this.publicClient = createPublicClient({ transport: custom(this.metamask) });
            this.walletClient = createWalletClient({ account: account, chain: confluxESpace, transport: custom(this.metamask) });
            const accounts = await this.walletClient.requestAddresses();
            if (accounts.length === 0) {
                console.error('No accounts found');
                console.log('Emitting metaMaskError: No accounts found.');
                EventBus.emit('metaMaskError', 'No accounts found.');
                return;
            }

            this.currentAccount = account;
            const chainId = await this.walletClient.getChainId();
            this.currentChainId = chainId.toString();
            if (chainId !== confluxESpace.id) {
                await this.walletClient?.switchChain({ id: confluxESpace.id });
            }
            console.log('Connected to MetaMask:', this.currentAccount, this.currentChainId);
            this.setupListeners();

            console.log('Emitting walletConnected:', this.currentAccount, this.currentChainId);
            EventBus.emit('walletConnected', this.currentAccount, this.currentChainId);
            return this.currentAccount as Address;
        } catch (error) {
            this.disconnectWallet();
            console.error('Error connecting to MetaMask:', error);
            console.log('Emitting metaMaskError: Error connecting to MetaMask.');
            EventBus.emit('metaMaskError', 'Error connecting to MetaMask.');
        }
    }

    disconnectWallet(): void {
        this.currentAccount = null;
        this.currentChainId = null;
        this.removeListeners(); // Remove listeners on disconnection
        console.log('Wallet disconnected');
        console.log('Emitting walletDisconnected');
        EventBus.emit('walletDisconnected');
    }

    async getBalance(): Promise<string | null> {
        if (!this.publicClient || !this.currentAccount) {
            console.error('Public client is not initialized or no account found.');
            console.log('Emitting metaMaskError: Public client not initialized or no account.');
            EventBus.emit('metaMaskError', 'Public client not initialized or no account.');
            return null;
        }

        try {
            const balance = await this.publicClient.getBalance({ address: this.currentAccount });
            const formattedBalance = formatEther(balance);
            console.log('Emitting balanceUpdated:', formattedBalance);
            EventBus.emit('balanceUpdated', formattedBalance);
            return formattedBalance;
        } catch (error) {
            console.error('Error fetching balance:', error);
            console.log('Emitting metaMaskError: Error fetching balance.');
            EventBus.emit('metaMaskError', 'Error fetching balance.');
            return null;
        }
    }

    async sendTransaction(toAccount: Address, amount: string): Promise<string | undefined> {
        if (!this.walletClient || !this.currentAccount) {
            console.error('Wallet client is not initialized or no account found.');
            console.log('Emitting metaMaskError: Wallet client not initialized or no account.');
            EventBus.emit('metaMaskError', 'Wallet client not initialized or no account.');
            return;
        }

        try {
            const txnResponse = await this.walletClient.sendTransaction({
                account: this.currentAccount,
                to: toAccount,
                value: parseEther(amount.toString()),
            });

            console.log('Emitting transactionSent:', txnResponse.hash);
            EventBus.emit('transactionSent', txnResponse.hash);
            return txnResponse.hash;
        } catch (error) {
            console.error('Error sending transaction with MetaMask:', error);
            console.log('Emitting metaMaskError: Error sending transaction.');
            EventBus.emit('metaMaskError', 'Error sending transaction.');
        }
    }

    async getBlockNumber(): Promise<number | undefined> {
        if (!this.publicClient) {
            console.error('Public client is not initialized.');
            console.log('Emitting metaMaskError: Public client not initialized.');
            EventBus.emit('metaMaskError', 'Public client not initialized.');
            return;
        }

        try {
            const blockNumber = await this.publicClient.getBlockNumber();
            console.log('Emitting blockNumberUpdated:', blockNumber);
            EventBus.emit('blockNumberUpdated', blockNumber);
            return blockNumber;
        } catch (error) {
            console.error('Error fetching block number:', error);
            console.log('Emitting metaMaskError: Error fetching block number.');
            EventBus.emit('metaMaskError', 'Error fetching block number.');
        }
    }

    setupListeners(): void {
        if (!this.metamask || !this.walletClient) return;

        // Define listeners
        this.accountChangedListener = (accounts: Address[]) => {
            if (accounts.length === 0) {
                console.error('No accounts connected');
                this.disconnectWallet();
            } else {
                this.currentAccount = accounts[0];
                console.log('Account changed:', this.currentAccount);
                console.log('Emitting accountChanged:', this.currentAccount);
                EventBus.emit('accountChanged', this.currentAccount);
            }
        };

        this.chainChangedListener = async (chainId: string) => {
            this.currentChainId = chainId;
            console.log('Network changed:', this.currentChainId);
            await this.walletClient?.switchChain({ id: confluxESpace.id });
            console.log('Emitting chainChanged:', this.currentChainId);
            EventBus.emit('chainChanged', this.currentChainId);
        };

        // Add listeners
        this.metamask.on('accountsChanged', this.accountChangedListener);
        this.metamask.on('chainChanged', this.chainChangedListener);
    }

    removeListeners(): void {
        if (!this.metamask) return;

        // Remove listeners
        this.metamask.removeListener('accountsChanged', this.accountChangedListener);
        this.metamask.removeListener('chainChanged', this.chainChangedListener);
    }
}
