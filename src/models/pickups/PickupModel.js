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

import src.lib.Enum as Enum;

import src.constants.gameConstants as gameConstants;
import src.constants.powerupConstants as powerupConstants;
import src.constants.characterConstants as characterConstants;

import shooter.models.EntityModel as EntityModel;

import src.sounds.soundManager as soundManager;

var modes = Enum(
	'EJECT',
	'PARACHUTE'
);

var pickupActions = [];
pickupActions[powerupConstants.pickupTypes.PICKUP_SCORE] =
	{field: 'score', value: 15, text: '15'};

pickupActions[powerupConstants.pickupTypes.PICKUP_EXTRA_LIFE] =
	{field: 'lives', value: 1, sound: 'bonusLife', text: characterConstants.CALLOUT_EXTRA_LIFE};

pickupActions[powerupConstants.pickupTypes.PICKUP_RAPID_FIRE] =
	{field: 'rapidFire', value: 100, sound: 'bonusFire', text: characterConstants.CALLOUT_RAPID_FIRE};

pickupActions[powerupConstants.pickupTypes.PICKUP_SHIELD] =
	{powerup: 'shield', value: 100, sound: 'bonusShield', text: characterConstants.CALLOUT_SHIELD};

pickupActions[powerupConstants.pickupTypes.PICKUP_EMP] =
	{powerup: 'emp', value: 1, sound: 'bonusEMP', text: characterConstants.CALLOUT_EMP};

pickupActions[powerupConstants.pickupTypes.PICKUP_LASER] =
	{powerup: 'laser', value: 10000, sound: 'bonusLaser', text: characterConstants.CALLOUT_LASER};

pickupActions[powerupConstants.pickupTypes.PICKUP_GUIDED] =
	{powerup: 'guided', value: 3, sound: 'bonusGuided', text: characterConstants.CALLOUT_ROCKET};

pickupActions[powerupConstants.pickupTypes.PICKUP_ANIMAL_SHIELD] =
	{sound: 'bonusShield', text: characterConstants.CALLOUT_COW_SHIELD};

exports = Class(EntityModel, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				shape: new Circle(0, 0, 28),
				color: 'rgba(0, 200, 255, 0.7)',
				velocity: new Point(gameConstants.PICKUP_HORIZONTAL_SPEED, gameConstants.PICKUP_VERTICAL_SPEED)
			}
		);

		supr(this, 'init', [opts]);

		this._labelSpawnerModel = opts.labelSpawnerModel;
		this._animalSpawnerModel = opts.animalSpawnerModel;
		this._game = opts.game;
		this._mode = modes.PARACHUTE;
	};

	this.getPickupType = function () {
		return this._opts.pickupType;
	};

	this.refreshOpts = function (opts) {
		supr(this, 'refreshOpts', arguments);

		var opts = this._opts;

		opts.r = 0;
		opts.rDT = 0;
		opts.sDT = 0;
		opts.velocity.y = gameConstants.PICKUP_VERTICAL_SPEED;

		if (opts.pos.x < GC.app.baseWidth * 0.5) {
			opts.velocity.x = Math.abs(opts.velocity.x);
		} else {
			opts.velocity.x = -Math.abs(opts.velocity.x);
		}

		this._lifetimeDT = 0;
		this._pickupSpawnerModel = opts.pickupSpawnerModel;
		this._particleDT = 0;
		this._startY = opts.pos.y;
		this._dt = 0;
		this._health = 5;

		this._laserDT = 75;

		if (opts.pos.y > 400) {
			this._mode = modes.EJECT;
			soundManager.play('eject');
		} else {
			this._mode = modes.PARACHUTE;
		}
	};

	this.isOffscreen = function () {
		var pos = this._opts.pos;

		return (pos.x < -50) || (pos.x > GC.app.baseWidth + 50);
	};

	this._shieldAnimal = function () {
		var items = this._animalSpawnerModel.getItems();
		var i = this._animalSpawnerModel.length;

		while (i) {
			var item = items[--i];
			if (!item.getShield() && !item.getDish()) {
				item.setShield(true);
				return;
			}
		}
	};

	this._checkHealth = function () {
		if ((this._health > 0) && (this._laserDT > 0)) {
			return false;
		}

		var opts = this._opts;

		this._game.createParticles(
			gameConstants.particleSystems.PARTICLE_BOTTOM,
			'alienDeath',
			new Point(opts.pos.x, opts.pos.y),
			new Point(0, 0)
		);

		var data = this._game.getPlayerModel().getData();
		var pos = this._opts.pos;
		var pickupPos = new Point(pos.x, pos.y - 50);
		var pickupAction = pickupActions[this._opts.pickupType];

		this._labelSpawnerModel.spawnLabel(pickupPos, pickupAction.text, {x: 0, y: -100});
		pickupAction.sound && soundManager.play(pickupAction.sound);

		if (this._opts.pickupType === powerupConstants.pickupTypes.PICKUP_ANIMAL_SHIELD) {
			this._shieldAnimal();
		} else if (pickupAction.field) {
			data[pickupAction.field] += pickupAction.value;
		} else if (pickupAction.powerup) {
			data.powerups[pickupAction.powerup] += pickupAction.value;
		}

		return true;
	};

	this.tick = function (dt) {
		var opts = this._opts;

		this._lifetimeDT += dt;

		opts.sDT += dt;

		switch (this._mode) {
			case modes.EJECT:
				this._dt += dt;
				if (this._dt > 900) {
					this._mode = modes.PARACHUTE;
					this._dt = 0;
				} else {
					opts.pos.y = this._startY - Math.sin(this._dt / 600 * Math.PI * 0.5) * 300;
				}
				opts.pos.x += opts.velocity.x * dt / 1000;
				opts.parachute = false;

				this._particleDT -= dt;
				if (this._particleDT < 0) {
					this._particleDT = 10 + Math.random() * 20;
					this._game.createParticle({x: opts.pos.x + Math.random() * 20 - 10, y: opts.pos.y + Math.random() * 20 - 10}, 'green');
				}

				this.emit('Update', opts);
				return false;

			case modes.PARACHUTE:
				this._dt += dt;

				opts.scaleDT = dt;
				opts.rDT += dt;
				opts.r = Math.sin(opts.rDT * 0.003) * 0.2;
				opts.parachute = true;

				if (opts.pos.y > 300) {
					opts.velocity.y *= 1 - dt / 1000;
					if (opts.pos.y > 550) {
						opts.pos.y = 550;
					}
				}

				return this._checkHealth() || supr(this, 'tick', arguments);
		}

		return true;
	};

	this.subHealth = function (health) {
		if (this._lifetimeDT > 500) {
			this._health -= health;
		}
	};

	this.subLaserDT = function (dt) {
		if (this._lifetimeDT > 500) {
			this._laserDT -= dt;
		}
	};

	this.getHealth = function(){
   		return this._health;
   };
});
