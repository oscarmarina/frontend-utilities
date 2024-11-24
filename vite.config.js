import {defineConfig} from 'vite';
import {resolve} from 'path';
import externalizeSourceDependencies from '@blockquote/rollup-plugin-externalize-source-dependencies';

const outDir = process.env.OUTDIR || '.';

/**
 * https://vitejs.dev/config/
 * https://vite-rollup-plugins.patak.dev/
 */

export default defineConfig({
  test: {
    onConsoleLog(log, type) {
      if (log.includes('in dev mode')) {
        return false;
      }
    },
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'v8',
      reportsDirectory: `${outDir}/test/coverage/`,
      reporter: ['lcov', 'text-summary'],
      enabled: true,
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      include: ['**/src/**/*'],
      exclude: ['**/src/**/index.*', '**/src/styles/'],
    },
    browser: {
      enabled: true,
      headless: true,
      name: 'chromium',
      provider: 'playwright',
      viewport: {width: 1920, height: 1080},
      providerOptions: {
        launch: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        },
      },
    },
  },
  plugins: [
    externalizeSourceDependencies([
      /* @web/test-runner-commands needs to establish a web-socket
       * connection. It expects a file to be served from the
       * @web/dev-server. So it should be ignored by Vite */
      '/__web-dev-server__web-socket.js',
    ]),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.js'),
      },
      // fileName: (format, entryAlias) => `${entryAlias}-${format}.js`,
      formats: ['es'],
    },
  },
});
