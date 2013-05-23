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

import src.constants.debugConstants as debugConstants;
import src.constants.gameConstants as gameConstants;
import src.constants.enemyConstants as enemyConstants;

import src.sounds.soundManager as soundManager;

var modes = Enum(
	'PAUSE',
	'LEFT_TO_RIGHT',
	'RIGHT_TO_LEFT',
	'LEFT_TO_RIGHT_GROUND',
	'RIGHT_TO_LEFT_GROUND'
);

/**
 * The model for an alien jumper, handles behaviour jumping and pausing between jumps.
 */
exports = Class(ActorModel, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				shape: new Rect(0, -enemyConstants.JUMPER_HEIGHT * 0.5, enemyConstants.JUMPER_WIDTH * 0.5, enemyConstants.JUMPER_HEIGHT),
				color: 'rgba(255, 0, 200, 0.7)',
				velocity: new Point(0, 0),
				pos: new Point(0, 0)
			}
		);

		supr(this, 'init', [opts]);

		this._game = opts.game;
		this._pause();
	};

	this.reset = function () {
		this._count = (gameConstants.WAVE_DURATION / 6000) | 0;
		this._mode = modes.PAUSE;
		this._warningDone = false;
		this._pauseDT = 10000 + Math.random() * 3000;

		this._posYLast = 0;
		this._groundDT = 0;

		this.emit('Reset');
	};

	this._pause = function () {
		var interval = this._game.getLevel().jumper.interval;

		this._count--;
		this._mode = modes.PAUSE;
		this._warningDone = false;
		this._pauseDT = interval + Math.random() * interval;

		this.emit('Pause');
	};

	/**
	 * Setup everything for a new jump sequence.
	 */
	this.startJumping = function () {
		var opts = this._opts;

		this._mode = this._nextMode;
		this._level = this._game.getLevel();
		this._ground = GC.app.baseHeight - (gameConstants.STATUS_HEIGHT + gameConstants.GROUND_HEIGHT) + 25;
		this._jumpDT = 0;
		this._doneSound = false;

		var x;
		var y = this._ground;

		// Set the position and velocity based on the selected direction:
		switch (this._mode) {
			case modes.LEFT_TO_RIGHT:
				x = -enemyConstants.JUMPER_WIDTH;
				opts.velocity.x = this._level.jumper.horizontalVelocity;
				this.emit('Left');
				break;

			case modes.RIGHT_TO_LEFT:
				x = GC.app.baseWidth + enemyConstants.JUMPER_WIDTH;
				opts.velocity.x = -this._level.jumper.horizontalVelocity;
				this.emit('Right');
				break;
		}

		// Check if there's a pos, if not then create one else set the values...
		if (opts.pos) {
			opts.pos.x = x;
			opts.pos.y = y;
		} else {
			opts.pos = new Point(x, y);
		}

		opts.visible = true;

		this.emit('Start');
	};

	this._move = function (dt) {
		var result = false;
		var opts = this._opts;
		var pos = opts.pos;
		var pct = dt / 1000;

		this._jumpDT += dt;

		opts.dt = dt;
		opts.sin = Math.abs(Math.sin(this._jumpDT * 0.003));
		pos.x += opts.velocity.x * pct;
		pos.y = this._ground - opts.sin * GC.app.baseHeight * 0.3;

		// If the new y position is larger then the last then the jumper is going down...
		if (pos.y > this._posYLast) {
			this._doneSound = false;
		} else if (!this._doneSound && (pos.y < this._posYLast)) { // y is smaller, jumper is going up...
			// Ground is reached, return true...
			pos.y = this._ground;
			soundManager.play('jumper');
			this._doneSound = true;
			this._groundDT = 625;
			result = true;
		}

		this._posYLast = pos.y;

		return result;
	};

	/**
	 * Select a time to start jumping when a new wave starts.
	 * The number of times a jumper appears depends on the duration of the wave.
	 */
	this.newWave = function () {
		var interval = this._game.getLevel().jumper.interval;

		this._count = (gameConstants.WAVE_DURATION / (interval * 2)) | 0;
		this._pauseDT = interval + Math.random() * interval;
	};

	/**
	 * This function is called every tick.
	 */
	this.tick = function (dt) {
		if (debugConstants.noJumper || (this._count < 0)) {
			return;
		}

		var opts = this._opts;
		var pos = opts.pos;
		var emit = true;

		this._groundDT -= dt;

		opts.touchdown = false;
		opts.fly = (this._groundDT < 0);

		switch (this._mode) {
			case modes.PAUSE:
				// The jumper moves away when the menu is active after a game is played
				// but it will not appear again if the menu is active...
				if (!this._game.getMenu()) {
					this._pauseDT -= dt;
					if (!this._warningDone && (this._pauseDT < 1000)) {
						this._warningDone = true;
						this._nextMode = 2 + ((Math.random() * 2) | 0);
						// Emit warning signal with the direction to show an warning indicator view...
						this.emit('Warning', this._nextMode);
						soundManager.play('jumper');
					}
					if (this._pauseDT < 0) { // Hide the warning when the pause is finished...
						this.emit('HideWarning');
						this.startJumping();
					}
				}
				emit = false;
				break;

			case modes.LEFT_TO_RIGHT:
				// If out of view then pause...
				if (pos.x > GC.app.baseWidth + enemyConstants.LARGE_DISH_WIDTH) {
					this._pause();
				} else if (this._move(dt)) { // If landed then pause for 300 milli seconds and return to jumping...
					this._mode = modes.LEFT_TO_RIGHT_GROUND;
					opts.touchdown = true;
				}
				break;

			case modes.LEFT_TO_RIGHT_GROUND: // Wait for a while and return to jumping...
				if (this._groundDT < 300) {
					this._mode = modes.LEFT_TO_RIGHT;
				}
				break;

			case modes.RIGHT_TO_LEFT:
				// If out of view then pause...
				if (pos.x < -enemyConstants.LARGE_DISH_WIDTH) {
					this._pause();
				} else if (this._move(dt)) {
					this._mode = modes.RIGHT_TO_LEFT_GROUND;
					opts.touchdown = true;
				}
				break;

			case modes.RIGHT_TO_LEFT_GROUND: // Wait for a while and return to jumping...
				if (this._groundDT < 300) {
					this._mode = modes.RIGHT_TO_LEFT;
				}
				break;
		}

		// The update event is fired when the jumper is not paused.
		emit && this.emit('Update', opts);
	};
});

exports.modes = modes;