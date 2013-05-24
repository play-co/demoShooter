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
import ui.ScoreView as ScoreView;

import src.constants.characterConstants as characterConstants;

/**
 * This class displays the wave number in the center of the screen.
 */
exports = Class(View, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				x: (opts.superview.style.width - 200) * 0.5,
				y: (opts.superview.style.height - 100) * 0.5,
				width: 200,
				height: 200,
				visible: false
			}
		);

		supr(this, 'init', [opts]);

		// Use a "ScoreView" to hold the number...
		this._text = new ScoreView({
			superview: this,
			x: 0,
			y: 0,
			width: this.style.width,
			height: this.style.height,
			characterData: characterConstants.cyan,
			text: '1'
		});

		this._dt = 0;
		this._count = 4;
	};

	this.reset = function () {
		this._count = 0;
		this._dt = 0;
		this._text.setText('1');
	};

	/**
	 * Set the number of the wave, reset "_dt" to start displaying the number.
	 */
	this.setWave = function (wave) {
		this._count = 0;
		this._dt = 0;
		this._text.setText(wave);
	};

	/**
	 * Set the scale and position the number.
	 */
	this._scale = function (scale) {
		this.style.scale = scale;
		this.style.visible = true;

		var size = scale * 200;
		this.style.x = (this._superview.style.width - size) * 0.5;
		this.style.y = (this._superview.style.height - size) * 0.5;
	};

	/**
	 * This function is called each tick.
	 */
	this.update = function (dt) {
		if (this._count > 3) {
			return;
		}

		// This view goes through a sequence of increasing an decreasing size three times...
		this._dt += dt;
		if (this._dt < 200) {
			this._scale(this._dt / 200);
			this.style.visible = true;
		} else if (this._dt < 800) {
			this._scale(1 - (this._dt - 200) / 600);
			this.style.visible = true;
		} else {
			this._count++;
			if (this._count > 3) {
				this.style.visible = false;
			} else {
				this._dt = 0;
			}
		}
	};
});