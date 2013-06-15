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
import ui.resource.Image as Image;

import shooter.views.EntitySpriteView as EntitySpriteView;

import src.constants.gameConstants as gameConstants;

/**
 * This class displays a bomb...
 */
exports = Class(EntitySpriteView, function (supr) {
	this.init = function (opts) {
		opts = merge(
				opts,
				{
					visible: false,
					width: gameConstants.BOMB_WIDTH,
					height: gameConstants.BOMB_HEIGHT,
					image: 'resources/images/particles/bomb.png'
				}
			);

		supr(this, 'init', [opts]);

		// Set the anchor to the center of the view:
		this.style.anchorX = this.style.width * 0.5;
		this.style.anchorY = this.style.height * 0.5;
	};

	/**
	 * This function is called each tick, the opts come from the model.
	 */
	this.onUpdate = function (opts) {
		supr(this, 'onUpdate', arguments);

		var style = this.style;

		// The bomb rotates when it's falling:
		style.r = opts.rDT * 0.003;
		// Apply the position:
		style.x = opts.pos.x + this._offsetX;
		style.y = opts.pos.y + this._offsetY;
		// Make it visible:
		style.visible = true;
	};
});