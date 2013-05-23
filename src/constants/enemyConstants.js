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
import src.lib.Enum as Enum;

exports.enemyTypes = Enum(
	'ENEMY_SMALL_DISH',
	'ENEMY_LARGE_DISH',
	'ENEMY_KILLER_DISH'
);

exports.BEAM_SMALL_HEIGHT = 150;
exports.BEAM_KILLER_HEIGHT = 260;

exports.BEAM_ATTACH_DISTANCE = 30;

exports.SMALL_DISH_WIDTH = 100;
exports.SMALL_DISH_HEIGHT = 100;

exports.KILLER_DISH_WIDTH = 130;
exports.KILLER_DISH_HEIGHT = 130;

exports.LARGE_DISH_WIDTH = 200 * 0.8;
exports.LARGE_DISH_HEIGHT = 150 * 0.8;

exports.JUMPER_WIDTH = 140;
exports.JUMPER_HEIGHT = 140;
