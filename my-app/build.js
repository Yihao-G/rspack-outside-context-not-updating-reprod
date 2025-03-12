const { rspack } = require('@rspack/core');
const path = require('path');
const fs = require('fs');

const rs = rspack({
  mode: 'development',
  cache: true,
  entry: {
    main: [path.resolve('./src/index.js')],
  },
  context: path.resolve(__dirname),
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
      'another-app': path.resolve('../another-app/index.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: "ecmascript",
                  jsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic'
                  }
                },
              }
            }
          }
        ]
      }
    ]
  },
})

const filePath = path.resolve('../another-app/index.js');
const modifiedContent = `
import React from 'react';

export function App() {
    return <div>Hello World</div>;
}

export default App;
`;
fs.writeFileSync(filePath, modifiedContent, 'utf8');

rs.run((err, stats) => {
  if (err || stats.hasErrors()) {
    console.error('First run failed:', err || stats.toJson().errors);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const modifiedContent = content.replace('Hello World', 'Updated content');
  fs.writeFileSync(filePath, modifiedContent, 'utf8');


  rs.run((e, r) => {
    if (e) {
      console.error('Second run failed:', e);
    } else {
      console.log('Second run succeeded');
    }
  });
});


