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
import ui.ImageView as ImageView;

var SIZE = 100;

/**
 * This class displays the target crosshair when an item is clicked.
 */
exports = Class(ImageView, function (supr) {
	this.onUpdate = function (opts) {
		var style = this.style;
		var size = SIZE;

		// Increase size from 0 to 1 in the first 150 milli seconds:
		if (opts.dt < 150) {
			size *= 1 + (150 - opts.dt) / 150;
		}

		style.width = size;
		style.height = size;
		size *= 0.5;
		style.x = opts.pos.x - size;
		style.y = opts.pos.y - size;

		style.visible = true;
	};
});