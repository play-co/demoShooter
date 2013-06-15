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
import ui.ImageView as ImageView;
import ui.filter as filter;

import shooter.views.EntitySpriteView as EntitySpriteView;

import src.constants.gameConstants as gameConstants;
import src.constants.enemyConstants as enemyConstants;

import .enemySmallDishUpdater;
import .enemyLargeDishUpdater;

/**
 * This class displays a jumping alien...
 */
exports = Class(EntitySpriteView, function (supr) {
	this.init = function (opts) {
		opts = merge(
				opts,
				{
					url: 'resources/images/enemies/jumper',
					width: enemyConstants.JUMPER_WIDTH,
					height: enemyConstants.JUMPER_HEIGHT,
					defaultAnimation: 'fly',
					frameRate: 24
				}
			);

		supr(this, 'init', [opts]);

		this._offsetY = -enemyConstants.JUMPER_HEIGHT;
		this._worldView = opts.worldView;
		this._start = true;
	};

	/**
	 * Reset the jumper, set "_start" to true, hide the view.
	 */
	this.onReset = function () {
		this.style.visible = false;
		this._start = true;
	};

	/**
	 * This function is called each tick, the opts come from the model.
	 */
	this.onUpdate = function (opts) {
		supr(this, 'onUpdate', arguments);

		// If this is the first call after reset then start the "fly" animation.
		if (this._start) {
			this.play('fly');
			this._start = false;
		}

		// If the jumper lands then play the "touchdown" anination:
		if (opts.touchdown) {
			this.play('touchdown');
		} else if (opts.fly) { // Play the "fly" animation when the jumper is in the air:
			this.play('fly');
		}

		// Show the jumper...
		this.style.visible = true;
	};
});