const literal = /:[a-zA-Z0-9_]+/;

module.exports = grammar({
  name: 'bismuth',
  extras: _ => [/[ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/],
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
      $.binding,
      alias($.comma_group, $.group),
      $.call,
      alias($.dot_pipe, $.pipe),
      alias($.no_space_call, $.call),
      alias($.call_on_literal, $.call),
      $.word,
      $.literal,
    ),

    group: $ => seq('(', $._sequence, ')'),
    pipe: $ => seq('{', $._sequence, '}'),

    binding: $ => seq(
      field('id', choice($.word, $.group, $.pipe)),
      /:[ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/,
      field('value', $._expr_binding),
    ),
    _expr_binding: $ => choice(
      $.group,
      $.pipe,
      alias($.comma_group, $.group),
      $.call,
      alias($.dot_pipe, $.pipe),
      alias($.no_space_call, $.call),
      alias($.call_on_literal, $.call),
      $.word,
      $.literal,
    ),

    comma_group: $ => seq(
      repeat(','),
      sep1($._expr_comma_group, repeat1(',')),
      repeat(','),
    ),
    _expr_comma_group: $ => choice(
      $.group,
      $.pipe,
      $.call,
      alias($.dot_pipe, $.pipe),
      alias($.no_space_call, $.call),
      alias($.call_on_literal, $.call),
      $.word,
      $.literal,
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
      alias($.call_on_literal, $.call),
      $.word,
      $.literal,
    ),

    dot_pipe: $ => seq(
      sep1($._expr_dot_pipe, '.'),
    ),
    _expr_dot_pipe: $ => choice(
      $.group,
      $.pipe,
      alias($.no_space_call, $.call),
      alias($.call_on_literal, $.call),
      $.word,
      $.literal,
    ),

    no_space_call: $ => seq(
      field('fn', $._expr_no_space_call),
      field('input', alias($.immediate_group, $.group)),
    ),
    _expr_no_space_call: $ => choice(
      $.group,
      $.pipe,
      alias($.call_on_literal, $.call),
      alias($.no_space_call, $.call),
      $.word,
      $.literal,
    ),
    immediate_group: $ => seq(
      token.immediate('('),
      $._sequence,
      ')',
    ),

    call_on_literal: $ => seq(
      field('fn', $._expr_call_on_literal),
      field('input', alias(token.immediate(literal), $.literal)),
    ),
    _expr_call_on_literal: $ => choice(
      $.group,
      $.pipe,
      alias($.call_on_literal, $.call),
      $.word,
      $.literal,
    ),

    literal: _ => literal,
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
