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
import ui.ScoreView as ScoreView;

import src.constants.characterConstants as characterConstants;

/**
 * This class displays a label.
 */
exports = Class(View, function (supr) {
	this.init = function (opts) {
		opts.width = 400;
		opts.height = 60;
		opts.text = '00';

		supr(this, 'init', [opts]);

		this._offsetX = -opts.width / 2;
		this._offsetY = -opts.height / 2;

		this.style.visible = true;

		this.style.anchorX = -opts.width / 2;
		this.style.anchorY = -opts.height / 2;

		this._text = new ScoreView({
			superview: this,
			x: 0,
			y: 0,
			width: 400,
			height: 60,
			characterData: characterConstants.green
		});
	};

	/**
	 * Create a new label, set the text.
	**/
	this.create = function (opts) {
		this._text.setText(opts.text);
	};

	/**
	 * This function is called each tick, the opts come from the model.
	 */
	this.onUpdate = function (opts) {
		var style = this.style;
		var offsetX = this._offsetX;
		var offsetY = this._offsetY;

		// If the view is older then 750 milliseconds then start scaling it to 0 in 250 milliseconds:
		if (opts.dt > 750) {
			var n = 1 - (opts.dt - 750) / 250;
			style.scale = n;
			offsetX += 400 - 400 * n;
			offsetY += 60 - 60 * n;
		} else {
			style.scale = 1;
		}

		// Apply the position:
		style.x = opts.pos.x + offsetX;
		style.y = opts.pos.y + offsetY;
		style.visible = true;
	};
});