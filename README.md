# remark-fenced-props

A remark plugin for transforming the "metastring" of fenced code blocks as JSX props, as in:

````markdown
```jsx live style={{border: '1px solid red'}}
<Box>this will get a solid red border when rendered in MDX</Box>
```
````

:warning: **This is really just a proof of concept, and can only be used in Node because it uses `vm` to execute the expressions in a sandbox.**


The above example parses into the JSON below, with the `code` node's `props` attribute set to the parsed values:

```diff
{
  "type": "root",
  "children": [
    {
      "type": "code",
      "lang": "jsx",
      "meta": "live minHeight={100} style={{border: '1px solid red'}}",
      "value": "<Box>hello, world</Box>",
      "position": {
        "start": {
          "line": 1,
          "column": 1,
          "offset": 0
        },
        "end": {
          "line": 3,
          "column": 4,
          "offset": 89
        },
        "indent": [
          1,
          1
        ]
      },
+     "props": {
+       "live": true,
+       "style": {
+         "border": "1px solid red"
+       }
      }
    }
  ],
  "position": {
    "start": {
      "line": 1,
      "column": 1,
      "offset": 0
    },
    "end": {
      "line": 4,
      "column": 1,
      "offset": 90
    }
  }
}
```

