const visit = require('unist-util-visit')
const {parse} = require('@babel/parser')
const stringify = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const vm = require('vm')

module.exports = function remarkFencedProps(options) {
  return tree => {
    visit(tree, 'code', (node, parent, index) => {
      if (node.meta) {
        const ast = parse(`<code ${node.meta} />`, {
          sourceType: 'script',
          plugins: ['jsx']
        })

        const props = {}
        traverse(ast, {
          JSXAttribute(path) {
            const {node: {name: {name}, value}} = path
            if (value && value.expression) {
              const {code} = stringify(value.expression)
              props[name] = evaluate(code)
            } else {
              props[name] = true
            }
          }
        })
        node.props = props
      }
    })
  }
}

function evaluate(expression) {
  const sandbox = {result: undefined}
  vm.runInNewContext(`result = (${expression})`, sandbox)
  return sandbox.result
}
