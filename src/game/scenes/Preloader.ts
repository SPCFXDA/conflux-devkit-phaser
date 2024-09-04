import { Scene } from 'phaser';
import { WalletPlugin } from '../plugins/wallet/WalletPlugin';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    loadFont(name: string, url: string) {
        var newFont = new FontFace(name, `url(${url})`);
        newFont.load().then(function (loaded) {
            document.fonts.add(loaded);
        }).catch(function (error) {
            return error;
        });
    }

    preload ()
    {
        this.loadFont('monoBold', 'assets/RobotoMono-Bold.ttf')
        this.load.plugin('WalletPlugin', WalletPlugin, true);
        //  Load the assets for the game - Replace with your own assets
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

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
        this.scene.launch('Menu')
    }
}
