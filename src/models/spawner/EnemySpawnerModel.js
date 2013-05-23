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
import event.Emitter as Emitter;
import math.geom.Point as Point;

import shooter.models.ModelPool as ModelPool;

import src.constants.debugConstants as debugConstants;
import src.constants.gameConstants as gameConstants;
import src.constants.enemyConstants as enemyConstants;

import ..enemies.EnemySmallDishModel as EnemySmallDishModel;
import ..enemies.EnemyLargeDishModel as EnemyLargeDishModel;
import ..enemies.EnemyKillerDishModel as EnemyKillerDishModel;

exports = Class(ModelPool, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {type: 'enemyType'});

		supr(this, 'init', [opts]);

		this._game = opts.game;

		this._enemyModels = [];
		this._enemyModels[enemyConstants.enemyTypes.ENEMY_SMALL_DISH] = EnemySmallDishModel;
		this._enemyModels[enemyConstants.enemyTypes.ENEMY_LARGE_DISH] = EnemyLargeDishModel;
		this._enemyModels[enemyConstants.enemyTypes.ENEMY_KILLER_DISH] = EnemyKillerDishModel;

		this.reset();
	};

	this._spawnSmallDish = function () {
		var enemyType = enemyConstants.enemyTypes.ENEMY_SMALL_DISH;
		var item = this._allocItem(this._enemyModels[enemyType], enemyType);
		var opts = item.getOpts();

		var x = Math.random() * GC.app.baseWidth * 0.8 + GC.app.baseWidth * 0.1;
		var y = -180;

		if (opts.pos) {
			opts.pos.x = x;
			opts.pos.y = y;
		} else {
			opts.pos = new Point(x, y);
		}

		opts.type = gameConstants.viewPoolTypes.ENEMY_POOL;
		opts.enemyType = enemyType;
		opts.health = 10;
		opts.item = item;

		this.emit('ItemSpawned', opts);
	};

	this._spawnKillerDish = function () {
		var enemyType = enemyConstants.enemyTypes.ENEMY_KILLER_DISH;
		var item = this._allocItem(this._enemyModels[enemyType], enemyType);
		var opts = item.getOpts();

		var x = Math.random() * GC.app.baseWidth * 0.8 + GC.app.baseWidth * 0.1;
		var y = -180;

		if (opts.pos) {
			opts.pos.x = x;
			opts.pos.y = y;
		} else {
			opts.pos = new Point(x, y);
		}

		opts.type = gameConstants.viewPoolTypes.ENEMY_POOL;
		opts.enemyType = enemyType;
		opts.health = 10;
		opts.item = item;

		this.emit('ItemSpawned', opts);
	};

	this._spawnLargeDish = function () {
		var enemyType = enemyConstants.enemyTypes.ENEMY_LARGE_DISH;
		var item = this._allocItem(this._enemyModels[enemyType], enemyType);
		var opts = item.getOpts();

		opts.type = gameConstants.viewPoolTypes.ENEMY_POOL;
		opts.enemyType = enemyType;
		opts.health = 20;
		opts.item = item;

		this.emit('ItemSpawned', opts);
	};

	this.reset = function () {
		supr(this, 'reset');

		this._currentGroup = 1;
		this._currentWave = 1;

		this._dt = this._game.getLevel().spawnInterval - 250;
	};

	this.killAll = function () {
		var items = this.getItems();
		var i = items.length;

		while (i) {
			var item = items[--i];
			item.subHealth(100000);
		}
	};

	this.tick = function (dt) {
		supr(this, 'tick', arguments);

		if (this._game.getPlayerModel().getTimeout() || this._game.getMenu()) {
			this._dt = 0;
			return;
		}

		this._dt += dt;
		var level = this._game.getLevel();
		var spawnInterval = level.spawnInterval;
		if (this._dt >= spawnInterval) {
			this._dt %= spawnInterval;

			if (debugConstants.alwaysLargeDish) {
				this._spawnLargeDish();
			} else if (debugConstants.alwaysSmallDish) {
				this._spawnSmallDish();
			} else if (debugConstants.alwaysKillerDish) {
				this._spawnKillerDish();
			} else if (Math.random() < level.largeDishChance) {
				this._spawnLargeDish();
			} else {
				(Math.random() < level.killerDishChance) ? this._spawnKillerDish() : this._spawnSmallDish();
			}
		}
	};

	this.spawnParachute = function (pt) {
		var enemyType = enemyConstants.enemyTypes.ENEMY_SMALL_DISH;
		var item = this._allocItem(this._enemyModels[enemyType], enemyType);
		var opts = item.getOpts();

		var x = Math.random() * GC.app.baseWidth * 0.8 + GC.app.baseWidth * 0.1;
		var y = -150;

		if (opts.pos) {
			opts.pos.x = pt.x;
			opts.pos.y = pt.y;
		} else {
			opts.pos = new Point(pt.x, pt.y);
		}

		opts.type = gameConstants.viewPoolTypes.ENEMY_POOL;
		opts.enemyType = enemyType;
		opts.health = 5;
		opts.item = item;
		opts.mode = EnemySmallDishModel.modes.PARACHUTE;

		this.emit('ItemSpawned', opts);
	};
});