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

import src.constants.gameConstants as gameConstants;

import ..label.LabelModel as LabelModel;

exports = Class(ModelPool, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {type: 'labelType'});
		supr(this, 'init', [opts]);

		this._boundSpawnCb = bind(this, '_onViewCreate');
	};

	this.spawnLabel = function (pt, text, velocity) {
		var item = this._allocItem(LabelModel);
		var opts = item.getOpts();

		item.updatePos(pt);

		opts.type = gameConstants.viewPoolTypes.LABEL_POOL;
		opts.text = text;
		opts.velocity = velocity;
		opts.cb = this._boundSpawnCb; // This callback is called when a view from the view pool is added to this object
		opts.item = item;

		this.emit('ItemSpawned', opts);
	};

	/**
	 * The opts parameter here is the same as emitted in spawnLabel but has a view value in it
	 */
	this._onViewCreate = function (item) {
		item.refreshOpts();
	};
});