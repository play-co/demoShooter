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
import ui.resource.Image as Image;

import src.constants.gameConstants as gameConstants;
import src.constants.enemyConstants as enemyConstants;

var beamImage = new Image({url: 'resources/images/enemies/fx_beam_abduction.png'});

var EnemySmallDishUpdater = Class(function () {
	this.create = function (worldView, target, opts) {
		this._worldView = worldView;
		this._beamViewPool = this._worldView.getViewPools()[gameConstants.viewPoolTypes.BEAM_POOL];

		target.setSize(enemyConstants.SMALL_DISH_WIDTH, enemyConstants.SMALL_DISH_HEIGHT);
		target.startAnimation('standard', {loop: true});
		target.beamView = null;

		target.style.anchorY = 0;
	};

	this.update = function (target, opts) {
		target.style.anchorY = target.style.height * 0.5;
		target.style.r = opts.r;

		if (opts.beaming) {
			if (!target.beamView) {
				target.beamView = this._beamViewPool.obtainView();
				target.beamView.setImage(beamImage);

				var beamViewStyle = target.beamView.style;

				beamViewStyle.x = opts.pos.x - 22;
				beamViewStyle.y = opts.pos.y + 20;
				beamViewStyle.width = 50;
				beamViewStyle.height = 150;
				beamViewStyle.visible = true;
			} else {
				//target.beamView.style.backgroundColor 
			}
		} else if (target.beamView) {
			this._beamViewPool.releaseView(target.beamView);
			target.beamView = null;
		}
	};

	this.release = function (target) {
		if (target.beamView) {
			this._beamViewPool.releaseView(target.beamView);
			target.beamView = null;
		}
	};
});

exports = new EnemySmallDishUpdater();