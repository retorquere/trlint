'use strict';

const espree = require('espree');

module.exports = {
	preprocess: function (text, filename) {
    console.log('pre', filename)

		if (text[0] !== '{') return text

		// detect header
   	const prefix = `const ZoteroTranslator${Date.now()} = `;
   	let ast = espree.parse(`${prefix}${text}`, { ecmaVersion: 2015 });
   	if (ast.body[0]?.declarations[0]?.init?.type !== 'ObjectExpression') throw new Error('No header in translator')
    const headerLength = ast.body[0].end - prefix.length;

		const re = new RegExp(`^([\\s\\S]{${headerLength}}[ \r\n]*)([\\s\\S]+?)(/[*][*] BEGIN TEST CASES [*][*]/[\\s\\S]*)?$`, 'i')
		const [ , header, body, testcases ] = text.match(re)

		const chunks = [
			{ text: `(${header})`, filename: 'header.js', start: 0 },
			{ text: body, filename: 'body.js', start: header.length },
		]

		if (testcases) {
			chunks.push({ text: testcases, filename: 'tests.js', start: header.length + body.length })
		}

		return chunks
	},

	postprocess: function (messages, filename) {
		console.log('post', filename, messages.map(l => l.slice(0, 3)))
		return [].concat(...messages)
	},
};
