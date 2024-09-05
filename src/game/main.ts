import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Menu } from './scenes/Menu';

import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { WalletPlugin } from './plugins/wallet/WalletPlugin';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    plugins: {
        global: [
            { key: 'WalletPlugin', plugin: WalletPlugin, start: true }
        ]
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x:0, y: 200 },
            debug: false
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver,
        Menu
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;


