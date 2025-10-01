import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
  // ESM build (modern browsers, tree-shaking)
  {
    input: 'src/lib/MuseDevice.js',
    output: [
      {
        file: 'dist/web-muse.esm.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/web-muse.esm.min.js',
        format: 'es',
        sourcemap: true,
        plugins: [terser()]
      }
    ],
    plugins: [
      nodeResolve(),
      commonjs()
    ],
    external: [] // Bundle everything for ESM
  },

  // CommonJS build (Node.js, older bundlers)
  {
    input: 'src/lib/MuseDevice.js',
    output: [
      {
        file: 'dist/web-muse.cjs.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/web-muse.cjs.min.js',
        format: 'cjs',
        sourcemap: true,
        plugins: [terser()]
      }
    ],
    plugins: [
      nodeResolve(),
      commonjs()
    ],
    external: [] // Bundle everything for CommonJS too
  }
];
