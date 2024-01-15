module.exports = grammar({
  name: 'bismuth',
  extras: $ => [/[ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/],
  word: $ => $.tree_sitter_word,
  rules: {
    source_file: $ => $._sequence,

    _sequence: $ => seq(
      optional($._break),
      sep($._expr, $._break),
      optional($._break),
    ),
    _break: _ => repeat1(choice('\n', ';')),

    _expr: $ => choice(
      $.group,
      $.pipe,
      alias($.comma_group, $.group),
      $.call,
      alias($.dot_pipe, $.pipe),
      alias($.no_space_call, $.call),
      $.word,
    ),

    group: $ => seq('(', $._sequence, ')'),
    pipe: $ => seq('{', $._sequence, '}'),

    comma_group: $ => seq(
      optional(repeat1(',')),
      sep1($._expr_comma_group, repeat1(',')),
      optional(repeat1(',')),
    ),
    _expr_comma_group: $ => choice(
      $.group,
      $.pipe,
      $.call,
      alias($.dot_pipe, $.pipe),
      alias($.no_space_call, $.call),
      $.word,
    ),

    call: $ => seq(
      field('fn', $._expr_call),
      field('input', alias(repeat1($._expr_call), $.group)),
    ),
    _expr_call: $ => choice(
      $.group,
      $.pipe,
      alias($.dot_pipe, $.pipe),
      alias($.no_space_call, $.call),
      $.word,
    ),

    dot_pipe: $ => seq(
      sep1($._expr_dot_pipe, '.'),
    ),
    _expr_dot_pipe: $ => choice(
      $.group,
      $.pipe,
      alias($.no_space_call, $.call),
      $.word,
    ),

    no_space_call: $ => seq(
      field('fn', $.word),
      field('input', alias($.immediate_group, $.group)),
    ),
    immediate_group: $ => seq(
      token.immediate('('),
      $._sequence,
      ')',
    ),

    word: _ => /[a-zA-Z0-9_]+/,
    symbol: _ => /[!@#$%^&*\-=+\\|<>/?~]+/,
    tree_sitter_word: _ => /[a-zA-Z0-9_]+|[!@#$%^&*\-=+\\|<>/?~]+/,
  },
});

function sep(rule, sepr) {
  return seq(rule, repeat(seq(sepr, rule)));
}

function sep1(rule, sepr) {
  return seq(rule, repeat1(seq(sepr, rule)));
}
