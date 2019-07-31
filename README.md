# remark-fenced-code-props

A remark plugin for transforming the "metastring" of fenced code blocks as JSX props, as in:

````markdown
```jsx live style={{border: '1px solid red'}}
<Box>this will get a solid red border when rendered in MDX</Box>
```
````

which parses into:

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
