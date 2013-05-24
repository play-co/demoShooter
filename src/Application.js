/**
 * @license
 * This file is part of the Game Closure SDK.
 *
 * The Game Closure SDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * The Game Closure SDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with the Game Closure SDK.  If not, see <http://www.gnu.org/licenses/>.
 */
import device;
import animate;

import ui.ImageView as ImageView;

import menus.views.MenuView as MenuView;
import menus.views.TextDialogView as TextDialogView;
import menus.views.DocumentView as DocumentView;

import .constants.gameConstants as gameConstants;
import .constants.debugConstants as debugConstants;
import .constants.menuConstants as menuConstants;

import .Game;

import shooter.views.EntitySpriteView as EntitySpriteView;

import src.doc.docPickups as docPickups;

exports = Class(GC.Application, function (opts) {
	this.baseWidth = 0;
	this.baseHeight = 0;
	this.scale = 0;

	this.initUI = function () {
		this.engine.updateOpts({
			alwaysRepaint: true,
			clearEachFrame: false,
			keyListenerEnabled: false,
			logsEnabled: true,
			noTimestep: false,
			showFPS: false,
			resizeRootView: false,
			preload: ['resources/images', 'resources/audio']
		});

		this.isNative = GC.isNative && device.isMobile;

		this.scaleUI();

		this._game = new Game({
			superview: this,
			x: 0,
			y: 0,
			width: this.baseWidth,
			height: this.baseHeight
		}).on('Quit', bind(this, 'onMainMenu'));

		this._alienEquipementView = new DocumentView({
			superview: this,
			title: 'Alien equipment',
			style: {
				text: {
					fontFamily: 'BPReplay',
					size: 28,
					color: '#000044',
					align: 'center'
				}
			},
			items: [
				{
					type: 'prev',
					title: '<',
					width: 80,
					style: 'GREEN',
					padding: [0, 0, 12, 0]
				},
				{
					type: 'info',
					width: 60,
					color: '#000000',
					fontFamily: 'BPReplay',
					size: 32
				},
				{
					type: 'next',
					title: '>',
					width: 80,
					style: 'GREEN',
					padding: [0, 0, 12, 0]
				}
			],
			pages: docPickups,
			backCB: bind(this, 'onMainMenu'),
			showTransitionMethod: menuConstants.transitionMethod.SCALE,
			hideTransitionMethod: menuConstants.transitionMethod.SCALE
		});

		this._mainMenu = new MenuView({
			superview: this,
			title: 'Main menu',
			modal: true,
			items: [
				{item: 'New game', action: bind(this, 'onLaunchGame')},
				{item: 'Alien equipment', action: bind(this._alienEquipementView, 'show')},
				{item: 'About this game', action: bind(this, 'onAbout')}
			],
			showTransitionMethod: menuConstants.transitionMethod.SCALE,
			hideTransitionMethod: menuConstants.transitionMethod.SCALE
		});
		setTimeout(bind(this._mainMenu, 'show'), 750);

		this._aboutDialog = new TextDialogView({
			superview: this,
			title: 'About',
			text: 'This is a Game Closure DevKit demo application',
			modal: true,
			buttons: [
				{
					title: 'Cool',
					width: 160,
					style: 'GREEN'
				}
			],
			showTransitionMethod: menuConstants.transitionMethod.SCALE,
			hideTransitionMethod: menuConstants.transitionMethod.SCALE
		}).on('Hide', bind(this, 'onMainMenu'));

		this._startData = {
			shield: 0,
			lives: 0,
			rapidFire: 0,
			rocket: 0,
			guided: 0,
			// Equip items...
			equipItems: {
				fatAnimals: false,
				extraAnimals: false,
				extraLive: false,
				rapidFire: false
			}
		};
	};

	this.launchUI = function () {};

	this.scaleUI = function () {
		this.baseWidth = gameConstants.BOUNDS_WIDTH;
		this.baseHeight = device.height * (gameConstants.BOUNDS_WIDTH / device.width);
		this.scale = device.width / this.baseWidth;

		this.view.style.scale = this.scale;
	};

	this.tick = function (dt) {
		this._game.tick(dt);
	};

	this.onLaunchGame = function () {
		this._game.onLaunchGame({equipItems: this._startData.equipItems});
		this._game.setMenu(false);
	};

	this.onMainMenu = function () {
		this._mainMenu.show();
	};

	this.onAbout = function () {
		this._aboutDialog.show();
	};

	this.getGame = function () {
		return this._game;
	};
});