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
import animate;

import ui.View as View;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;

import menus.views.TextDialogView as TextDialogView;

import shooter.views.FlashView as FlashView;
import shooter.views.WorldView as WorldView;
import shooter.particle.particleFunctions as particleFunctions;

import src.constants.menuConstants as menuConstants;
import src.constants.gameConstants as gameConstants;
import src.constants.enemyConstants as enemyConstants;
import src.constants.characterConstants as characterConstants;

import .player.PlayerView as PlayerView;

import .projectiles.ProjectileView as ProjectileView;

import .label.LabelView as LabelView;
import .label.WaveLabelView as WaveLabelView;
import .label.TargetView as TargetView;

import .enemies.EnemyView as EnemyView;
import .enemies.EnemyJumperView as EnemyJumperView;

import .animals.AnimalView as AnimalView;
import .bombs.BombView as BombView;
import .pickups.PickupView as PickupView;

import .ui.overlay.StatusView as StatusView;
import .ui.overlay.FooterView as FooterView;

import src.sounds.soundManager as soundManager;

exports = Class(WorldView, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this._loaded = false;

		this._game = opts.game;
		this._inputLayer = this._game.getInputLayer();

		this._game.on('Wave', bind(this, 'onWave'));

		this._totalTime = 0;

		this.style.visible = true;

		this._loadingImages = [
			// Add images to load here...
		];

		this.designView();
	};

	this.designView = function () {
		this._loaderView = new ImageView({
			superview: this,
			x: 0,
			y: 0,
			width: 1,
			height: 1,
			backgroundColor: '#000000'
		});
		this._loaderIndex = this._loadingImages.length;

		// The top part of the ground is alpha so we're taking 20 pixels extra to cover the full background...
		var height = GC.app.baseHeight - (gameConstants.GROUND_HEIGHT + gameConstants.FOOTER_HEIGHT) + 20;
		var width = GC.app.baseWidth;

		var radius = Math.sqrt((width * 0.5) * (width * 0.5) + height * height);

		this._background = new ImageView({
			superview: this,
			x: width * 0.5,
			y: height,
			width: radius * 2,
			height: radius * 2,
			offsetX: -radius,
			offsetY: -radius,
			anchorX: radius,
			anchorY: radius,
			image: 'resources/images/landscape/nightSky.png'
		});

		new ImageView({
			superview: this,
			x: 0,
			y: 0,
			width: GC.app.baseWidth,
			height: height,
			image: 'resources/images/landscape/treeline.png'
		});
		this._ground = new ImageView({
			superview: this,
			x: 0,
			y: GC.app.baseHeight - (gameConstants.STATUS_HEIGHT + gameConstants.GROUND_HEIGHT),
			width: GC.app.baseWidth,
			height: 250,
			image: 'resources/images/landscape/ground.png'
		});

		this._waveLabelView = new WaveLabelView({
			superview: this
		});

		var enemyLayer = this.createLayer('enemies');

		this._warningLeftView = new ImageView({
			superview: enemyLayer,
			x: 20,
			y: (GC.app.baseHeight - 100) * 0.5,
			width: 50,
			height: 100,
			visible: false,
			image: 'resources/images/enemies/warningLeft.png'
		});
		this._warningRightView = new ImageView({
			superview: enemyLayer,
			x: GC.app.baseWidth - 70,
			y: (GC.app.baseHeight - 100) * 0.5,
			width: 50,
			height: 100,
			visible: false,
			image: 'resources/images/enemies/warningRight.png'
		});

		this.addViewPool(
			gameConstants.viewPoolTypes.BEAM_POOL,
			{
				initCount: 20,
				ctor: ImageView,
				tag: 'Beams',
				initOpts: {
					superview: enemyLayer,
				}
			}
		);

		this.addViewPool(
			gameConstants.viewPoolTypes.ENEMY_POOL,
			{
				initCount: 15,
				ctor: EnemyView,
				tag: 'Enemies',
				initOpts: {
					superview: enemyLayer,
					enemyType: enemyConstants.enemyTypes.ENEMY_SMALL_DISH,
					worldView: this,
					x: -500
				}
			}
		);

		this._enemyJumperView = new EnemyJumperView({
			superview: enemyLayer
		});

		var playerLayer = this.createLayer('player');

		this.addViewPool(
			gameConstants.viewPoolTypes.ANIMAL_POOL,
			{
				initCount: 12,
				ctor: AnimalView,
				tag: 'Animals',
				initOpts: {
					superview: playerLayer,
					worldView: this
				}
			}
		);
		this._playerView = new PlayerView({
			superview: playerLayer,
			game: this._game
		});

		var particlesAndPickups = this.createLayer('particles and pickups');

		this.addViewPool(
			gameConstants.viewPoolTypes.BOMB_POOL,
			{
				initCount: 15,
				ctor: BombView,
				tag: 'Bombs',
				initOpts: {
					superview: particlesAndPickups,
					worldView: this
				}
			}
		);

		this.addViewPool(
			gameConstants.viewPoolTypes.PARACHUTE_POOL,
			{
				initCount: 40,
				ctor: ImageView,
				tag: 'Parachutes',
				initOpts: {
					superview: particlesAndPickups,
					worldView: this,
					image: 'resources/images/particles/pickup_parachute.png'
				}
			}
		);
		this.addViewPool(
			gameConstants.viewPoolTypes.PICKUP_POOL,
			{
				initCount: 40,
				ctor: PickupView,
				tag: 'Pickups',
				initOpts: {
					superview: particlesAndPickups,
					worldView: this
				}
			}
		);

		this._laserView = new ImageView({
			superview: enemyLayer,
			x: 0,
			y: 0,
			width: 40,
			height: 0,
			image: 'resources/images/player/laser.png',
			visible: false
		});
		this._playerView.setLaserView(this._laserView);

		this.addViewPool(
			gameConstants.viewPoolTypes.PROJECTILE_POOL,
			{
				initCount: 50,
				ctor: ProjectileView,
				tag: 'Projectiles',
				initOpts: {
					superview: particlesAndPickups,
					height: gameConstants.PROJECTILE_HEIGHT,
					width: gameConstants.PROJECTILE_WIDTH,
					worldView: this
				}
			}
		);

		this.addParticleSystem(
			gameConstants.particleSystems.PARTICLE_BOTTOM,
			{
				superview: particlesAndPickups,
				tag: 'Bottom particles',
				initCount: 200,
				types: {
					hit: {
						count: 1,
						duration: 200,
						radius: 100,
						size: 90,
						image: 'resources/images/particles/particle_spark_lime.png',
						stepCB: particleFunctions.linear
					},
					laserHit: {
						extnds: 'hit',
						radius: 50,
						image: 'resources/images/particles/particle_spark_orange.png'
					},
					alienDeath: {
						count: 10,
						duration: 300,
						radius: 100,
						size: 60,
						image: 'resources/images/particles/particle_spark_lime.png',
						stepCB: particleFunctions.linear
					},
					beamRed: {
						count: 1,
						duration: 200,
						radius: 60,
						size: 90,
						image: 'resources/images/particles/particle_spark_orange.png',
						initEndCB: function (start, end) {
							if (end.y > start.y) {
								end.y = start.y - (end.y - start.y);
							}
						},
						initCB: particleFunctions.groundHitInit,
						stepCB: particleFunctions.groundHit
					},
					beamBlue: {
						extnds: 'beamRed',
						image: 'resources/images/particles/particle_spark_cyan.png'
					},
					green: {
						count: 1,
						duration: 200,
						radius: 60,
						size: 40,
						image: 'resources/images/particles/particle_spark_lime.png',
						stepCB: particleFunctions.staticScale
					},
					fire: {
						count: 20,
						duration: 300,
						radius: 100,
						size: 60,
						image: 'resources/images/particles/particle_fire.png',
						stepCB: particleFunctions.linear
					},
					fireSoft: {
						count: 2,
						duration: 300,
						radius: 60,
						size: 40,
						image: 'resources/images/particles/particle_fire.png',
						stepCB: particleFunctions.linear
					},
					animal: {
						count: 20,
						duration: 300,
						radius: 80,
						size: 40,
						image: 'resources/images/particles/particle_white.png',
						stepCB: particleFunctions.linear
					},
					smoke: {
						count: 6,
						duration: 500,
						radius: 100,
						size: 60,
						image: 'resources/images/particles/particle_smoke.png',
						stepCB: particleFunctions.fixedScale
					},
				}
			}
		);

		var labels = this.createLayer('labels');
		this.addViewPool(
			gameConstants.viewPoolTypes.LABEL_POOL,
			{
				initCount: 30,
				ctor: LabelView,
				initOpts: {
					superview: labels
				}
			}
		);
		this.addViewPool(
			gameConstants.viewPoolTypes.TARGET_POOL,
			{
				initCount: 15,
				ctor: TargetView,
				initOpts: {
					superview: labels,
					width: 100,
					height: 100,
					image: 'resources/images/numbers/target.png'
				}
			}
		);

		this._flashView = new FlashView({
			superview: this
		});

		this._uiView = this.createLayer('ui', this._inputLayer);
		this._footerView = new FooterView({
			superview: this._uiView,
			game: this._game,
			blockEvents: true,
			tag: 'Footer',
			blockEvents: true
		});
	};

	this.reset = function () {
		supr(this, 'reset');

		this._statusView = this._statusView || new StatusView({
			superview: this._game.getInputLayer(),
			game: this._game,
			tag: 'Status'
		}).on('Pause', bind(this, 'onPause'));

		this._loaderView.style.visible = true;
		this._loaded = false;
		this._loaderIndex = this._loadingImages.length;

		this._statusView.reset();
		this._footerView.reset();
		this._waveLabelView.reset();

		this._footerView.show();
		this._statusView.show();
	};

	this.update = function (dt) {
		supr(this, 'update', arguments);

		var loadedDT = dt;

		this._background.style.r += dt / 1000 * 0.005;

		if (this._loaderIndex) {
			this._loaderView.setImage(this._loadingImages[--this._loaderIndex]);
			if (this._loaderIndex) {
				loadedDT = dt * 0.1;
			} else {
				this._loaderView.style.visible = true;
				this._loaded = true;
				this.emit('Loaded');
				this._countDownView.start();
			}
		}

		this._statusView && this._statusView.update();
		this._footerView.update();
		this._waveLabelView.update(dt);
		this._flashView.update(dt);

		this._totalTime += dt;
	};

	this.getPlayerView = function () {
		return this._playerView;
	};

	this.getUIView = function () {
		return this._uiView;
	};

	this.getEnemyJumperView = function () {
		return this._enemyJumperView;
	};

	this.setPaused = function (paused) {
		return paused;
	};

	this.getParticleSystem = function (id) {
		return this._particleSystem[id];
	};

	this.flash = function (color) {
		this._flashView.flash(color)
	};

	this.gameOver = function () {
		this._statusView.hide();
		this._footerView.hide();		
	};

	this.createSmokeParticle = function (pos, type) {
		var particleSystem = this._particleSystem[gameConstants.particleSystems.PARTICLE_BOTTOM];
		particleSystem.activateType(type);
		particleSystem.addOne(pos.x, pos.y);
	};

	this.onJumperWarning = function (dir) {
		this._warningLeftView.style.visible = (dir === 2);
		this._warningRightView.style.visible = (dir === 3);
	};

	this.onHideJumperWarning = function () {
		this._warningLeftView.style.visible = false;
		this._warningRightView.style.visible = false;
	};

	this.onPause = function () {
		this._game.setPaused(true);

		this._confirmDialog = (this._confirmDialog || new TextDialogView({
			superview: this._superview,
			title: 'Quit game?',
			text: 'Are you sure you\'re gonna surrender your cows to these cruel aliens?',
			height: 450,
			modal: true,
			buttons: [
				{
					title: 'No',
					width: 200,
					style: 'GREEN',
					cb: bind(this, 'onResume')
				},
				{
					title: 'Yes',
					width: 200,
					style: 'RED',
					cb: bind(this, 'onQuit')
				}
			],
			showTransitionMethod: menuConstants.transitionMethod.SCALE,
			hideTransitionMethod: menuConstants.transitionMethod.SCALE,
			closeCB: bind(this, 'onResume')
		})).show();
	};

	this.onQuit = function () {
		this._game.onQuit();
		this._footerView.hide();
		this._statusView.hide();
		this.onHideJumperWarning();
	};

	this.onResume = function () {
		this._game.setPaused(false);
	};

	this.onWave = function (wave) {
		this._waveLabelView.setWave(wave);
	};
});