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
import animate;

import ui.View as View;
import ui.ImageView as ImageView;
import ui.ImageScaleView as ImageScaleView;
import ui.ScoreView as ScoreView;

import src.constants.gameConstants as gameConstants;
import src.constants.characterConstants as characterConstants;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				x: 0,
				y: -gameConstants.STATUS_HEIGHT,
				width: GC.app.baseWidth,
				height: gameConstants.STATUS_HEIGHT,
				zIndex: 10000
			}
		);

		supr(this, 'init', [opts]);

		this._game = opts.game;

		this._lives = [];
		for (var i = 0; i < 5; i++) {
			this._lives.push(new ImageView({
				superview: this,
				x: i * 50,
				y: 10,
				width: 50,
				height: 50,
				image: 'resources/images/ui/statusLives.png'
			}));			
		}

		new ImageView({
			superview: this,
			x: GC.app.baseWidth * 0.5 - 35,
			y: 0,
			width: 70,
			height: 70,
			image: 'resources/images/ui/pause.png'
		}).onInputSelect = bind(this, 'emit', 'Pause');		

		this._scoreView = new ScoreView({
			superview: this,
			x: GC.app.baseWidth * 0.5 + 50,
			y: 15,
			width: GC.app.baseWidth * 0.5 - 60,
			height: 50,
			characterData: characterConstants.cyan,
			text: '000000',
			textAlign: 'right'
		});
	};

	this.reset = function () {
	};

	this.update = function () {
		var data = this._game.getPlayerModel().getData();
		this._scoreView.setText(data.score + '');

		for (var i = 0; i < 5; i++) {
			this._lives[i].style.visible = (i < data.lives);
		}
	};

	this.show = function () {
		this.style.y = -gameConstants.STATUS_HEIGHT;
		animate(this).then({y: 0}, 500);
	};

	this.hide = function () {
		animate(this).then({y: -gameConstants.STATUS_HEIGHT}, 500);
	};
});