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

import shooter.models.ActorModel as ActorModel;

import src.constants.gameConstants as gameConstants;

import src.sounds.soundManager as soundManager;

/**
 * The model for a bomb, handles behaviour like dropping.
 */
exports = Class(ActorModel, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				shape: new Circle(0, 0, 20),
				color: 'rgba(180, 0, 255, 0.7)',
				velocity: new Point(0, gameConstants.BOMB_SPEED)
			}
		);

		supr(this, 'init', [opts]);

		this._rotateDir = ('rotateDir' in opts) ? opts.rotateDir : 1;
	};

	/**
	 * This model is part of a model pool, when this model is obtained from the pool
	 * then this function is called with it initial opts values.
	 */
	this.refreshOpts = function () {
		supr(this, 'refreshOpts', arguments);

		var opts = this._opts;

		this._hit = false;
		this._level = this._game.getLevel();
		this._health = 1;
		this._laserDT = 200; // 200 milli seconds of laser hit will destroy this bomb.

		// Set the velocity, the movement will be handled by the superclass of this class...
		opts.velocity.x = 0;
		opts.velocity.y = this._level.bombVelocity;

		opts.rDT = 0;
	};

	/**
	 * This function is called every tick by the model pool.
	 * When this function returns true then this model will be removed from the
	 * pool and the associated view will be released.
	 */
	this.tick = function (dt) {
		supr(this, 'tick', arguments);

		var opts = this._opts;
		var pos = opts.pos;
		var ground = pos.y > GC.app.baseHeight - (gameConstants.FOOTER_HEIGHT + gameConstants.GROUND_HEIGHT);

		// Check if this bomb has hit the ground, if it was destroyed by being hit with bullets (health < 0)
		// or destroyed with a laser (laserDT < 0)...
		if (ground || (this._health < 0) || (this._laserDT < 0)) {
			// The bomb exploded, create a particle system:
			var pos = new Point(opts.pos.x + 30, opts.pos.y);
			this._game.createParticles(gameConstants.particleSystems.PARTICLE_BOTTOM, 'fire', pos, new Point(0, 100));			

			// Check if the bomb hit an animal...
			var items = this._game.collidesWithPool(this, gameConstants.viewPoolTypes.ANIMAL_POOL);
			var i = items.length;
			if (i) {
				while (i) {
					var item = items[--i];
					item.subHealth(10);
				}
			}
		}

		// Increase the rotation:
		opts.rDT += dt;

		// Check if this bomb was hit in any way:
		var explode = ground || this._hit || (this._health < 0) || (this._laserDT < 0);
		if (explode) {
			soundManager.play('explosion2');
		}

		return explode; // If the bomb exploded then it will be removed from the model pool.
	};

	/**
	 * This function is called when the player collides with this bomb.
	 */
	this.hit = function () {
		this._hit = true;
	};

	/**
	 * All bombs explode when an EMP is activated.
	 */
	this.emp = function () {
		this._health = -1;
	};
});