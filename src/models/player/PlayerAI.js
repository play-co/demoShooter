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

import src.constants.gameConstants as gameConstants;

import src.lib.Enum as Enum;

var jumperAvoid = Enum(
	'START',
	'WAIT',
	'MOVE'
);

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._player = opts.target;
		this._enemyJumperModel = opts.enemyJumperModel;
		this._game = opts.game;

		this._enemyJumperModel.
			on('Start', bind(this, 'onStartJumper')).
			on('Pause', bind(this, 'onPauseJumper'));

		this._jumperCheck = false;
		this._jumperMinX = GC.app.baseWidth * 0.1;
		this._jumperMaxX = GC.app.baseWidth * 0.9;
		this._jumperAvoid = false;

		this._target = null;
		this._targetTime = 0;

		this._possibleTargetCount = 0;
		this._possibleTargets = [];

		this._rangeMin = 25;
		this._rangeMax = GC.app.baseWidth - 25;
	};

	this.update = function (dt) {
		if (this._jumperCheck) {
			var jumperOpts = this._enemyJumperModel.getOpts();
			var jumperPos = jumperOpts.pos;
			switch (this._jumperAvoid) {
				case jumperAvoid.START:
					if ((jumperPos.x > this._jumperMinX) && (jumperPos.x < this._jumperMaxX) && (jumperOpts.sin > 0.9)) {
						this._jumperAvoid = jumperAvoid.WAIT;
						this._player.setTargetPos({x: jumperPos.x, y: 0});
					}
					break;

				case jumperAvoid.WAIT:
					if (jumperOpts.sin < 0.1) {
						//this._jumperAvoid = jumperAvoid.WAIT;
					}				
					break;
			}
			this._target = null;
		} else {
			this._targetTime -= dt;
			if (this._targetTime < 0) {
				this._target = null;
			}
			if (this._target === null) {
				this._findTarget();
			}
		}

		if (this._target) {
			if (this._target.getHealth && (this._target.getHealth() < 0)) {
				this._findTarget();
			}
			this._target && this._player.setTargetPos({x: this._target.getOpts().pos.x, y: 0});
		}
	};

	this._findTarget = function () {
		this._possibleTargetCount = 0;
		this._targetTime = 50;

		this._findTargetBomb();
		this._findTargetEnemy();
		this._findTargetPickup();

		this._possibleTargets.length = this._possibleTargetCount;
		this._possibleTargets.sort();

		if (this._possibleTargetCount > 0) {
			this._target = this._possibleTargets[this._possibleTargetCount - 1].item;
		}
	};

	this._addPossibleTarget = function (item, weight) {
		weight |= 0;

		if (this._possibleTargets[this._possibleTargetCount]) {
			this._possibleTargets[this._possibleTargetCount].item = item;
			this._possibleTargets[this._possibleTargetCount].weight = weight;
		} else {
			this._possibleTargets[this._possibleTargetCount] = {
				item: item,
				weight: weight,
				toString: function () {
					return ('000000' + this.weight).substr(-6);
				}
			};
		}

		this._possibleTargetCount++;
	};

	this._findTargetEnemy = function () {
		var items = this._game.getModelPool(gameConstants.viewPoolTypes.ENEMY_POOL).getItems();
		var rangeMin = 25;
		var rangeMax = GC.app.baseWidth - 25;
		var i = items.length;

		while (i) {
			var item = items[--i];
			var x = item.getOpts().pos.x;
			var y = item.getOpts().pos.y;
			if ((x > rangeMin) && (x < rangeMax)) {
				if (item.getAnimal && item.getAnimal()) {
					y *= 40;
				}
				if (item.isBeaming && item.isBeaming()) {
					y *= 20;
				}
				this._addPossibleTarget(item, y);
			}
		}
	};

	this._findTargetBomb = function () {
		var items = this._game.getModelPool(gameConstants.viewPoolTypes.BOMB_POOL).getItems();
		var rangeMin = 25;
		var rangeMax = GC.app.baseWidth - 25;
		var i = items.length;

		while (i) {
			var item = items[--i];
			var x = item.getOpts().pos.x;
			var y = item.getOpts().pos.y;
			if ((x > rangeMin) && (x < rangeMax)) {
				if (y > GC.app.baseHeight * 0.6) {
					y *= 50;
				}
				this._addPossibleTarget(item, y);
			}
		}
	};

	this._findTargetPickup = function () {
		var items = this._game.getModelPool(gameConstants.viewPoolTypes.PICKUP_POOL).getItems();
		var rangeMin = 25;
		var rangeMax = GC.app.baseWidth - 25;
		var i = items.length;

		while (i) {
			var item = items[--i];
			var x = item.getOpts().pos.x;
			var y = item.getOpts().pos.y;
			if ((x > rangeMin) && (x < rangeMax)) {
				y *= 0.7;
				this._addPossibleTarget(item, y);
			}
		}
	};

	this.onStartJumper = function () {
		this._jumperCheck = true;
		this._jumperAvoid = jumperAvoid.START;

		this._player.setTargetPos({x: GC.app.baseWidth * 0.5, y: 0});
	};

	this.onPauseJumper = function () {
		this._jumperCheck = false;
	};
});