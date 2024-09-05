import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import { GenericButton } from '../walletUI/ui/buttons/GenericButton';
import { WalletPlugin } from '../plugins/wallet/WalletPlugin';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    confluxLogo: GameObjects.Image;

    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    private core: Phaser.GameObjects.Image;
    private espace: Phaser.GameObjects.Image;
    private start: GenericButton;
    private walletPlugin: WalletPlugin;
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.walletPlugin = this.plugins.get('WalletPlugin') as WalletPlugin;
        if (!this.walletPlugin) {
            console.error('WalletPlugin not found');
            return;
        }
        this.background = this.add.image(512, 384, 'background');

        // this.logo = this.add.image(512, 300, 'logo').setDepth(100);
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.logo  = this.add.image(centerX, centerY - 200, 'logo');
        this.confluxLogo = this.add.image(centerX, centerY - 100, 'conflux');

        this.core = this.add.image(600, 100, 'core');
        this.physics.world.enable(this.core);
        const coreBody = this.core.body as Phaser.Physics.Arcade.Body;
        if (coreBody) {
            coreBody.setVelocity(-100, 200)
                    .setBounce(1, 1)
                    .setCollideWorldBounds(true);
        }

        this.espace = this.add.image(0, 0, 'espace');
        this.physics.world.enable(this.espace);

        const espaceBody = this.espace.body as Phaser.Physics.Arcade.Body;
        if (espaceBody) {
            espaceBody.setVelocity(100, 200)
                      .setBounce(1, 1)
                      .setCollideWorldBounds(true);
        }

        this.start = new GenericButton(this,centerX, centerY,'Start!',() => this.changeScene()).setVisible(false)
        this.add.existing(this.start)

        EventBus.emit('current-scene-ready', this);
        EventBus.on('walletConnected', (account: string) => {
            // this.scene.get('Menu').updateUIWithWalletStatus(account)
            console.log("MainMenu walletConnected")
            this.start.setVisible(true)
        }, this);
        EventBus.on('walletDisconnected',() => {
            this.start.setVisible(false)
            console.log("MainMenu walletDisconnected")

            // this.scene.get('Menu').updateUIWithWalletStatus(null)

        }, this);
    }

    update() {
        // Handle collisions between core and espace images
        this.physics.world.collide(this.core, this.espace);
    }

    changeScene ()
    {
        if(this.walletPlugin.currentAccount == null) {
            console.log("No account found")
        } else {
            if (this.logoTween)
                {
                    this.logoTween.stop();
                    this.logoTween = null;
                }
        
                this.scene.start('Game');        
        }
    }

    moveLogo (vueCallback: ({ x, y }: { x: number, y: number }) => void)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        } 
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.confluxLogo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (vueCallback)
                    {
                        vueCallback({
                            x: Math.floor(this.confluxLogo.x),
                            y: Math.floor(this.confluxLogo.y)
                        });
                    }
                }
            });
        }
    }
}
