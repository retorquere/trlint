'use strict';

const espree = require('espree');
const path = require('path');

module.exports = {
	preprocess: function (text, filename) {
    console.log('pre', filename)
		if (text[0] !== '{') return [{ text, filename }]

		// detect header
   	const prefix = `const ZoteroTranslator${Date.now()} = `;
    const decorated = `${prefix}${text}`
   	const ast = espree.parse(decorated, { ecmaVersion: 2015 });
   	if (ast.body[0]?.declarations[0]?.init?.type !== 'ObjectExpression') throw new Error('No header in translator')
    const headerLength = ast.body[0].end - prefix.length;

		const re = new RegExp(`^([\\s\\S]{${headerLength}}[ \r\n]*)([\\s\\S]+?)(/[*][*] BEGIN TEST CASES [*][*]/[\\s\\S]*)?$`, 'i')
		const [ , header, body, testcases ] = text.match(re)

    try {
      JSON.parse(header)
    }
    catch (err) {
      // throw new Error(`header is not valid JSON: ${err.message}`)
    }

		const chunks = [
			{ text: `(${header})`, filename: 'header.js' },
			{ text: body, filename: 'body.js' },
		]

		if (testcases) {
      let cases = ast.body
        .filter((node, i) => i === ast.body.length - 1)
        .filter(node => node.type === 'VariableDeclaration' && node.declarations.length === 1).map(node => node.declarations[0])
        .filter(node => node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && node.id.name === 'testCases')
        .map(node => node.init)[0]
      if (!cases) throw new Error('test cases must start with "var testCases = [..."')

      try {
        JSON.parse(decorated.substring(cases.start, cases.end))
      }
      catch (err) {
        // throw new Error(`testcases are not valid JSON: ${err.message}`)
      }

			chunks.push({ text: testcases, filename: 'tests.js', start: header.length + body.length })
		}

		return chunks
	},

	postprocess: function (messages, filename) {
		messages = [].concat(...messages)

    switch (path.basename(filename)) {
      case '0_header.js':
        messages = messages.filter(msg => !['semi', 'eol-last', 'no-unused-expressions', 'quote-props'].includes(msg.ruleId))
        break
      case '2_tests.js':
        messages = messages.filter(msg => !['lines-around-comment', 'no-unused-vars', 'quote-props', 'semi'].includes(msg.ruleId))
        break
    }

    console.log('post', filename, messages.slice(0, 3))

    return messages
	},
};
