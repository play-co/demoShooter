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
import src.constants.gameConstants as gameConstants;
import src.constants.enemyConstants as enemyConstants;

var EnemyView = false;

var EnemyLargeDishUpdater = Class(function () {
	this.create = function (worldView, target, opts) {
		this._worldView = worldView;

		target.setSize(enemyConstants.LARGE_DISH_WIDTH, enemyConstants.LARGE_DISH_HEIGHT);
		target.startAnimation('standard', {loop: true});
		target.style.r = 0;
	};

	this.update = function (target, opts) {
		if (opts.emp) {
			target.play('bomber');
		} else {
			target.play('bomber');
		}

		target.style.r = opts.r;
	};

	this.release = function (target) {
	};
});

exports = new EnemyLargeDishUpdater();