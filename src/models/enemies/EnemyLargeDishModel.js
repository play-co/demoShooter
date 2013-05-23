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
import math.geom.Rect as Rect;

import src.lib.Enum as Enum;

import shooter.models.ActorModel as ActorModel;

import src.constants.gameConstants as gameConstants;
import src.constants.enemyConstants as enemyConstants;
import src.constants.powerupConstants as powerupConstants;

import src.sounds.soundManager as soundManager;

var modes = Enum(
	'LEFT_TO_RIGHT',
	'RIGHT_TO_LEFT'
);

exports = Class(ActorModel, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				shape: new Rect(0, -10, 130, 30),
				color: 'rgba(255, 200, 0, 0.7)',
				velocity: new Point(0, 0)
			}
		);

		supr(this, 'init', [opts]);

		this._game = opts.game;
		this._pickupSpawnerModel = opts.pickupSpawnerModel;
		this._labelSpawnerModel = opts.labelSpawnerModel;
		this._bombSpawnerModel = opts.bombSpawnerModel;

		this.laserPos = 10;
	};

	this.refreshOpts = function (opts) {
		supr(this, 'refreshOpts', arguments);

		opts = this._opts;

		this._health = opts.health;
		this._mode = 1 + ((Math.random() * modes.length) | 0);
		this._bombDT = 0;
		this._level = this._game.getLevel();

		this._empDT = 0;
		this._empDone = false;

		this._laserDT = 400;

		var x;
		var y = (GC.app.baseHeight - 250) * 0.2 + (GC.app.baseHeight - 250) * 0.4 * Math.random();

		soundManager.play('radar');

		switch (this._mode) {
			case modes.LEFT_TO_RIGHT:
				x = -enemyConstants.LARGE_DISH_WIDTH;
				opts.velocity.x = this._level.largeDish.horizontalVelocity;
				break;

			case modes.RIGHT_TO_LEFT:
				x = GC.app.baseWidth + enemyConstants.LARGE_DISH_WIDTH;
				opts.velocity.x = -this._level.largeDish.horizontalVelocity;
				break;
		}

		if (opts.pos) {
			opts.pos.x = x;
			opts.pos.y = y;
		} else {
			opts.pos = new Point(x, y);
		}

		opts.visible = true;
		opts.r = 0;
	};

	this.tick = function (dt) {
		var opts = this._opts;
		var pos = opts.pos;
		var pct = dt / 1000;

		switch (this._mode) {
			case modes.LEFT_TO_RIGHT:
				if (pos.x > GC.app.baseWidth + gameConstants.LARGE_DISH_WIDTH) {
					return true;
				}
				break;

			case modes.RIGHT_TO_LEFT:
				if (pos.x < -enemyConstants.LARGE_DISH_WIDTH) {
					return true;
				}
				break;
		}

		pos.x += opts.velocity.x * pct;
		opts.dt = dt;
		opts.r = 0;
		opts.emp = false;

		if ((this._health < 0) || (this._laserDT < 0)) {
			var scoreValue = 40;
			var pos = new Point(opts.pos.x, opts.pos.y);
			this._game.createParticles(gameConstants.particleSystems.PARTICLE_BOTTOM, 'fire', pos, new Point(0, 100));
			this._game.getPlayerModel().addScore(scoreValue);

			this._labelSpawnerModel.spawnLabel(new Point(pos.x, pos.y), scoreValue, {x: 0, y: -100});
			this._pickupSpawnerModel.spawnPickup(new Point(pos.x, pos.y + 40));

			soundManager.play('explosion');

			return true;
		}

		this._bombDT -= dt;
		if ((pos.x > 0) && (pos.x < GC.app.baseWidth) && !this._empDone && (this._bombDT < 0)) {
			var level = this._game.getLevel();
			if (Math.random() < level.largeDish.parachuteChance) {
				this._pickupSpawnerModel.spawnPickup(pos, powerupConstants.pickupTypes.PICKUP_SCORE);
			} else {
				this._bombSpawnerModel.spawnBomb(pos);
			}
			this._bombDT = level.largeDish.bombInterval + Math.random() * level.largeDish.bombInterval * 0.25;
		}

		this._empDT -= dt;
		if (this._empDT > 0) {
			this._empR += dt;
			opts.r = Math.sin(this._empR * 0.03) * 0.1 * Math.sin(this._empDT / 2500 * Math.PI * 0.5);
			opts.emp = true;
		}

		this.emit('Update', opts);

		return false;
	};

	this.emp = function () {
		if (!this._empDone) {
			this._empDT = 2500;
			this._empR = Math.random();
			this._empDone = true;
		}
	};
});