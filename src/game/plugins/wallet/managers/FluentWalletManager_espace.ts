import { Address, createPublicClient, createWalletClient, custom, formatEther, parseEther } from 'viem';
import { confluxESpace } from 'viem/chains';
import { BaseWalletManager } from './BaseWalletManager';
import { EventBus } from '../../../EventBus';  // Assuming EventBus is imported here

declare const window: any;

export class FluentWalletManager extends BaseWalletManager {
    private fluent: any;
    private accountChangedListener: (accounts: Address[]) => void;
    private chainChangedListener: (chainId: string) => void;

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
        this.fluent = window.fluent && window.fluent.isFluent ? window.fluent : null;
        this.accountChangedListener = () => {}; // Initial dummy function
        this.chainChangedListener = () => {}; // Initial dummy function
    }

    async getTransactionReceipt(txHash: string) {
        if (!this.publicClient || !this.currentAccount) {
            console.error('Public client is not initialized or no account found.');
            EventBus.emit('fluentError', 'Public client not initialized or no account.');
            return null;
        }

        return await this.publicClient.getTransactionReceipt(txHash);
    }

    getChainInfo() {
        return confluxESpace;
    }

    isWalletInstalled(): boolean {
        return !!this.fluent;
    }

    async connect(): Promise<Address | undefined> {
        if (!this.isWalletInstalled()) {
            console.error('Fluent is not installed.');
            EventBus.emit('fluentError', 'Fluent is not installed.');
            return;
        }

        try {
            const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' });
            this.publicClient = createPublicClient({ transport: custom(this.fluent) });
            this.walletClient = createWalletClient({ account: account, chain: confluxESpace, transport: custom(this.fluent) });
            const accounts = await this.walletClient.requestAddresses();
            if (accounts.length === 0) {
                console.error('No accounts found');
                EventBus.emit('fluentError', 'No accounts found.');
                return;
            }

            this.currentAccount = account;
            const chainId = await this.walletClient.getChainId();
            this.currentChainId = chainId.toString();

            console.log('Connected to Fluent:', this.currentAccount, this.currentChainId);
            this.setupListeners();

            if (chainId !== confluxESpace.id) {
                await this.walletClient?.switchChain({ id: confluxESpace.id });
            }
            EventBus.emit('walletConnected', this.currentAccount, this.currentChainId);
            return this.currentAccount as Address;
        } catch (error) {
            this.disconnectWallet();
            console.error('Error connecting to Fluent:', error);
            EventBus.emit('fluentError', 'Error connecting to Fluent.');
        }
    }

    disconnectWallet(): void {
        this.currentAccount = null;
        this.currentChainId = null;
        this.removeListeners(); // Remove listeners on disconnection
        console.log('Wallet disconnected');
        EventBus.emit('walletDisconnected');
    }

    async getBalance(): Promise<string | null> {
        if (!this.publicClient || !this.currentAccount) {
            console.error('Public client is not initialized or no account found.');
            EventBus.emit('fluentError', 'Public client not initialized or no account.');
            return null;
        }

        try {
            const balance = await this.publicClient.getBalance({ address: this.currentAccount });
            const formattedBalance = formatEther(balance);
            EventBus.emit('balanceUpdated', formattedBalance);
            return formattedBalance;
        } catch (error) {
            console.error('Error fetching balance:', error);
            EventBus.emit('fluentError', 'Error fetching balance.');
            return null;
        }
    }

    async sendTransaction(toAccount: Address, amount: string): Promise<string | undefined> {
        if (!this.walletClient || !this.currentAccount) {
            console.error('Wallet client is not initialized or no account found.');
            EventBus.emit('fluentError', 'Wallet client not initialized or no account.');
            return;
        }

        try {
            const txnResponse = await this.walletClient.sendTransaction({
                account: this.currentAccount,
                to: toAccount,
                value: parseEther(amount.toString()),
            });

            EventBus.emit('transactionSent', txnResponse.hash);
            return txnResponse.hash;
        } catch (error) {
            console.error('Error sending transaction with Fluent:', error);
            EventBus.emit('fluentError', 'Error sending transaction.');
        }
    }

    async getBlockNumber(): Promise<number | undefined> {
        if (!this.publicClient) {
            console.error('Public client is not initialized.');
            EventBus.emit('fluentError', 'Public client not initialized.');
            return;
        }

        try {
            const blockNumber = await this.publicClient.getBlockNumber();
            EventBus.emit('blockNumberUpdated', blockNumber);
            return blockNumber;
        } catch (error) {
            console.error('Error fetching block number:', error);
            EventBus.emit('fluentError', 'Error fetching block number.');
        }
    }

    setupListeners(): void {
        if (!this.fluent || !this.walletClient) return;

        // Define listeners
        this.accountChangedListener = (accounts: Address[]) => {
            if (accounts.length === 0) {
                console.error('No accounts connected');
                this.disconnectWallet();
            } else {
                this.currentAccount = accounts[0];
                console.log('Account changed:', this.currentAccount);
                EventBus.emit('accountChanged', this.currentAccount);
            }
        };

        this.chainChangedListener = async (chainId: string) => {
            this.currentChainId = chainId;
            console.log('Network changed:', this.currentChainId);
            await this.walletClient?.switchChain({ id: confluxESpace.id });
            EventBus.emit('chainChanged', this.currentChainId);
        };

        // Add listeners
        this.fluent.on('accountsChanged', this.accountChangedListener);
        this.fluent.on('chainChanged', this.chainChangedListener);
    }

    removeListeners(): void {
        if (!this.fluent) return;

        // Remove listeners
        // this.fluent.off('accountsChanged');
        // this.fluent.off('chainChanged');
        this.fluent.removeListener('accountsChanged', this.accountChangedListener);
        this.fluent.removeListener('chainChanged', this.chainChangedListener);
    }
}
