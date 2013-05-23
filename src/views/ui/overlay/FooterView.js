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
import animate;

import ui.View as View;
import ui.ImageView as ImageView;
import ui.ScoreView as ScoreView;

import src.constants.gameConstants as gameConstants;
import src.constants.characterConstants as characterConstants;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		this._game = opts.game;

		opts = merge(
			opts,
			{
				x: 0,
				y: GC.app.baseHeight,
				width: GC.app.baseWidth,
				height: gameConstants.FOOTER_HEIGHT,
				zIndex: 10000
			}
		);

		supr(this, 'init', [opts]);

		this._game = opts.game;

		this._items = [
				{
					image: 'resources/images/ui/statusEMP.png',
					text: 10,
					x: 0,
					scale: 0.9
				},
				{
					image: 'resources/images/ui/statusGuided.png',
					text: 0,
					x: 1,
					scale: 0.9
				},
				{
					image: 'resources/images/ui/statusLaser.png',
					text: 0,
					bar: true,
					x: 2,
					scale: 0.9
				},
				{
					image: 'resources/images/ui/statusShield.png',
					text: 1,
					bar: true,
					x: 3,
					scale: 0.9
				}
			];

		this._buttons = [];

		var left = GC.app.baseWidth * 0.5 - this._items.length * 140 * 0.5 + 5;
		for (var i = 0; i < this._items.length; i++) {
			var item = this._items[i];
			this._items[i] = this._createItem(item, left + i * 140);
		}

		this._itemEMP = this._items[0];
		this._itemGuided = this._items[1];
		this._itemLaser = this._items[2];
		this._itemShield = this._items[3];
	};

	this._createItem = function (info, x) {
		var container = new View({
			superview: this,
			x: x,
			y: 10,
			width: 130,
			height: 70,
			backgroundColor: 'rgba(0, 0, 0, 0.1)'
		});

		var item = {container: container};

		new ImageView({
			superview: container,
			x: 10 - (45 * info.scale - 45) * 0.5,
			y: 15 - (45 * info.scale - 45) * 0.5,
			width: 45 * info.scale,
			height: 45 * info.scale,
			image: info.image
		});

		if (info.bar) {
			new View({
				superview: container,
				x: 65,
				y: 55,
				width: 55,
				height: 10,
				backgroundColor: '#990000'
			});
			item.bar = new View({
				superview: container,
				x: 65,
				y: 55,
				width: 55,
				height: 10,
				backgroundColor: '#00FF00'
			});
			item.text = new ScoreView({
				superview: container,
				x: 52,
				y: 10,
				width: 80,
				height: 45,
				centerAnchor: true,
				textAlign: 'center',
				// Mapping of object keys to character images
				characterData: characterConstants.cyan,
				text: info.text || ''
			});
		} else {
			item.text = new ScoreView({
				superview: container,
				x: 60,
				y: 10,
				width: 65,
				height: 60,
				centerAnchor: true,
				textAlign: 'center',
				// Mapping of object keys to character images
				characterData: characterConstants.cyan,
				text: info.text
			});
		}
		return item;
	};

	this.reset = function () {
	};

	this.update = function () {
		var playerModel = this._game.getPlayerModel();
		var data = playerModel.getData();
		var opts = playerModel.getOpts();

		this._itemEMP.text.setText(data.powerups.emp || '0');

		var laser = data.powerups.laser;
		this._itemLaser.text.setText((laser / 10000) | 0);
		this._itemLaser.bar.style.width = ((laser - 1) % 10000) / 10000 * 55;

		this._itemGuided.text.setText(data.powerups.guided || '');

		var shield = data.powerups.shield;
		this._itemShield.text.setText((shield / 100) | 0);
		this._itemShield.bar.style.width = ((shield - 1) % 100) / 100 * 55;
	};

	this.show = function () {
		this.style.y = GC.app.baseHeight;
		animate(this).then({y: GC.app.baseHeight - gameConstants.FOOTER_HEIGHT}, 500);
	};

	this.hide = function () {
		animate(this).then({y: GC.app.baseHeight}, 500);
	};
});