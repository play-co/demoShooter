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
import math.geom.Rect as Rect;

import src.constants.debugConstants as debugConstants;
import src.constants.gameConstants as gameConstants;
import src.constants.powerupConstants as powerupConstants;

import shooter.models.ActorModel as ActorModel;

import src.sounds.soundManager as soundManager;

import .PlayerAI;

var MOTION_EASE = 0.2;

exports = Class(ActorModel, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				velocity: new Point(0, 0),
				shape: new Rect(0, 10, 90, 20),
				color: 'rgba(0, 255, 0, 0.7)',
				pos: new Point(0, 0),
			}
		);

		supr(this, 'init', [opts]);

		this._game = opts.game;
		this._projectileSpawnerModel = opts.projectileSpawnerModel;
		this._enemySpawnerModel = opts.enemySpawnerModel;
		this._labelSpawnerModel = opts.labelSpawnerModel;
		this._enemyJumperModel = opts.enemyJumperModel;
		this._pickupSpawnerModel = opts.pickupSpawnerModel;
		this._bombSpawnerModel = opts.bombSpawnerModel;

		this._shootInterval = gameConstants.PLAYER_SHOOT_BASE_INTERVAL;
		this._timeSinceShot = 0;
		this._timeSinceRocket = 0;

		this._started = false;

		this._targetPos = undefined;
		this._particleDT = 0;

		this._itemsUsed = {};

		this._shapeDefault = new Rect(0, -15, 90, 30);
		this._shapeLaser = new Rect(0, -GC.app.baseHeight * 0.5, 12, GC.app.baseHeight);
		this._shapeShield = new Circle(0, -10, 80);

		if (false) {
			this._playerAI = new PlayerAI({
				target: this,
				enemyJumperModel: this._enemyJumperModel,
				game: this._game
			});
		}

		this.reset();
	};

	this.reset = function (equipItems) {
		equipItems = equipItems || {};

		this._kills = 0;

		this._opts.pos = new Point(
			GC.app.baseWidth * 0.5, 
			GC.app.baseHeight - (gameConstants.STATUS_HEIGHT + gameConstants.GROUND_HEIGHT) + gameConstants.GROUND_OFFSET
		);

		this._opts.velocity.x = 0;
		this._opts.shape = this._shapeDefault;

		this._targetPos = undefined; // Position to move to
		this._started = false;

		this._target = null; // Target enemy

		this._changed = false;
		this._projectileSpawnerModel.clear();

		this._deadDT = 0;
		this._deadTimeout = 0;

		this._laserEnabled = false;
		this._laserParticleDT = 0;

		this._data = {
			gameOver: false,
			lives: equipItems.extraLive ? 3 : 2,
			health: 100,
			dead: false,
			rapidFire: !!equipItems.rapidFire,
			powerups: {
				shield: (equipItems.shield || debugConstants.startShields) * 100,
				rapidrapidFire: debugConstants.startRapidFire,
				guided: equipItems.guided || debugConstants.startRockets,
				emp: debugConstants.startEMP || 0,
				laser: (equipItems.laser || debugConstants.startLaser) * 10000
			},
			score: 0
		};

		this.emit('Reset', this._data);
	};

	this.onQuit = function () {
	};

	this.onClick = function (pt) {
		if ((this._data.powerups.guided <= 0) || (this._timeSinceRocket < 100)) {
			return;
		}

		var isTarget = bind(this, function (item) {
				var items = this._projectileSpawnerModel.getItems();
				var i = this._projectileSpawnerModel.length;

				while (i) {
					if (items[--i].getTarget() === item) {
						return true;
					}
				}
				return false;
			});

		var hitDistance = 50 * 50;
		var spawnerModels = [this._pickupSpawnerModel, this._enemySpawnerModel, this._bombSpawnerModel];
		var i = spawnerModels.length;
		var x = pt.x;
		var y = pt.y;

		while (i) {
			var spawnerModel = spawnerModels[--i];
			var playerPos = this._opts.pos;
			var items = spawnerModel.getItems();
			var j = spawnerModel.length;

			while (j) {
				var item = items[--j];
				var pos = item.getOpts().pos;
				var dx = pos.x - x;
				var dy = pos.y - y;
				if ((dx * dx + dy * dy < hitDistance) && !isTarget(item)) {
					this._target = item;
					return;
				}
			}
		}

		this._timeSinceRocket = 0;
	};

	this.onStart = function () {
		this._started = true;
	};

	this.onInput = function (pt) {
		if (!this._data.gameOver && !this._opts.dead) {
			this._targetPos = pt;
		}
	};

	this.onInputRelease = function () {
		if (!this._data.gameOver && !this._opts.dead) {
			this._targetPos = undefined;
			this._opts.velocity.x = 0;
		}
	};

	this.onDragUp = function () {
		if (this._data.powerups.laser > 0) {
			this._laserEnabled = !this._laserEnabled;
		} else {
			this._laserEnabled = false;
		}
	};

	this.onDragDown = function () {
		if (this._data.powerups.emp > 0) {
			this._data.powerups.emp--;
			this._game.flash('#FFDD88');
			this._game.emp();
		}
	};

	this._die = function () {
		this._data.lives--;
		this._data.health = 100;

		var pos = this._opts.pos;
		this._game.createParticles(gameConstants.particleSystems.PARTICLE_BOTTOM, 'fire', new Point(pos.x, pos.y), new Point(0, 0));

		this.emit('Dead', this._data);

		soundManager.play('explosion');

		if (this._data.lives < 0) {
			this._data.gameOver = true;
			this._opts.dead = true;
			this.emit('GameOver');
		} else {
			this._opts.dead = true;
			this._deadDT = 3000;
			this._deadTimeout = 5000;
			this._targetPos = false;

			this._opts.pos.x = GC.app.baseWidth * 0.5;
			this._opts.velocity.x = 0;
		}
	};

	this._updatePowerups = function (dt) {
		var opts = this._opts;

		opts.shield = (this._data.powerups.shield > 0);

		if (opts.shield) {
			if (!(opts.shape instanceof Circle)) {
				opts.shape = this._shapeShield;
			}
		} else if (!(opts.shape instanceof Rect)) {
			opts.shape = this._shapeDefault;
		}
	};

	this._updateDeadTimeout = function (dt) {
		this._deadTimeout -= dt;
		if (this._opts.dead) {
			this._deadDT -= dt;
			if (this._deadDT < 0) {
				this._opts.dead = false;
			}
		}
	};

	this._updateProjectile = function (dt) {
		var shootInterval = this._data.rapidFire || (this._data.powerups.rapidFire > 0) ?
				gameConstants.PLAYER_SHOOT_FAST_INTERVAL :
				gameConstants.PLAYER_SHOOT_BASE_INTERVAL;

		this._timeSinceRocket += dt;
		this._timeSinceShot += dt;
		if (!this._laserEnabled && (this._timeSinceShot >= shootInterval)) {
			if (this._data.powerups.rapidFire > 0) {
				this._data.powerups.rapidFire--;
			}

			var projectileType = gameConstants.projectileTypes.STANDARD;
			if (this._target) {
				this._data.powerups.guided--;
				projectileType = gameConstants.projectileTypes.GUIDED;
			}

			var pos = this._opts.pos;
			this._timeSinceShot %= shootInterval;

			this._projectileSpawnerModel.spawnProjectile(
				new Point(pos.x - 15, pos.y - gameConstants.PLAYER_HEIGHT * 0.9),
				this._target,
				projectileType
			);

			this._opts.rapidFire = true;
			this._target = null;
		} else {
			this._opts.rapidFire = false;			
		}
	};

	this._updateBombs = function (dt) {
		var items = this._game.collidesWithPool(this, gameConstants.viewPoolTypes.BOMB_POOL);
		if (items.length) {
			var i = items.length;
			while (i) {
				var item = items[--i];
				var itemPos = item.getOpts().pos;
				item.hit();
				this._game.createParticles(gameConstants.particleSystems.PARTICLE_BOTTOM, 'fire', new Point(itemPos.x, itemPos.y), new Point(0, 0));
			}

			if (this._data.powerups.shield > 0) {
				this._data.powerups.shield -= 20;
				if (this._data.powerups.shield < 0) {
					this._data.powerups.shield = 0;
				}
			} else {
				this._die();
			}
		}
	};

	this._updatePos = function (dt) {
		if (this._targetPos) {
			var playerDistance = this._targetPos.x - this._opts.pos.x;
			var travelDistance = playerDistance * MOTION_EASE;
			this._opts.velocity.x = travelDistance * 1000 / dt;
		}
	};

	this._updateEnemey = function (dt) {
		!this._data.gameOver && (this._deadTimeout <= 0) && this.collidesWith(this._enemyJumperModel) && this._die();
	};

	this._updateLaser = function (dt) {
		if (!this._laserEnabled || (this._deadTimeout > 0)) {
			this._opts.laser = false;
			return;
		}

		this._data.laser -= dt;
		if (this._data.laser < 0) {
			this._laserEnabled = false;
			this._opts.laser = false;
			return;
		}

		var found = null;
		var maxY = 0;
		var modelPools = [
				gameConstants.viewPoolTypes.ENEMY_POOL,
				gameConstants.viewPoolTypes.PICKUP_POOL,
				gameConstants.viewPoolTypes.BOMB_POOL
			];
		var i = modelPools.length;
		var x = this._opts.pos.x + gameConstants.LASER_VISUAL_OFFSET_X;

		while (i) {
			var modelPool = this._game.getModelPool(modelPools[--i]);
			var items = modelPool.getItems();
			var j = modelPool.length;

			while (j) {
				var item = items[--j];
				var opts = item.getOpts();
				var shape = item.getShape();
				var hit = false;

				if (shape instanceof Circle) {
					hit = (x > shape.x - shape.radius) && (x < shape.x + shape.radius);
				} else if (shape instanceof Rect) { // It's a rectangle...
					hit = (x > shape.x) && (x < shape.x + shape.width);
				}
				if (hit && (opts.pos.y > maxY)) {
					maxY = opts.pos.y;
					found = item;
				}
			}
		}

		this._opts.laserY = 0;
		if (found) {
			found.subLaserDT && found.subLaserDT(dt);
			this._opts.laserY = maxY + (found.laserPos || 0);

			this._laserParticleDT -= dt;
			if (this._laserParticleDT < 0) {
				this._laserParticleDT = 50 + Math.random() * 50;

				var particleSystem = this._game.getParticleSystem(gameConstants.particleSystems.PARTICLE_BOTTOM);
				particleSystem.setAngles(Math.PI * -0.5, Math.PI * 0.5);
				particleSystem.activateType('laserHit');
				particleSystem.addOne(x, this._opts.laserY);
				particleSystem.setAngles(0, Math.PI * 2);
			}
		}
		this._opts.laser = true;
	};

	this.tick = function (dt) {
		this._opts.dt = dt;

		this._updatePowerups(dt);
		this._updateDeadTimeout(dt);
		this._updateEnemey(dt);

		(this._data.health < 0) && this._die();

		if (this._data.gameOver) {
			return;
		}
		if (this._game.getAnimalCount() <= 0) {
			this._data.gameOver = true;
			this.emit('GameOver');
		}

		supr(this, 'tick', arguments);

		if (this._opts.dead) {
			return;
		}

		this._updateProjectile(dt);
		this._updatePos(dt);
		this._updateBombs(dt);
		this._updateLaser(dt);

		this._playerAI && this._playerAI.update(dt);
	};

	this.addKill = function () { // The number of times the player has hit an enemy...
		this._kills++;
	};

	this.getProjectileSpawnerModel = function () {
		return this._projectileSpawnerModel;
	};

	this.getData = function () {
		return this._data;
	};

	this.getGameOver = function () {
		return this._data.gameOver;
	};

	this.getTimeout = function () {
		return (this._deadTimeout > 0);
	};

	this.getPowerups = function () {
		return this._data.powerups;
	};

	this.getScore = function () {
		return this._data.score;
	};

	this.getTargetPos = function () {
		return this._targetPos;
	};

	this.setTargetPos = function (targetPos) {
		this._targetPos = targetPos;
	};

	this.subHealth = function (health) {
		if (this._data.powerups.shield > 0) {
			this._data.powerups.shield -= health * 0.5;
			if (this._data.powerups.shield < 0) {
				this._data.powerups.shield = 0;
			}
		} else {
			this._data.health -= health;
		}
	};

	this.addScore = function (score) {
		this._data.score += score;
	};
});