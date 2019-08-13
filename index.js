const visit = require('unist-util-visit')
const {parse} = require('@babel/parser')
const traverse = require('@babel/traverse').default

const RAW_ATTR_REGEX = /([\w_]*)\=(?![\"\{])(\w+)/;

module.exports = function remarkFencedProps({ verbose } = {}) {
  return tree => {
    visit(tree, 'code', (node) => {
      if (node.meta) {
        const meta = preprocessMeta(node.meta);
        try {
          const ast = parse(`<code ${meta} />`, {
            sourceType: 'script',
            plugins: ['jsx']
          });

          const props = {}
          traverse(ast, {
            JSXAttribute(path) {
              const {node: {name: {name}, value}} = path
              // Boolean Attribute
              if (value === null) {
                props[name] = true
                return
              }

              const evaluatedValue = parseAttributeValue(value, path.node);
              if (evaluatedValue !== undefined) {
                props[name] = evaluatedValue;
              }
            }
          })
          node.props = props
        } catch (e) {
          if (verbose) {
            console.warn('Failed to parse meta string:', e);
          }
          return;
        }
      }
    })
  }
}

/**
 * Preprocess meta string to allow some cases that JSX forbids
 * @param {string} meta 
 */
function preprocessMeta(meta) {
  return meta.replace(RAW_ATTR_REGEX, (_, key, value) => {
    let newValue;
    if (/^\d+$/.test(value)) {
      newValue = `{${value}}`;
    } else {
      newValue = `"${value}"`;
    }
    return `${key}=${newValue}`;
  });
}

/**
 * Translates an fenced block meta attribute value into it's corresponding
 * js value.
 * @param {import('@babel/types').JSXAttribute["value"]} nodeValue 
 */
function parseAttributeValue(nodeValue) {
  switch (nodeValue.type) {
    case "StringLiteral":
      return nodeValue.value;
    case "JSXExpressionContainer":
      return translateExpressionOrValue(nodeValue.expression);
    default:
      return undefined;
  }
}

/**
 * Translates a meta attribute expression into it's corresponding js value.
 * @param {import('@babel/types').JSXExpressionContainer["expression"] | import('@babel/types').ObjectProperty["value"]} expression 
 */
function translateExpressionOrValue(expression) {
  switch (expression.type) {
    case "StringLiteral":
    case "NumericLiteral":
      return expression.value;
    case "NullLiteral":
      return null;
    case "ObjectExpression":
      return parseObjectExpression(expression);
    // Everything else we don't support.
    // This is mostly things like functions and other, non-static props
    // that could have undefined behavior at runtime.
    default:
      return undefined;
  }
}

/**
 * Turns an Object Expression into it's static counterpart.
 * @param {import('@babel/types').ObjectExpression} expression 
 */
function parseObjectExpression(expression) {
  const obj = {};
  for (const property of expression.properties) {
    switch (property.type) {
      case "ObjectProperty":
        if (property.computed === true || property.shorthand === true) {
          break;
        }
        const key = getObjectPropertyKey(property);
        if (key === undefined) {
          break;
        }
        obj[key] = translateExpressionOrValue(property.value);
      // No support for spread props or method.
      default: 
        break;
    }
  }
  return obj;
}

/**
 * Allow a static subset of object keys.
 * @param {import('@babel/types').ObjectProperty} property 
 */
function getObjectPropertyKey({ key }) {
  if (!key || !key.type) {
    return undefined;
  }
  switch (key.type) {
    case "StringLiteral":
      return key.value;
    case "Identifier":
      return key.name;
  } 

}