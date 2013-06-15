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

import .EnemySmallDishModel;

exports = Class(EnemySmallDishModel, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				shape: new Rect(0, -10, 90, 30),
				color: 'rgba(0, 255, 120, 0.7)',
				velocity: new Point(0, 0)
			}
		);

		supr(this, 'init', [opts]);

		this.isDeathRay = true;
	};

	this.refreshOpts = function (opts) {
		supr(this, 'refreshOpts', arguments);

		this._particleType = 'beamRed';
		this._beamHeight = 150 + enemyConstants.BEAM_KILLER_HEIGHT;
		this._beamDuration = 4000;
	}

	this.getBeamHeight = function () {
		return enemyConstants.BEAM_KILLER_HEIGHT;
	};
});