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
import ui.View as View;
import ui.ImageView as ImageView;
import ui.filter as filter;

import shooter.views.EntitySpriteView as EntitySpriteView;

import src.constants.gameConstants as gameConstants;
import src.constants.enemyConstants as enemyConstants;

import .enemySmallDishUpdater;
import .enemyLargeDishUpdater;
import .enemyKillerDishUpdater;

/**
 * This class displays an alien on of three types of aliens: small dish, killer dish of large -bomber- dish.
 */
exports = Class(EntitySpriteView, function (supr) {
	this.init = function (opts) {
		opts = merge(
				opts,
				{
					url: 'resources/images/enemies/dish',
					frameRate: 24					
				}
			);

		this._enemyTypes = [];
		this._enemyTypes[enemyConstants.enemyTypes.ENEMY_SMALL_DISH] = enemySmallDishUpdater;
		this._enemyTypes[enemyConstants.enemyTypes.ENEMY_LARGE_DISH] = enemyLargeDishUpdater;
		this._enemyTypes[enemyConstants.enemyTypes.ENEMY_KILLER_DISH] = enemyKillerDishUpdater;

		supr(this, 'init', [opts]);

		this._worldView = opts.worldView;
	};

	/**
	 * Update the properties of this view based on the type of enemy it has to display.
	**/
	this.create = function (opts) {
		this._enemyUpdater = this._enemyTypes[opts.enemyType];
		this._enemyUpdater.create(this._worldView, this, opts);
	};

	/**
	 * This function is called each tick, the opts come from the model.
	 */
	this.onUpdate = function (opts) {
		supr(this, 'onUpdate', arguments);

		// The updater -set in "create"- depends on the type and applies the correct properties to this view...
		this._enemyUpdater.update(this, opts);
	};

	/**
	 * Release the view and everything associated with this view:
	 */
	this.onRelease = function () {
		this.stopAnimation(); // Stopping the animation unsubscribes the tick of the animation!

		// Call the release function on the updater to release associated views like beam views...
		this._enemyUpdater.release(this);
		this.style.visible = false;
		this.style.x = -1000; // Put outsize to make sure it's not immediately visible when obtained next time...
	};
});