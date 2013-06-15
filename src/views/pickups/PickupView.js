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
import ui.resource.Image as Image;

import ui.View as View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;

import shooter.views.EntitySpriteView as EntitySpriteView;

import src.constants.gameConstants as gameConstants;
import src.constants.powerupConstants as powerupConstants;

var PAYLOAD_WIDTH = 150 * 0.3;
var PAYLOAD_HEIGHT = 150 * 0.3;
var PARACHUTE_WIDTH = 100 * 0.85;
var PARACHUTE_HEIGHT = 150 * 0.85;

var boxAnimations = [
		'scoreBox',
		'liveBox',
		'fireBox',
		'shieldBox',
		'empBox',
		'guidedBox',
		'laserBox',
		'animalShieldBox'
	];

/**
 * This class displays a box from a flying saucer, it can also display the parachute attached to the box.
 */
exports = Class(EntitySpriteView, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				width: PAYLOAD_WIDTH,
				height: PAYLOAD_HEIGHT,
				url: 'resources/images/particles/pickup'
			}
		);

		this._image = '';
		this._worldView = opts.worldView;

		supr(this, 'init', [opts]);

		this._parachuteViewPool = this._worldView.getViewPools()[gameConstants.viewPoolTypes.PARACHUTE_POOL];
		this._parachuteView = null;

		this.style.anchorX = PAYLOAD_WIDTH * 0.5;
	};

	/**
	 * Set the initial values for the view...
	 */
	this.create = function (opts) {
		this.style.anchorX = this.style.width * 0.5;
		this.style.anchorY = this.style.height * 0.5;
		this.style.offsetX = this.style.width * -0.5;
		this.style.offsetY = this.style.height * -0.5;

		this.play(boxAnimations[opts.pickupType - 1]);
	};

	/**
	 * This function is called each tick if this view is attached to a model, the opts come from the model.
	 */
	this.onUpdate = function (opts) {
		this._modelOpts = opts;

		// If there's a parachute attached to the box...
		if (opts.parachute) {
			var parachuterViewStyle;

			if (this._parachuteView) { // Check if there's a parachute view...
				parachuterViewStyle = this._parachuteView.style;
			} else {
				// There's no parachute view, obtain a view:
				this._parachuteView = this._parachuteViewPool.obtainView();

				parachuterViewStyle = this._parachuteView.style;

				// Set the values to allow the parachute to swing...
				parachuterViewStyle.height = PARACHUTE_HEIGHT;
				parachuterViewStyle.anchorY = PARACHUTE_HEIGHT;
				parachuterViewStyle.offsetY = -PARACHUTE_HEIGHT;
				parachuterViewStyle.visible = true;
			}

			// The parachute opens in the first 150 milli seconds:
			var width = Math.min(opts.sDT, 150) / 150 * PARACHUTE_WIDTH;
			parachuterViewStyle.width = width;
			parachuterViewStyle.anchorX = width * 0.5;
			parachuterViewStyle.offsetX = width * -0.5;

			// Set the position and angle for the parachute:
			parachuterViewStyle.x = opts.pos.x;
			parachuterViewStyle.y = opts.pos.y;
			parachuterViewStyle.r = opts.r;
		}

		// Apply the position and angle:
		this.style.x = opts.pos.x;
		this.style.y = opts.pos.y;
		this.style.r = opts.r;
		this.style.visible = true;
	};

	/**
	 * Release this view, check if there's a parachute view which has to be released...
	 */
	this.onRelease = function () {
		if (this._parachuteView) {
			this._parachuteViewPool.releaseView(this._parachuteView);
			this._parachuteView = null;
		}
	};
});