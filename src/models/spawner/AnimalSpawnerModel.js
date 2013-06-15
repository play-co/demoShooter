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
import src.constants.enemyConstants as enemyConstants;

import ..animals.AnimalModel as AnimalModel;

exports = Class(ModelPool, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {type: 'animalType'});

		supr(this, 'init', [opts]);

		this._game = opts.game;
	};

	this._spawnAnimal = function (fatAnimal, flock, shield) {
		var item = this._allocItem(AnimalModel);
		var opts = item.getOpts();

		var x = Math.random() * GC.app.baseWidth * 0.8 + GC.app.baseWidth * 0.1;
		var y = GC.app.baseHeight - gameConstants.GROUND_HEIGHT - gameConstants.FOOTER_HEIGHT - gameConstants.ANIMAL_HEIGHT - 10;

		if (opts.pos) {
			opts.pos.x = x;
			opts.pos.y = y;
		} else {
			opts.pos = new Point(x, y);
		}

		opts.animalSpawnerModel = this;
		opts.fat = fatAnimal;
		opts.flock = flock;
		opts.shield = shield;
		opts.game = this._game;
		opts.type = gameConstants.viewPoolTypes.ANIMAL_POOL;
		opts.animalType = 0;
		opts.item = item;

		this.emit('ItemSpawned', opts);
	};

	this.reset = function (equipItems) {
		supr(this, 'reset');

		for (var i = 0; i < (equipItems.extraAnimals ? 12 : 8); i++) {
			this._spawnAnimal(equipItems.fatAnimals, equipItems.flock, equipItems.animalShield);
		}
	};
});