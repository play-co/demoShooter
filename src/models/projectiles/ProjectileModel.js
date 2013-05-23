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
import math.geom.Point as Point;
import math.geom.Circle as Circle;

import shooter.models.EntityModel as EntityModel;

import src.constants.gameConstants as gameConstants;

import src.sounds.soundManager as soundManager;

var projectileDamage = [];
projectileDamage[gameConstants.projectileTypes.STANDARD] = 2;
projectileDamage[gameConstants.projectileTypes.GUIDED] = 20;

var projectileSmoke = [];
projectileSmoke[gameConstants.projectileTypes.STANDARD] = false;
projectileSmoke[gameConstants.projectileTypes.GUIDED] = true;

var projectileSpeed = [];
projectileSpeed[gameConstants.projectileTypes.STANDARD] = gameConstants.PROJECTILE_SPEED * 2;
projectileSpeed[gameConstants.projectileTypes.GUIDED] = gameConstants.PROJECTILE_SPEED;

exports = Class(EntityModel, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				shape: new Circle(0, 0, 5),
				color: 'rgba(0, 0, 255, 0.7)',
				velocity: new Point(0, gameConstants.PROJECTILE_SPEED)
			}
		);

		supr(this, 'init', [opts]);

		this._rotateDir = ('rotateDir' in opts) ? opts.rotateDir : 1;
		this._opts.r = 0;
	};

	this.refreshOpts = function () {
		supr(this, 'refreshOpts', arguments);

		var opts = this._opts;

		opts.velocity.x = 0;
		opts.velocity.y = projectileSpeed[opts.projectileType];
		opts.targetExit = false;
		opts.mainR = 0;
		opts.dt = 0;

		this._targetSpawnerModel = opts.targetSpawnerModel;
		this._targetModel = null;

		this._damage = projectileDamage[opts.projectileType];

		this._smoke = projectileSmoke[opts.projectileType];
		this._smokeDT = 0;
	};

	this.isOffscreen = function () {
		var pos = this._opts.pos;

		return (pos.y < -gameConstants.PROJECTILE_HEIGHT) || 
				(pos.x < -gameConstants.PROJECTILE_WIDTH) ||
				(pos.y > GC.app.baseHeight + gameConstants.PROJECTILE_HEIGHT) ||
				(pos.x > GC.app.baseWidth + gameConstants.PROJECTILE_WIDTH);		
	};

	this._moveToTarget = function (dt) {
		var opts = this._opts;
		var pct = dt / 1000;
		var targetPos = opts.target.getOpts().pos;
		var pos = opts.pos;

		if (!opts.targetExit && ((targetPos.y > GC.app.baseHeight * 0.8) || (opts.target.getHealth() < 0))) {
			opts.targetExit = true;
		}

		if (!opts.targetExit) {
			angle = Math.PI * 0.5 + Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
			opts.mainR += (opts.mainR < angle) ? dt * 0.002 : -dt * 0.002;
		}

		var velocity = opts.velocity;

		velocity.x = 0;
		velocity.y = projectileSpeed[opts.projectileType];
		velocity.rotate(opts.mainR);

		pos.x += velocity.x * pct;
		pos.y += velocity.y * pct;

		this.emit('Update', opts);

		return this.isOffscreen();
	};

	this._findTarget = function (pt) {
		var range = (GC.app.baseWidth / 10) * (GC.app.baseWidth / 10);
		var pools = [gameConstants.viewPoolTypes.ENEMY_POOL, gameConstants.viewPoolTypes.PICKUP_POOL];

		var i = pools.length;
		while (i) {
			var enemyPool = this._game.getModelPool(pools[--i]);
			var items = enemyPool.getItems();
			var found = null;
			var minDistance = range;
			var j = items.length;

			while (j) {
				var item = items[--j];
				var pos = item.getOpts().pos;
				if ((item.getHealth() >= 0) && (pos.y >= 0) && (pos.y < pt.y) && (pos.x >= 0) && (pos.x < GC.app.baseWidth)) {
					var deltaX = pt.x - pos.x;
					var deltaY = pt.y - pos.y;
					var distance = deltaX * deltaX + deltaY * deltaY;
					if (distance < minDistance) {
						found = item;
						minDistance = distance;
					}
				}
			}
		}

		if (found) {
			this._targetModel = this._targetSpawnerModel.spawnTarget(found, this._opts.pos);
		}

		return found;
	};

	this.tick = function (dt) {
		var opts = this._opts;

		opts.r += dt * 0.01 * this._rotateDir;
		opts.dt += dt;

		if (this._smoke) {
			this._smokeDT -= dt;
			if (this._smokeDT < 0) {
				var pos = opts.pos;
				this._smokeDT = 200 * Math.random();
				this._game.createParticle(new Point({x: pos.x + Math.random() * 10 - 5, y: pos.y + Math.random() * 10 - 5}), 'smoke');
			}
		}

		if (opts.target) {
			if (!this._targetModel) {
				this._targetModel = this._targetSpawnerModel.spawnTarget(opts.target, this._opts.pos);
			}

			if (opts.target.getHealth() < 0) {
				opts.target = this._findTarget(opts.pos);
				if (this._targetModel) {
					opts.target ? this._targetModel.setTarget(opts.target) : this._targetModel.remove();
				}
			}
			if (opts.target && this._moveToTarget(dt)) {
				this._targetModel && this._targetModel.remove();
				return true;
			}
		} else {
			opts.mainR = 0;
			if (supr(this, 'tick', arguments)) {
				return true;
			}
		}

		var items = this._game.collidesWithPool(this, gameConstants.viewPoolTypes.ENEMY_POOL);
		var i = items.length;
		if (i) {
			var particleSystem = this._game.getParticleSystem(gameConstants.particleSystems.PARTICLE_BOTTOM);
			particleSystem.setAngles(Math.PI * -0.5, Math.PI * 0.5);
			particleSystem.activateType('hit');
			particleSystem.addOne(opts.pos.x, opts.pos.y);
			particleSystem.setAngles(0, Math.PI * 2);

			if (opts.pos.y > 40) {
				while (i) {
					var item = items[--i];
					if (item.getOpts().pos.y > gameConstants.ENEMY_HIT_THRESHOLD) {
						item.subHealth(this._damage);
						item.onHit && item.onHit();
					}
				}

				soundManager.play('hit1');
			}

			this._targetModel && this._targetModel.remove();
			return true;
		}

		var pools = [
				{
					pool: gameConstants.viewPoolTypes.PICKUP_POOL,
					sound: 'hit2'
				},
				{
					pool: gameConstants.viewPoolTypes.BOMB_POOL,
					sound: 'hit1'
				}
			];
		var i = pools.length;

		while (i) {
			var items = this._game.collidesWithPool(this, pools[--i].pool);
			var j = items.length;
			if (j) {
				var particleSystem = this._game.getParticleSystem(gameConstants.particleSystems.PARTICLE_BOTTOM);
				particleSystem.setAngles(Math.PI * -0.5, Math.PI * 0.5);
				particleSystem.activateType('hit');
				particleSystem.addOne(opts.pos.x, opts.pos.y);
				particleSystem.setAngles(0, Math.PI * 2);

				while (j) {
					var item = items[--j];
					item.subHealth(this._damage);
					item.onHit && item.onHit();
				}

				soundManager.play(pools[i].sound);

				this._targetModel && this._targetModel.remove();
				return true;
			}
		}

		return this.isOffscreen();
	};

	this.getTarget = function () {
		return this._opts.target;
	};
});