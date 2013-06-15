/**
 * @license
 * This file is part of the Game Closure SDK.
 *
 * The Game Closure SDK is free software: you can redistribute it and/or modify
 * it under the terms of the Mozilla Public License v. 2.0 as published by Mozilla.

 * The Game Closure SDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Mozilla Public License v. 2.0 for more details.

 * You should have received a copy of the Mozilla Public License v. 2.0
 * along with the Game Closure SDK.  If not, see <http://mozilla.org/MPL/2.0/>.
 */
import ui.View as View;
import ui.SpriteView as SpriteView;
import ui.ImageView as ImageView;

import src.constants.gameConstants as gameConstants;

import shooter.views.EntitySpriteView as EntitySpriteView;

exports = Class(EntitySpriteView, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				width: gameConstants.PLAYER_WIDTH,
				height: gameConstants.PLAYER_HEIGHT
			}
		);

		supr(this, 'init', [opts]);

		this._offsetY = -gameConstants.PLAYER_HEIGHT;

		this._playerView = new SpriteView({
			superview: this,
			width: gameConstants.PLAYER_WIDTH,
			height: gameConstants.PLAYER_HEIGHT,
			url: 'resources/images/player/player',
			defaultAnimation: 'standard',
			frameRate: 50,
			visible: true
		});

		this._shieldView = new SpriteView({
			superview: this,
			x: (gameConstants.PLAYER_WIDTH - gameConstants.SHIELD_WIDTH) * 0.5,
			y: (gameConstants.PLAYER_HEIGHT - gameConstants.SHIELD_HEIGHT) * 0.4,
			width: gameConstants.SHIELD_WIDTH,
			height: gameConstants.SHIELD_HEIGHT,
			visible: true,
			url: 'resources/images/player/shield'
		});

		this._laserView = opts.laserView;

		this._game = opts.game;
		this._playerModel = this._game.getPlayerModel();

		this._game.
			on('Quit', bind(this, 'onQuit'));

		this._deadDT = 0;
		this._deadVisible = false;

		this._playerView.startAnimation('standard', {loop: true});

		this.style.visible = false;
	};

	this.onUpdate = function (opts) {
		supr(this, 'onUpdate', arguments);

		if (opts.shield && !opts.dead) {
			!this._shieldView.style.visible && this._shieldView.startAnimation('on', {loop: true});
		} else {
			this._shieldView.stopAnimation();
		}

		this._laserView.style.x = opts.pos.x + gameConstants.LASER_OFFSET_X;
		this._laserView.style.y = opts.laserY;
		this._laserView.style.height = GC.app.baseHeight - gameConstants.PLAYER_HEIGHT - opts.laserY;
		this._laserView.style.visible = opts.laser;

		if (opts.dead) {
			this._deadDT -= opts.dt;
			if (this._deadDT < 0) {
				this._deadDT = 200;
				this._deadVisible = !this._deadVisible;
			}
			this.style.visible = this._deadVisible;
		} else {
			this.style.visible = true;
		}
	};

	this.onGameOver = function () {
		this.style.visible = false;
		this._laserView.style.visible = false;
		this._shieldView.stopAnimation();
	};

	this.onDead = function () {
		this.style.visible = false;
		this._laserView.style.visible = false;
		this._shieldView.stopAnimation();

		this._deadDT = 500;
		this._deadVisible = false;
	};

	this.onReset = function () {
		this.style.visible = true;
		this._playerView.startAnimation('standard', {loop: true});
	};

	this.onQuit = function () {
		this._playerView.stopAnimation();
	};

	this.resume = function () {
		this._playerView.resume();
	};

	this.setLaserView = function (laserView) {
		this._laserView = laserView;
	};
});
