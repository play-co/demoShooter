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
import animate;
import event.Emitter as Emitter;

import shooter.Game as Game;

import src.constants.debugConstants as debugConstants;
import src.constants.gameConstants as gameConstants;

import src.models.spawner.LabelSpawnerModel as LabelSpawnerModel;
import src.models.spawner.ProjectileSpawnerModel as ProjectileSpawnerModel;
import src.models.spawner.EnemySpawnerModel as EnemySpawnerModel;
import src.models.spawner.AnimalSpawnerModel as AnimalSpawnerModel;
import src.models.spawner.BombSpawnerModel as BombSpawnerModel;
import src.models.spawner.PickupSpawnerModel as PickupSpawnerModel;
import src.models.spawner.TargetSpawnerModel as TargetSpawnerModel;

import src.models.player.PlayerModel as PlayerModel;

import src.models.enemies.EnemyJumperModel as EnemyJumperModel;

import src.views.WorldView as WorldView;

import src.sounds.soundManager as soundManager;

exports = Class(Game, function (supr) {
	this.init = function (opts) {
		opts.game = this;
		opts.worldView = new WorldView(opts);

		supr(this, 'init', [opts]);

		this._resetLevel();

		this._labelSpawnerModel = this.addItemSpawner(new LabelSpawnerModel({defaultOpts: {game: this}}));
		this._targetSpawnerModel = this.addItemSpawner(new TargetSpawnerModel({defaultOpts: {game: this}}));

		this._projectileSpawnerModel = this.addItemSpawner(new ProjectileSpawnerModel({
			game: this,
			defaultOpts: {
				game: this,
				targetSpawnerModel: this._targetSpawnerModel
			}
		}));

		this._bombSpawnerModel = this.addItemSpawner(
			new BombSpawnerModel({game: this, defaultOpts: {game: this}}),
			gameConstants.viewPoolTypes.BOMB_POOL
		);
		this._animalSpawnerModel = this.addItemSpawner(
			new AnimalSpawnerModel({game: this, defaultOpts: {game: this}}),
			gameConstants.viewPoolTypes.ANIMAL_POOL
		);

		this._pickupSpawnerModel = this.addItemSpawner(
			new PickupSpawnerModel({
				game: this,
				defaultOpts: {
					game: this,
					labelSpawnerModel: this._labelSpawnerModel,
					animalSpawnerModel: this._animalSpawnerModel
				}
			}),
			gameConstants.viewPoolTypes.PICKUP_POOL
		);

		this._enemyJumperModel = new EnemyJumperModel({game: this});
		var enemyJumperView = this._worldView.getEnemyJumperView();
		this._enemyJumperModel.
			on('Update', bind(enemyJumperView, 'onUpdate')).
			on('Reset', bind(enemyJumperView, 'onReset')).
			on('Warning', bind(this._worldView, 'onJumperWarning')).
			on('HideWarning', bind(this._worldView, 'onHideJumperWarning'));

		this._enemySpawnerModel = this.addItemSpawner(
			new EnemySpawnerModel({
				game: this,
				defaultOpts: {
					game: this,
					pickupSpawnerModel: this._pickupSpawnerModel,
					labelSpawnerModel: this._labelSpawnerModel,
					bombSpawnerModel: this._bombSpawnerModel
				}
			}),
			gameConstants.viewPoolTypes.ENEMY_POOL
		);

		var playerModel = new PlayerModel({
			game: this,
			projectileSpawnerModel: this._projectileSpawnerModel,
			enemySpawnerModel: this._enemySpawnerModel,
			labelSpawnerModel: this._labelSpawnerModel,
			enemyJumperModel: this._enemyJumperModel,
			pickupSpawnerModel: this._pickupSpawnerModel,
			bombSpawnerModel: this._bombSpawnerModel
		});
		this._playerModel = playerModel;

		this._inputLayer.
			on('Move', bind(playerModel, 'onInput')).
			on('InputSelect', bind(playerModel, 'onInputRelease')).
			on('Click', bind(playerModel, 'onClick')).
			on('DragUp', bind(playerModel, 'onDragUp')).
			on('DragDown', bind(playerModel, 'onDragDown'));

		var playerView = this._worldView.getPlayerView();
		this._playerModel.
			on('Update', bind(playerView, 'onUpdate')).
			on('Changed', bind(this._worldView, 'onUpdateStatus')).
			on('Dead', bind(playerView, 'onDead')).
			on('GameOver', bind(this, 'onGameOver')).
			on('GameOver', bind(playerView, 'onGameOver')).
			on('Reset', bind(playerView, 'onReset'));

		this._labelDT = 500;
		this._labelIndex = 0;
		this._particleDT = 250;

		this._menu = true;
		this._gameOver = false;

		this._resetMenu();
	};

	this._resetMenu = function () {
		// Spawn a bunch of cows to start with...
		this._animalSpawnerModel.reset({});		
		this._menu = true;
		this.emit('MainMenu');
	};

	this._resetLevel = function () {
		this._level = {
			wave: 1,
			waveDT: gameConstants.WAVE_DURATION,
			largeDishChance: 0,
			killerDishChance: 0.3,
			smallDish: {
				horizontalVelocity: 0,
				verticalVelocity: 80
			},
			largeDish: {
				horizontalVelocity: 150,
				parachuteChance: 1,
				bombInterval: 1100
			},
			bombVelocity: 200,
			jumper: {
				horizontalVelocity: 150,
				interval: 3000
			},
			spawnInterval: 3000
		};
	};

	this.reset = function (equipItems) {
		supr(this, 'reset', arguments);

		this._labelSpawnerModel.reset();
		this._projectileSpawnerModel.reset();
		this._enemySpawnerModel.reset();

		this._started = false;

		this._playerModel.reset(equipItems);

		this._startTime = Date.now();

		soundManager.playGameBackground();

		this._resetLevel();
	};

	this._updateWave = function (dt) {
		var level = this._level;

		level.waveDT -= dt;
		if (level.waveDT > 0) {
			return;
		}
		level.wave++;
		level.waveDT = gameConstants.WAVE_DURATION;

		level.largeDishChance = 0.07;
		level.killerDishChance = Math.min(0.5, 0.3 + level.wave * 0.04);

		level.smallDish.horizontalVelocity = 30 + level.wave * 15;
		level.smallDish.verticalVelocity = 80 + level.wave * 10;

		level.largeDish.parachuteChance = Math.max(1 - level.wave * 0.1, 0);
		level.largeDish.horizontalVelocity = Math.max(150 - level.wave * 3, 50);
		level.largeDish.bombInterval = Math.max(1100 - level.wave * 100, 600);

		level.spawnInterval = Math.max(3000 - level.wave * 300, 1000);

		level.jumper.interval = Math.max(3000 - level.wave * 400, 2000);

		this._enemyJumperModel.newWave();

		this.emit('Wave', level.wave);

		soundManager.play('landing');
	};

	this.tick = function (dt) {
		if (!this._paused || this._menu) {
			this._labelSpawnerModel.tick(dt);
			this._targetSpawnerModel.tick(dt);
			this._projectileSpawnerModel.tick(dt);
			this._enemySpawnerModel.tick(dt);
			this._bombSpawnerModel.tick(dt);
			this._pickupSpawnerModel.tick(dt);
			this._enemyJumperModel.tick(dt);
			this._animalSpawnerModel.tick(dt);
		}

		if (!this._menu && !this._paused) {
			this._updateWave(dt);
			this._playerModel.tick(dt);
		}

		this._worldView.update(dt);
		soundManager.update(dt);
	};

	this.getLevel = function () {
		return this._level;
	};

	this.getGameOver = function () {
		return this._gameOver;
	};

	this.getStarted = function () {
		return this._started;
	};

	this.getPlayerModel = function () {
		return this._playerModel;
	};

	this.getEnemySpawnerModel = function () {
		return this._enemySpawnerModel;
	};

	this.getAnimalCount = function () {
		return this._animalSpawnerModel.length;
	};

	this.getWave = function () {
		return this._level.wave;
	};

	this.setMenu = function (menu) {
		this._menu = menu;
	};

	this.getMenu = function () {
		return this._menu;
	};

	this.onLaunchMainMenu = function () {
		this.emit('MainMenu');
		this._paused = true;
	};

	this.onLaunchGame = function (evt) {
		this._paused = false;
		this._gameOver = false;

		this.reset(evt && evt.equipItems);

		soundManager.play('landing');
	};

	this.onGameOver = function () {
		soundManager.stopAllSounds();

		this._gameOver = true;
		this.paused = true;
		this._worldView.gameOver();

		setTimeout(bind(this, 'onQuit'), 3000);
	};

	this.onQuit = function () {
		this._paused = true;

		soundManager.stopAllSounds();
		this.emit('Quit');
		this._enemySpawnerModel.killAll();
		this._resetMenu();
	};

	this.flash = function (color) {
		this._worldView.flash(color);
	};

	this.emp = function () {
		var modelPools = this._modelPools;
		var poolTypes = [gameConstants.viewPoolTypes.ENEMY_POOL, gameConstants.viewPoolTypes.BOMB_POOL];
		var i = poolTypes.length;

		while (i) {
			var modelPool = modelPools[poolTypes[--i]];
			var items = modelPool.getItems();
			var j = modelPool.length;
			while (j) {
				var item = items[--j];
				item.emp && item.emp();
			}
		}

		var modelPool = modelPools[gameConstants.viewPoolTypes.ANIMAL_POOL];
		var items = modelPool.getItems();
		var i = modelPool.length;
		while (i) {
			items[--i].drop();
		}
	};
});