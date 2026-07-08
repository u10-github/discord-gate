module.exports = {
  forbidden: [
    {
      name: 'core-no-extensions-or-app',
      comment: 'src/core must not depend on src/extensions or src/app',
      severity: 'error',
      from: { path: '^src/core' },
      to: { path: '^src/(extensions|app)' },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
};
