import esbuild from 'esbuild';
import process from 'process';
import builtins from 'builtin-modules';
import importGlobPlugin from 'esbuild-plugin-import-glob';
import {replace} from 'esbuild-plugin-replace';

const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const dummyMocksForDocs = `
document = {
  createElement: function() {},
};
`;

const prod = (process.argv[2] === 'production');

esbuild.build({
  banner: {
    js: banner,
  },
  entryPoints: ['src/main.ts'],
  plugins: [
    importGlobPlugin.default(),
  ],
  bundle: true,
  external: [
    'obsidian',
    ...builtins],
  format: 'cjs',
  watch: !prod,
  target: 'es2018',
  sourcemap: prod ? false : 'inline',
  minify: prod,
  treeShaking: true,
  outfile: 'main.js',
}).catch(() => process.exit(1));

esbuild.build({
  banner: {
    js: banner + dummyMocksForDocs,
  },
  entryPoints: ['src/docs.ts'],
  plugins: [
    importGlobPlugin.default(),
    replace({
      values: {
        // update usage of moment from obsidian to the node implementation of moment we have
        'import {moment} from \'obsidian\';': 'import moment from \'moment\';',
        // remove the use of obsidian in the options to allow for docs.js to run
        'import {Setting} from \'obsidian\';': '',
      },
      delimiters: ['', ''],
    }),
  ],
  bundle: true,
  external: [
    ...builtins],
  format: 'cjs',
  watch: !prod,
  target: 'es2018',
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  outfile: 'docs.js',
}).catch(() => process.exit(1));
