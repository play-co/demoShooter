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

import src.constants.debugConstants as debugConstants;
import src.constants.gameConstants as gameConstants;

import ..bombs.BombModel as BombModel;

exports = Class(ModelPool, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {type: 'bombType'});

		supr(this, 'init', [opts]);

		this._game = opts.game;
	};

	this.spawnBomb = function (pos) {
		if (this._game.getPlayerModel().getTimeout()) {
			return;
		}

		var item = this._allocItem(BombModel);
		var opts = item.getOpts();

		if (opts.pos) {
			opts.pos.x = pos.x;
			opts.pos.y = pos.y;
		} else {
			opts.pos = new Point(pos.x, pos.y);
		}

		opts.type = gameConstants.viewPoolTypes.BOMB_POOL;
		opts.bombType = 0;
		opts.item = item;

		this.emit('ItemSpawned', opts);
	};
});