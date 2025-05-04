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
      if (type === 'stderr' && log.includes('in dev mode')) {
        return false;
      }
    },
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      screenshotFailures: false,
      viewport: {width: 1920, height: 1080},
      instances: [
        {
          browser: 'chromium',
          launch: {
            devtools: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
          },
          context: {},
        },
        {
          browser: 'webkit',
          launch: {},
          context: {},
        },
      ],
    },
    coverage: {
      provider: 'istanbul',
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
