module.exports = grammar({
  name: 'bismuth',
  extras: $ => [$._space],
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
      alias($.dot_pipe, $.pipe),
      $.call,
      $.word,
    ),

    group: $ => seq('(', $._sequence, ')'),
    pipe: $ => seq('{', $._sequence, '}'),

    call: $ => seq(
      field('fn', $._expr_call),
      field('input', repeat1($._expr_call)),
    ),
    _expr_call: $ => choice(
      $.group,
      $.pipe,
      alias($.dot_pipe, $.pipe),
      $.word,
    ),

    comma_group: $ => seq(
      optional(repeat1(',')),
      sep1($._expr_comma_group, repeat1(',')),
      optional(repeat1(',')),
    ),
    _expr_comma_group: $ => choice(
      $.group,
      $.pipe,
      alias($.dot_pipe, $.pipe),
      $.call,
      $.word,
    ),

    dot_pipe: $ => seq(
      sep1($._expr_dot_pipe, '.'),
    ),
    _expr_dot_pipe: $ => choice(
      $.group,
      $.pipe,
      $.word,
    ),

    word: _ => /[a-zA-Z0-9_]+/,
    symbol: _ => /[!@#$%^&*\-=+\\|<>/?~]+/,
    tree_sitter_word: _ => /[a-zA-Z0-9_]+|[!@#$%^&*\-=+\\|<>/?~]+/,

    _space: _ => /[ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/,
  },
});

function sep(rule, sepr) {
  return seq(rule, repeat(seq(sepr, rule)));
}

function sep1(rule, sepr) {
  return seq(rule, repeat1(seq(sepr, rule)));
}
