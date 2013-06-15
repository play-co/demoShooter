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
import event.Emitter as Emitter;
import math.geom.Point as Point;

import shooter.models.ModelPool as ModelPool;

import src.constants.gameConstants as gameConstants;

import ..projectiles.ProjectileModel as ProjectileModel;

import src.sounds.soundManager as soundManager;

exports = Class(ModelPool, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {type: 'projectileType'});
		supr(this, 'init', [opts]);

		this._game = opts.game;

		this._lastSpawn = 0;
		this._dt = 0;
	};

	this.spawnProjectile = function (pt, target, projectileType) {
		var item = this._allocItem(ProjectileModel, projectileType);
		var opts = item.getOpts();

		item.updatePos(pt);

		opts.type = gameConstants.viewPoolTypes.PROJECTILE_POOL;
		opts.projectileType = projectileType;
		opts.item = item;
		opts.target = target;

		this.emit('ItemSpawned', opts);

		return item;
	};
});