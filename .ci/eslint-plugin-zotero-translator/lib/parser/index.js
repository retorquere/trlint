var espree = require("espree");
const walker = require('walkes')

function parseForESLint(code, options) {
  // detect header
  const prefix = `const ZoteroTranslator${Date.now()} = `;
  const decorated = `${prefix}${code}`
  let ast = espree.parse(decorated, { ecmaVersion: 2015 });
  if (ast.body[0]?.declarations[0]?.init?.type !== 'ObjectExpression') throw new Error('No header in translator')
  const headerLength = ast.body[0].end - prefix.length;

  const re = new RegExp(`^([\\s\\S]{${headerLength}}[ \r\n]*)([\\s\\S]+?)(/[*][*] BEGIN TEST CASES [*][*]/[\\s\\S]*)?$`, 'i')
  const [ , header, body, testcases ] = code.match(re)

  ast = {
    header: espree.parse(`(${header});`, options),
    body: espree.parse(body, options),
    tests: espree.parse(testcases || '', options),
  }

  /*
  ast.header.body = [ ast.header.body[0].expression ]
  ast.header.tokens = ast.header.tokens.slice(1, -2);
  walker(ast.header, {
    default (node, recurse) {
      if (node.start) node.range[0] = node.start = node.start - 1
      if (node.end) node.range[1] = node.end = node.send - 1

      if (node.loc) {
        for (const loc of [node.loc.start, node.loc.end]) {
          if (!loc.fixed) {
            loc.fixed = true
            if (loc.line === 1) loc.column--
          }
        }
      }
    }
  })

  */
  console.log(ast.header.body.map(node => node.range))

  return {
    ast: ast.header,
    services: {
      foo: function() {
        console.log("foo");
      }
    },
    scopeManager: null,
    visitorKeys: null
  };
};

module.exports = { parseForESLint };
