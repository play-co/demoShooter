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
import ui.resource.Image as Image;

import ui.View as View;
import ui.ImageView as ImageView;

import shooter.views.EntitySpriteView as EntitySpriteView;

// Create images, using Image instances is faster than using a string when changing an image...
var bulletImage = new Image({url: 'resources/images/particles/bullet.png'});
var rocketImage = new Image({url: 'resources/images/particles/pickup_guidedBox_0001.png'});

/**
 * This class displays a bullet or rocket.
 */
exports = Class(EntitySpriteView, function (supr) {
	this.init = function (opts) {
		opts = merge(
				opts,
				{
					visible: false
				}
			);

		supr(this, 'init', [opts]);

		this._worldView = opts.worldView;

		this.style.anchorX = this.style.width * 0.5;
		this.style.anchorY = this.style.height * 0.5;
	};

	/**
	 * Set the image based on which type of projectile it is:
	 */
	this.create = function (opts) {
		this.setImage((opts.projectileType === 1) ? bulletImage : rocketImage);
	};

	/**
	 * This function is called each tick if this view is attached to a model, the opts come from the model.
	 */
	this.onUpdate = function (opts) {
		supr(this, 'onUpdate', arguments);

		this.style.visible = true;
		// Set the angle it the type is a rocket else set the angle to 0:
		this.style.r = (opts.projectileType === 1) ? 0 : opts.mainR;
	};
});