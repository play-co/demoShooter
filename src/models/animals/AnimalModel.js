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

import src.lib.Enum as Enum;

import shooter.models.ActorModel as ActorModel;

import src.constants.gameConstants as gameConstants;
import src.constants.enemyConstants as enemyConstants;

import src.sounds.soundManager as soundManager;

var modes = Enum(
	'LEFT',
	'PAUSE',
	'RIGHT',
	'BEAMING_UP',
	'ON_DISH',
	'DROPPING'
);

/**
 * The model for an animal, handles behaviour like moving and being beamed up.
 */
exports = Class(ActorModel, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				shape: new Circle(0, 0, 20),
				velocity: new Point(50, 0)
			}
		);

		supr(this, 'init', [opts]);

		this._game = opts.game;
	};

	/**
	 * This model is part of a model pool, when this model is obtained from the pool
	 * then this function is called with it initial opts values.
	 */
	this.refreshOpts = function () {
		supr(this, 'refreshOpts', arguments);

		opts = this._opts;

		this._animalSpawnerModel = opts.animalSpawnerModel;

		this._shield = !!opts.shield;

		this._mode = modes.PAUSE;
		this._modeDT = 0;

		this._dish = null;
		this._dropSpeed = 1;

		this._flock = opts.flock; // Flocking behaviour?

		// When the opts.fat value is set then the animal will start increasing
		// in size after a random time between 5 and 11 seconds.
		this._growMax = 4.5 * Math.PI / 0.003;
		this._growPause = opts.fat ? (5000 + Math.random() * 60000) : Number.MAX_INT;
		this._growDT = 0;

		this._health = 4;

		// Random time after which to play a moo sound:
		this._soundDT = Math.random() * 20000;

		opts.visible = true;
		opts.r = 0;
	};

	/**
	 * This function is called every tick by the model pool.
	 * When this function returns true then this model will be removed from the
	 * pool and the associated view will be released.
	 */
	this.tick = function (dt) {
		var opts = this._opts;
		var pos = opts.pos;
		var pct = dt / 1000;
		var canRandomize = false;
		var canSound = false;
		var width = gameConstants.ANIMAL_WIDTH;
		var height = gameConstants.ANIMAL_HEIGHT;
		var groundPos;

		// Check if the animal needs to grow:
		this._growPause -= dt;
		if (this._growPause < 0) {
			var grow;
			this._growDT += dt;
			if (this._growDT > this._growMax) {
				grow = 1.3;
			} else {
				grow = 1 + Math.abs(Math.sin(this._growDT * 0.003)) * 0.3;
			}
			width *= grow;
			height *= grow;
		}

		// Set the size which is used by the view to display the animal:
		opts.width = width;
		opts.height = height;

		// Calculate the position of the ground:
		groundPos = GC.app.baseHeight - gameConstants.GROUND_HEIGHT - gameConstants.FOOTER_HEIGHT - height + gameConstants.GROUND_OFFSET - 10;

		switch (this._mode) {
			case modes.LEFT: // The animal is moving left.
				var min = width * 0.5;
				if (pos.x < min) { // Check if the animal has reached the minimum left position...
					pos.x = min;
					this._modeDT = 0; // Force a new random direction to be selected.
				} else {
					pos.x -= opts.velocity.x * pct;
				}
				pos.y = groundPos;
				opts.dir = -1;
				canRandomize = true;
				canSound = true;
				break;

			case modes.PAUSE: // Pause, don't move until this._modeDT is less than 0...
				pos.y = groundPos;
				opts.dir = 0;
				canRandomize = true;
				canSound = true;
				break;

			case modes.RIGHT: // The animal is moving right.
				var max = GC.app.baseWidth - width * 0.5;
				if (pos.x > max) { // Check if the animal has reached the maximum right position...
					pos.x = max;
					this._modeDT = 0; // Force a new random direction to be selected.
				} else {
					pos.x += opts.velocity.x * pct;
				}
				pos.y = groundPos;
				opts.dir = 1;
				canRandomize = true;
				canSound = true;
				break;

			case modes.BEAMING_UP: // The animal is being beamed up, this happens when a dish is assigned.
				opts.dir = 0;

				this._soundDT -= dt;
				if (this._soundDT < 0) {
					this._soundDT = Math.random() * 20000;
					soundManager.play('cow2');
				}

				if (this._modeDT < 0) {
					this._mode = modes.ON_DISH;
				} else {
					var beamHeight = this._dish.getBeamHeight();
					var beamDuration = this._dish.getBeamDuration() * 0.8;
					var beamUpHeight = (1 - (this._modeDT / beamDuration)) * beamHeight;

					pos.x = this._dish.getOpts().pos.x - 35;
					pos.y = groundPos - beamUpHeight;

					// Check if it's a death ray, if so and the animal is half way then explode the animal:
					if (this._dish.isDeathRay && (beamUpHeight > beamHeight * 0.5)) {
						pos.x += 35;
						pos.y += 30;
						this._game.createParticles(gameConstants.particleSystems.PARTICLE_BOTTOM, 'animal', pos, new Point(0, 0));
						return true;
					}
				}
				break;

			case modes.ON_DISH: // The animal is on a dish, set the position relative to the dish position:
				pos.x = this._dish.getOpts().pos.x - 35;
				pos.y = this._dish.getOpts().pos.y - 70;
				if (pos.y < -height) {
					return true;
				}
				break;

			case modes.DROPPING: // The animal is dropping to the ground:
				pos.y += this._dropSpeed * dt * 0.1;
				this._dropSpeed *= 1 + (dt * 0.003);
				if (pos.y > groundPos) { // If the ground is reached then a new random direction will be selected.
					pos.y = groundPos;
					this._modeDT = -1;
					canRandomize = true;
					this._soundDT = Math.random() * 20000;
				}
				break;
		}

		if (canSound) { // Play sounds at random intervals...
			this._soundDT -= dt;
			if (this._soundDT < 0) {
				this._soundDT = Math.random() * 20000;
				soundManager.play('cow1');
			}
		}

		this._modeDT -= dt;
		// Check if the time is up and a new position can be selected:
		if (canRandomize && (this._modeDT < 0)) {
			if (this._flock) {
				// If flocking behaviour then check how many animals there are,
				// if there are fewer animals then the flocking behaviour will be stronger:
				var chance = 0.1;
				if (this._animalSpawnerModel.length < 8) {
					chance = 0.3 + (7 - this._animalSpawnerModel.length) / 7 * 0.3;
				}

				if (Math.random() < chance) { // If flocking then move to the player:
					var playerPos = this._game.getPlayerModel().getOpts().pos;
					if (pos.x < playerPos.x) {
						this._mode = modes.RIGHT;
					} else {
						this._mode = modes.LEFT;
					}
				} else {
					this._mode = 1 + ((Math.random() * 3) | 0);					
				}
				this._modeDT = 250 + Math.random() * 250;
			} else {
				this._mode = 1 + ((Math.random() * 3) | 0);
				this._modeDT = 500 + Math.random() * 500;
			}
		}

		// If the health is less than 0 then return true and add particles:
		if (this._health < 0) {
			console.log('=========================remove!!!!!!!!!!');
			this._game.createParticles(gameConstants.particleSystems.PARTICLE_BOTTOM, 'animal', pos, new Point(0, 0));
			return true;
		}

		// Set the opts, these will be used by the view to display the animal:
		opts.dt = dt;
		opts.shield = this._shield;
		opts.beaming = this._dish && this._dish.isBeaming();
		opts.isDeathRay = this._dish && this._dish.isDeathRay;

		this.emit('Update', opts);

		return false;
	};

	this.getDish = function () {
		return this._dish;
	};

	/**
	 * Assign a dish to this animal, it changes the mode so it will start the beaming up state.
	 */
	this.setDish = function (dish) {
		dish.setAnimal(this);

		this._mode = modes.BEAMING_UP;
		this._dish = dish;
		this._modeDT = this._dish.getBeamDuration() * 0.8;

		this._soundDT = Math.random() * 2000;
	};

	this.getShield = function () {
		return this._shield;
	};

	this.setShield = function (shield) {
		this._shield = shield;
	};

	/**
	 * Get if it's a fat animal which influences the speed with which it's beamed up.
	 */
	this.isFat = function () {
		return this._growPause < 0;
	};

	/**
	 * Drop the animal from a dish.
	 */
	this.drop = function () {
		this._mode = modes.DROPPING;
		this._dropSpeed = this.isFat() ? 1 : 0.5;
		this._dish = null;
	};

	/**
	 * Remove health, called when a bobm collides nearby.
	 * If there's a shield then disable the shield else remove the health.
	 */
	this.subHealth = function (health) {
		if (this._shield) {
			this._shield = false;
		} else {
			this._health -= health;
		}
	};
});