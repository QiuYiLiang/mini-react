const { rollup } = require("rollup");
const fs = require("fs");
const { resolve } = require("path");

const typescript = require("rollup-plugin-typescript2");
const commonjs = require("@rollup/plugin-commonjs");
const nodeResolve = require("@rollup/plugin-node-resolve");
const json = require("@rollup/plugin-json");
const replace = require("@rollup/plugin-replace");
const terser = require("@rollup/plugin-terser");
const nodeBuiltins = require("rollup-plugin-node-builtins");
const nodeGlobals = require("rollup-plugin-node-globals");
const polyfillNode = require("rollup-plugin-polyfill-node");

const args = require("minimist")(process.argv.slice(2));

const config = require(resolve(__dirname, "buildConfig.json"));

const targets =
  args._.length > 0
    ? args._
    : config.targets.length > 0
    ? config.targets
    : fs.readdirSync("packages").filter((f) => {
        if (!fs.statSync(`packages/${f}`).isDirectory()) {
          return false;
        }
        const pkg = require(`../packages/${f}/package.json`);
        if (pkg.private && !pkg.buildOptions) {
          return false;
        }
        return true;
      });

const formats = args.f?.split(",") || [];

buildAll(targets);

async function buildAll(targets) {
  await runParallel(require("os").cpus().length, targets, build);
}

async function runParallel(maxConcurrency, source, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item, source));
    ret.push(p);

    if (maxConcurrency <= source.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

async function build(target) {
  const packageDir = resolve(__dirname, `../packages/${target}`);

  const pkg = require(resolve(packageDir, `./package.json`));
  const buildOptions = pkg.buildOptions;

  const inputOptions = {
    input: resolve(packageDir, `./src/index.ts`),
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
          },
          include: [resolve(packageDir, `./src`)],
        },
      }),
      commonjs(),
      nodeResolve(),
      json(),
      replace({ preventAssignment: true }),
      nodeBuiltins(),
      nodeGlobals(),
      polyfillNode(),
      terser(),
    ],
    external: Array.from(
      new Set([...(config.external || []), ...(buildOptions.external || [])])
    ),
  };

  const outputOptionsList = (
    formats.length === 0 ? buildOptions.formats || [] : formats
  ).map((format) => ({
    dir: resolve(packageDir, `./dist`),
    name: buildOptions.name,
    entryFileNames: `${target}.${format}.js`,
    format,
    sourcemap: true,
    globals: { ...(config.globals || {}), ...(buildOptions.globals || {}) },
  }));

  let bundle;
  try {
    bundle = await rollup(inputOptions);

    await generateOutputs(bundle, pkg.name, outputOptionsList);
  } catch (error) {
    console.error(error);
  }
  if (bundle) {
    await bundle.close();
  }
}

async function generateOutputs(bundle, pkgName, outputOptionsList) {
  for (const outputOptions of outputOptionsList) {
    await bundle.write(outputOptions);
    console.info(`${pkgName} ${outputOptions.format} Bundled!`);
  }
}
