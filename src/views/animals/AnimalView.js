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
import ui.resource.Image as Image;

import ui.View as View;
import ui.ImageView as ImageView;

import shooter.views.EntitySpriteView as EntitySpriteView;

import src.constants.gameConstants as gameConstants;
import src.constants.enemyConstants as enemyConstants;

// Create images, using Image instances is faster than using a string when changing an image...
var beamImage = new Image({url: 'resources/images/enemies/fx_aura_abduction.png'});
var deathRayImage = new Image({url: 'resources/images/enemies/fx_aura_blast.png'});

/**
 * This class displays a cow, its shield and the "beam" glow behind it...
 */
exports = Class(EntitySpriteView, function (supr) {
	this.init = function (opts) {
		opts = merge(
				opts,
				{
					url: 'resources/images/player/cow',
					width: gameConstants.ANIMAL_WIDTH,
					height: gameConstants.ANIMAL_HEIGHT
				}
			);

		supr(this, 'init', [opts]);

		this._shieldView = new ImageView({
			superview: this,
			x: 0,
			y: 0,
			width: gameConstants.ANIMAL_WIDTH,
			height: gameConstants.ANIMAL_HEIGHT,
			image: 'resources/images/player/animalShield.png',
			visible: false
		})

		this._worldView = opts.worldView;
	};

	/**
	 * The create function is called when a model from the model pool is connected
	 * with this view. The opts parameter is the opts from the model.
	 */
	this.create = function (opts) {
		this.startAnimation('walk', {loop: true});

		this._beamView = null;
		this._beamViewPool = this._worldView.getViewPools()[gameConstants.viewPoolTypes.BEAM_POOL];
	};

	/**
	 * This function is called each tick, the opts come from the model.
	 * The value of opts should only be read here, changes should only be made to it in the model!
	 */
	this.onUpdate = function (opts) {
		supr(this, 'onUpdate', arguments);

		if (opts.dir == -1) {
			this.style.flipX = false;
		} else if (opts.dir == 1) {
			this.style.flipX = true;
		}

		// Check if this animal is being beamed up...
		if (opts.beaming) {
			// If there's no beamView yet the obtain one:
			if (!this._beamView) {
				this._beamView = this._beamViewPool.obtainView();
				this._beamView.setImage(opts.isDeathRay ? deathRayImage : beamImage);
			}
			var beamViewStyle = this._beamView.style;

			// Apply the style to the beamView:
			beamViewStyle.x = opts.pos.x;
			beamViewStyle.y = opts.pos.y;
			beamViewStyle.width = opts.width;
			beamViewStyle.height = opts.height;
			beamViewStyle.visible = true;
			this.play('rise');
		} else if (this._beamView) { // Check if there's a beamView which can be released:
			this._beamView.style.visible = false;
			this._beamViewPool.releaseView(this._beamView);
			this._beamView = null;			
			this.play('stand');
		} else {
			switch (opts.dir) {
				case 0:
					this.play('stand');
					break;

				default:
					this.play('walk');
					break;
			}
		}

		// Apply the position
		this.style.x = opts.pos.x;
		this.style.y = opts.pos.y;
		// Apply the size, since the size is dynamic it should be set here,
		// if the size was not dynamic then setting it in the 'create' function 
		// of this class would be better...
		this.style.width = opts.width;
		this.style.height = opts.height;
		this.style.visible = true;

		// Set the size of the shield
		this._shieldView.style.width = opts.width;
		this._shieldView.style.height = opts.height + 20;
		// The visibility is determined by the model and depends on whether or not this animal has a shield...
		this._shieldView.style.visible = opts.shield;
	};

	/**
	 * This function is called when this View is released from the view pool.
	 * If a beamView was obtained from the beamViewPool then it should be released.
	 */
	this.onRelease = function (target) {
		this.stopAnimation();
		if (this._beamView) {
			this._beamViewPool.releaseView(this._beamView);
			this._beamView = null;
		}
	};
});