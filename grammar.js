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
      $.tail_dedent,

      $.declaration,
      $.binding,
      alias($.comma_group, $.group),
      $.infix_call,
      $.call,
      alias($.no_space_binding, $.binding),
      alias($.dot_pipe, $.pipe),
      $.no_space_call,
      alias($.call_on_literal, $.call),

      $.string_block,
      $.string,
      $.word,
      $.symbol,
      $.literal,
    ),

    group: $ => seq('(', $._sequence, ')'),
    pipe: $ => seq('{', $._sequence, '}'),

    tail_dedent: $ => seq($._tail_dedent_expr, ':'),
    _tail_dedent_expr: $ => choice(
      $.group,
      $.pipe,

      alias($.comma_group, $.group),
      $.infix_call,
      $.call,
      alias($.no_space_binding, $.binding),
      alias($.dot_pipe, $.pipe),
      $.no_space_call,
      alias($.call_on_literal, $.call),

      $.string,
      $.word,
      $.symbol,
      $.literal,
    ),

    declaration: $ => seq(
      field('value', $._declaration_expr),
      field('dependencies', seq('[', $._sequence, ']')),
    ),
    _declaration_expr: $ => choice(
      $.group,
      $.pipe,

      $.binding,
      alias($.comma_group, $.group),
      $.infix_call,
      $.call,
      alias($.no_space_binding, $.binding),
      alias($.dot_pipe, $.pipe),
      $.no_space_call,
      alias($.call_on_literal, $.call),

      $.string,
      $.word,
      $.symbol,
      $.literal,
    ),

    binding: $ => seq(
      field('id', $._expr_binding),
      alias(/:[ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/, ':'),
      field('value', $._expr_binding),
    ),
    _expr_binding: $ => choice(
      $.group,
      $.pipe,
      alias($.comma_group, $.group),
      $.infix_call,
      $.call,
      alias($.no_space_binding, $.binding),
      alias($.dot_pipe, $.pipe),
      $.no_space_call,
      alias($.call_on_literal, $.call),
      $.string_block,
      $.string,
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
      $.infix_call,
      $.call,
      alias($.no_space_binding, $.binding),
      alias($.dot_pipe, $.pipe),
      $.no_space_call,
      alias($.call_on_literal, $.call),
      $.string_block,
      $.string,
      $.word,
      $.symbol,
      $.literal,
    ),

    infix_call: $ => seq(
      field('left', $._expr_infix_call),
      field('fn', $.symbol),
      field('right', $._expr_infix_call),
    ),
    _expr_infix_call: $ => choice(
      $.group,
      $.pipe,
      $.call,
      alias($.no_space_binding, $.binding),
      alias($.dot_pipe, $.pipe),
      $.no_space_call,
      alias($.call_on_literal, $.call),
      $.string_block,
      $.string,
      $.word,
      $.literal,
    ),

    call: $ => seq(
      field('fn', choice($._expr_call, $.symbol)),
      field('input', alias(repeat1($._expr_call), $.group)),
    ),
    _expr_call: $ => choice(
      $.group,
      $.pipe,
      alias($.no_space_binding, $.binding),
      alias($.dot_pipe, $.pipe),
      $.no_space_call,
      alias($.call_on_literal, $.call),
      $.string_block,
      $.string,
      $.word,
      $.literal,
    ),

    no_space_binding: $ => seq(
      field('id', $._expr_no_space_binding),
      '::',
      field('value', $._expr_no_space_binding),
    ),
    _expr_no_space_binding: $ => choice(
      $.group,
      $.pipe,
      alias($.dot_pipe, $.pipe),
      $.no_space_call,
      alias($.call_on_literal, $.call),
      $.string_block,
      $.string,
      $.word,
      $.literal,
    ),

    dot_pipe: $ => seq(
      sep1($._expr_dot_pipe, '.'),
    ),
    _expr_dot_pipe: $ => choice(
      $.group,
      $.pipe,
      $.no_space_call,
      alias($.call_on_literal, $.call),
      $.string_block,
      $.string,
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
      $.no_space_call,
      alias($.call_on_literal, $.call),
      $.string_block,
      $.string,
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
      $.string_block,
      $.string,
      $.word,
      $.literal,
    ),

    string_block: _ => /`[^\n]*(\n[ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]*`[^\n]*)*/,
    string: _ => seq('"', /[^"]*/, '"'),

    literal: _ => literal,
    word: _ => (
      new RegExp([
        /[a-zA-Z0-9_]+/,
        /([!@#$%^&*\-=+\\|<>/?~]+[a-zA-Z0-9_]+)*/,
      ].map(r => r.source).join(''))
    ),
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
