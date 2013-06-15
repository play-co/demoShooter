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
import src.lib.Enum as Enum;

exports.pickupTypes = Enum(
	'PICKUP_SCORE',
	'PICKUP_EXTRA_LIFE',
	'PICKUP_RAPID_FIRE',
	'PICKUP_SHIELD',
	'PICKUP_EMP',
	'PICKUP_GUIDED',
	'PICKUP_LASER',
	'PICKUP_ANIMAL_SHIELD'
);

exports.chances = [
	{
		chance: 0.5,
		type: exports.pickupTypes.PICKUP_SCORE
	},
	{
		chance: 0.01,
		type: exports.pickupTypes.PICKUP_EXTRA_LIFE
	},
	{
		chance: 0.18,
		type: exports.pickupTypes.PICKUP_RAPID_FIRE
	},
	{
		chance: 0.05,
		type: exports.pickupTypes.PICKUP_SHIELD
	},
	{
		chance: 0.05,
		type: exports.pickupTypes.PICKUP_EMP
	},
	{
		chance: 0.1,
		type: exports.pickupTypes.PICKUP_GUIDED
	},
	{
		chance: 0.01,
		type: exports.pickupTypes.PICKUP_LASER
	},
	{
		chance: 0.1,
		type: exports.pickupTypes.PICKUP_ANIMAL_SHIELD
	}
];

exports.chancesRapidFire = [
	{
		chance: 0.68,
		type: exports.pickupTypes.PICKUP_SCORE
	},
	{
		chance: 0.01,
		type: exports.pickupTypes.PICKUP_EXTRA_LIFE
	},
	{
		chance: 0.05,
		type: exports.pickupTypes.PICKUP_SHIELD
	},
	{
		chance: 0.05,
		type: exports.pickupTypes.PICKUP_EMP
	},
	{
		chance: 0.1,
		type: exports.pickupTypes.PICKUP_GUIDED
	},
	{
		chance: 0.01,
		type: exports.pickupTypes.PICKUP_LASER
	},
	{
		chance: 0.1,
		type: exports.pickupTypes.PICKUP_ANIMAL_SHIELD
	}
];

(function (chanceList) {
	var i = chanceList.length;
	while (i) {
		var sum = exports[chanceList[--i]].reduce(function (a, b) { return a + b.chance; }, 0);
		if ((sum < 0.9999999) || (sum > 1.00001)) {
			console.error('Error in sum of chance values for "' + chanceList[i] + '", sum = ', sum);
		}
	}
})(['chances', 'chancesRapidFire']);