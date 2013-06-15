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
import src.constants.powerupConstants as powerupConstants;

import src.sounds.soundManager as soundManager;

import ..pickups.PickupModel as PickupModel;

exports = Class(ModelPool, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {type: 'pickupType'});
		supr(this, 'init', [opts]);

		this._game = opts.game;
		this._pickupTypes = powerupConstants.pickupTypes;
	};

	this.reset = function (equipItems) {
		supr(this, 'reset', arguments);

		this._chances = equipItems.rapidFire ? powerupConstants.chancesRapidFire : powerupConstants.chances;			
	};

	this._selectedPickup = function (pickupType) {
		(pickupType !== this._pickupTypes.PICKUP_SCORE) && this.emit('Pickup');

		return pickupType;
	};

	this.getRandomType = function () {
		if (debugConstants.alwaysScore) {
			if (Math.random() < 0.3) {
				soundManager.play('alien');
			}
			return this._selectedPickup(this._pickupTypes.PICKUP_SCORE);
		}
		if (debugConstants.alwaysShield) {
			return this._selectedPickup(this._pickupTypes.PICKUP_SHIELD);
		}
		if (debugConstants.alwaysLive) {
			return this._selectedPickup(this._pickupTypes.PICKUP_EXTRA_LIFE);
		}
		if (debugConstants.alwaysGuided) {
			return this._selectedPickup(this._pickupTypes.PICKUP_GUIDED);
		}
		if (debugConstants.alwaysEMP) {
			return this._selectedPickup(this._pickupTypes.PICKUP_EMP);
		}
		if (debugConstants.alwaysLaser) {
			return this._selectedPickup(this._pickupTypes.PICKUP_LASER);
		}
		if (debugConstants.alwaysAnimalShield) {
			return this._selectedPickup(this._pickupTypes.PICKUP_ANIMAL_SHIELD);
		}

		var pickupType = this._pickupTypes.PICKUP_BONUS;
		var pickupRoll = Math.random();
		var chances = this._chances;
		var i = chances.length;
		var n = 0;

		while (i) {
			var chance = chances[--i];
			n += chance.chance;
			if (pickupRoll < n) {
				pickupType = chance.type;
				break;
			}
		}

		if ((pickupType === this._pickupTypes.PICKUP_SCORE) && (Math.random() < 0.3)) {
			soundManager.play('alien');
		}

		return this._selectedPickup(pickupType);
	};

	this.spawnPickup = function (pt, forceType) {
		var pickupType = forceType || this.getRandomType();
		var item = this._allocItem(PickupModel, pickupType);
		var opts = item.getOpts();

		item.updatePos(pt);

		opts.pickupSpawnerModel = this;
		opts.pickupType = pickupType;
		opts.game = this._game;
		opts.type = gameConstants.viewPoolTypes.PICKUP_POOL;
		opts.item = item;

		this.emit('ItemSpawned', opts);
	};
});