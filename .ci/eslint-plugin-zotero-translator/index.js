/**
 * @fileoverview Checks Zotero translators for errors and recommended style
 * @author Emiliano Heyns
 */

'use strict';

module.exports = {
	processors: {
		translator: require('./lib/processor'),
	}
};
