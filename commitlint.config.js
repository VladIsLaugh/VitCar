module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'revert'],
    ],
    'subject-max-length': [2, 'always', 100],
    // Allow Jira prefix: "CAR-123 feat(scope): message"
    'header-max-length': [2, 'always', 120],
  },
  ignores: [(commit) => /^CAR-\d+ /.test(commit)],
};
