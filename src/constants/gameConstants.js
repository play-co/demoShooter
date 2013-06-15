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
import src.lib.Enum as Enum;

exports.dataKeyName = 'CDS'; // The key under which the game data is saved in local storage

exports.gameName = 'Cow Defense System';
exports.returnCurrencyName1 = 'gem';
exports.returnCurrencyName2 = 'gems';

exports.WAVE_DURATION = 25 * 1000;

exports.BOUNDS_WIDTH = 576;
exports.BOUNDS_HEIGHT = 1024;

exports.STATUS_HEIGHT = 100;
exports.GROUND_HEIGHT = 50;
exports.FOOTER_HEIGHT = 100;
exports.GROUND_OFFSET = 30;

exports.PLAYER_HIT_RADIUS = 50;
exports.PLAYER_Y_OFFSET = 170;
exports.PLAYER_WIDTH = 130;
exports.PLAYER_HEIGHT = 130;

exports.SHIELD_WIDTH = 130 * 1.3;
exports.SHIELD_HEIGHT = 130 * 1.3;

exports.PLAYER_SHOOT_BASE_INTERVAL = 130;
exports.PLAYER_SHOOT_FAST_INTERVAL = 75;

exports.LASER_OFFSET_X = -31;
exports.LASER_VISUAL_OFFSET_X = -10;

exports.PROJECTILE_HEIGHT = 40;
exports.PROJECTILE_WIDTH = 40;
exports.PROJECTILE_SPEED = -350;

exports.ENEMY_HIT_THRESHOLD = 100;

exports.ANIMAL_HEIGHT = 80;
exports.ANIMAL_WIDTH = 80;

exports.BOMB_WIDTH = 70;
exports.BOMB_HEIGHT = 70;

exports.PICKUP_VERTICAL_SPEED = 100;
exports.PICKUP_HORIZONTAL_SPEED = 70;

exports.replayReward = [1, 2, 3, 5, 8];

exports.viewPoolTypes = Enum(
	'LABEL_POOL',
	'PROJECTILE_POOL',
	'BEAM_POOL',
	'ENEMY_POOL',
	'BOMB_POOL',
	'ANIMAL_POOL',
	'PICKUP_POOL',
	'PARACHUTE_POOL',
	'TARGET_POOL'
);

exports.particleSystems = Enum(
	'PARTICLE_BOTTOM'
);

exports.projectileTypes = Enum(
	'STANDARD',
	'GUIDED'
);