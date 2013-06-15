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
import math.geom.Point as Point;
import math.geom.Circle as Circle;
import math.geom.Rect as Rect;

import src.lib.Enum as Enum;

import shooter.models.ActorModel as ActorModel;

import src.constants.gameConstants as gameConstants;
import src.constants.enemyConstants as enemyConstants;

import src.sounds.soundManager as soundManager;

var modes = Enum(
	'DOWN',
	'BEAMING',
	'UP',
	'EMP',
	'DEAD'
);

/**
 * This class controls the movement of a small dish.
 */
exports = Class(ActorModel, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				// Set the collision shape:
				shape: new Rect(0, -10, 90, 30),
				// Set the collision color, will be used to display the collision area in the
				// simulator if debugConstants.showCollision is set to true.
				color: 'rgba(0, 120, 255, 0.7)',
				velocity: new Point(0, 0)
			}
		);

		supr(this, 'init', [opts]);

		this.isDeathRay = false;
		this.laserPos = 10;

		this._particleType = 'beamBlue';
		this._beamHeight = 150 + enemyConstants.BEAM_SMALL_HEIGHT;

		this._pickupSpawnerModel = opts.pickupSpawnerModel;
		this._labelSpawnerModel = opts.labelSpawnerModel;
		this._bombSpawnerModel = opts.bombSpawnerModel;
	};

	/**
	 * Set the mode, play a sound depending on the mode which is being set.
	 */
	this._setMode = function (mode) {
		if (this._mode === modes.BEAMING) {
			soundManager.stop('beam');
		}
		if (mode === modes.BEAMING) {
			soundManager.play('beam');
		}
		this._mode = mode;
	};

	/**
	 * This function is called when the model is obtained from the model pool.
	 */
	this.refreshOpts = function (opts) {
		supr(this, 'refreshOpts', arguments);

		opts = this._opts;

		this._health = opts.health;
		this._modeDT = 0;
		this._modeR = 0;
		this._setMode(opts.mode || modes.DOWN);

		this._beamingDT = 0;
		this._beamParticleDT = 0;
		this._beamDuration = 1000;

		this._empDone = false;

		this._animal = null;
		this._level = this._game.getLevel();
		this._playerModel = this._game.getPlayerModel();

		this._dirR = 0;
		this._dirDT = 0; // Time to move left or right

		this._laserDT = 100;

		opts.visible = true;
		opts.r = 0;
		opts.rDT = Math.random() * 1000;

		opts.velocity.x = 0;
		opts.velocity.y = this._level.smallDish.verticalVelocity;

		delete opts.mode;
	};

	/**
	 * Find an animal which is nearby in the animal model pool.
	 */
	this._findAnimal = function () {
		var pos = this._opts.pos;
		var minDistance = 10000;
		var found = null;
		var animalPool = this._game.getModelPool(gameConstants.viewPoolTypes.ANIMAL_POOL);
		var animals = animalPool.getItems();
		var i = animalPool.length;

		while (i) {
			var animal = animals[--i];
			var animalPos = animal.getOpts().pos;
			var distance = Math.abs(animalPos.x - pos.x + 20);
			if (!animal.getDish() && (distance < minDistance) && (distance < enemyConstants.BEAM_ATTACH_DISTANCE)) {
				minDistance = distance;
				found = animal;
			}
		}

		if (found) {
			if (found.getShield()) {
				found.setShield(false);
			} else {
				found.setDish(this);
			}
		}
	};

	this._checkHealth = function (opts, particles, pickup) {
		if ((this._health < 0) || (this._laserDT < 0)) {
			if (this._animal) {
				this._animal.drop();
				this._animal = null;
			}

			var scoreValue = 20;
			var pos = new Point(opts.pos.x, opts.pos.y);
			this._game.createParticles(gameConstants.particleSystems.PARTICLE_BOTTOM, particles, pos, new Point(0, 100));
			this._game.getPlayerModel().addScore(scoreValue);

			this._labelSpawnerModel.spawnLabel(new Point(pos.x, pos.y), scoreValue, {x: 0, y: -100});
			pickup && this._pickupSpawnerModel.spawnPickup(new Point(pos.x, pos.y));

			soundManager.play('explosion');

			return true;
		}

		return false;
	};

	this._updateHorizontalMovement = function (dt) {
		var opts = this._opts;

		this._dirDT -= dt;
		if (this._dirDT < 0) {
			if (opts.velocity.x === 0) {
				this._dirDT = 1000 + Math.random() * 500;
				if (Math.random() < 0.5) {
					opts.velocity.x = -this._level.smallDish.horizontalVelocity;
				} else {
					opts.velocity.x = this._level.smallDish.horizontalVelocity;
				}
			} else {
				this._dirDT = 150;
				this._opts.velocity.x = 0;
			}
			this._dirR = 0;
		}
	};

	this.tick = function (dt) {
		var opts = this._opts;
		var pos = opts.pos;
		var pct = dt / 1000;
		var half = enemyConstants.SMALL_DISH_WIDTH * 0.5;

		opts.r = 0;
		opts.emp = false;

		switch (this._mode) {
			case modes.DOWN:
				this._updateHorizontalMovement(dt);

				if (pos.y > GC.app.baseHeight - this._beamHeight) { // If minimum height is reached...
					pos.y = GC.app.baseHeight - this._beamHeight;

					opts.velocity.x = 0;
					opts.velocity.y = -opts.velocity.y;

					if (this._game.getPlayerModel().getTimeout()) {
						this._setMode(modes.UP);
					} else {
						this._findAnimal && this._findAnimal();
						this._setMode(modes.BEAMING);
						this._beamingDT = 0;
					}
				} else {
					pos.x = Math.max(Math.min(pos.x + opts.velocity.x * pct, GC.app.baseWidth - half), half);
					pos.y += opts.velocity.y * pct;
				}
				if (this._checkHealth(opts, 'fire', true)) {
					this._setMode(modes.DEAD);
					return true;
				}
				break;

			case modes.BEAMING:
				this._beamingDT += dt;
				if (this._checkHealth(opts, 'fire', true)) {
					this._setMode(modes.DEAD);
					return true;
				}
				if (this._beamingDT > this.getBeamDuration()) {
					this._setMode(modes.UP);
				}

				this._beamParticleDT -= dt;
				if (this._beamParticleDT < 0) {
					this._game.createParticles(
						gameConstants.particleSystems.PARTICLE_BOTTOM,
						this._particleType,
						new Point(pos.x, GC.app.baseHeight - (gameConstants.STATUS_HEIGHT + gameConstants.GROUND_HEIGHT) + 20),
						new Point(0, 0)
					);
					this._beamParticleDT = 50 + Math.random() * 100;
				}
				break;

			case modes.UP:
				this._updateHorizontalMovement(dt);

				pos.x = Math.max(Math.min(pos.x + opts.velocity.x * pct, GC.app.baseWidth - half), half);
				pos.y += opts.velocity.y * pct;
				if (pos.y < -100) {
					return true;
				}
				if (this._checkHealth(opts, 'fire', true)) {
					this._setMode(modes.DEAD);
					return true;
				}
				break;

			case modes.EMP:
				this._modeDT -= dt;
				if (this._modeDT > 0) {
					this._modeR += dt;
					opts.r = Math.sin(this._modeR * 0.03) * 0.1 * Math.sin(this._modeDT / 1500 * Math.PI * 0.5);
					opts.emp = true;
				} else {
					this._setMode(modes.UP);
					opts.velocity.y = -Math.abs(opts.velocity.y);
				}

				if (this._checkHealth(opts, 'alienDeath', false)) {
					this._setMode(modes.DEAD);
					return true;
				}
				break;
		}

		opts.dt = dt;
		opts.beaming = this._mode === modes.BEAMING;

		this.emit('Update', opts);

		return false;
	};

	this.getAnimal = function () {
		return this._animal;
	};

	this.setAnimal = function (animal) {
		this._animal = animal;
	};

	this.getHealth = function () {
		return this._health;
	};

	this.getBeamHeight = function () {
		return enemyConstants.BEAM_SMALL_HEIGHT;
	};

	this.getBeamDuration = function () {
		var beamDuration = this._beamDuration;
		if (this._animal && this._animal.isFat()) {
			beamDuration *= 3;
		}
		return beamDuration;
	};

	this.isBeaming = function () {
		return this._mode === modes.BEAMING;
	};

	this.emp = function () {
		if (!this._empDone) {
			this._empDone = true;

			if (this._animal) {
				this._animal.drop();
				this._animal = null;
			}
			this._setMode(modes.EMP);
			this._modeDT = 1500;
		}
	};
});

exports.modes = modes;