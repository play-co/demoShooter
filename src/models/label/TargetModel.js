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
import math.geom.Point as Point;
import math.geom.Circle as Circle;

import shooter.models.EntityModel as EntityModel;

/**
 * This model paints a target on an enemy or bomb until it was removed or destroyed.
 */
exports = Class(EntityModel, function (supr) {
	/**
	 * Refresh this model, set a target.
	 */
	this.refreshOpts = function () {
		supr(this, 'refreshOpts');

		var opts = this._opts;

		if (!opts.velocity) {
			opts.velocity = {x: 0, y: 0};
		}

		opts.dt = 0;

		this._target = this._opts.target;
		this._removed = false;
	};

	/**
	 * If this function returns true then this model will be removed from the model pool.
	 * The target controls if this model is active so always return false.
	 */
	this.isOffscreen = function () {
		return false;
	};

	/**
	 * The tick function is called as long as the target is active.
	 */
	this.tick = function (dt) {
		var opts = this._opts;
		var pos = opts.pos;
		var targetPos = this._target.getOpts().pos;

		pos.x = targetPos.x;
		pos.y = targetPos.y;

		opts.dt += dt;

		return this._removed || supr(this, 'tick', arguments);
	};

	/**
	 * The target is either destroyed or removed because it is outside the screen.
	 */
	this.remove = function () {
		this._removed = true;
	};

	/**
	 * Although a target is assigned in "refreshOpts" it can be re-assigned if the
	 * current target is destroyed.
	 */
	this.setTarget = function (target) {
		this._target = target;
	};
});