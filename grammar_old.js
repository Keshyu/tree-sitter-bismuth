const symbol = /[!@#$%^&*\-=_+\\|/?<>~]+/;
const name = /\w+/;

module.exports = grammar({
  name: 'bismuth',
  extras: _ => [/\s/],
  word: $ => $.name,
  externals: $ => [
    $._line_break,
  ],
  precedences: $ => [
    [$.call, $.dot_pipe],
    [$.bare_call, $.call],
    [$.infix_call, $.call],
    // [$.tail_dedent, $.bare_call],
  ],
  inline: $ => [$._expression],
  rules: {
    source_file: $ => optional($._bare_group),
    _top_expression: $ => choice(
      $.binding,
      $.infix_call,
      $.tail_dedent,
      $.bare_call,
      $._expression,
    ),
    binding: $ => seq(
      choice($.name, $.group),
      ':',
      field('value', choice($._expression, $.infix_call)),
    ),
    tail_dedent: $ => seq(choice($._expression, $.bare_call), ':'),
    infix_call: $ => seq(
      field('left', $._expression),
      field('function', $.symbol_name),
      field('right', $._expression),
    ),
    bare_call: $ => seq(
      field('function', $.name),
      field('input', $._expression),
    ),
    _expression: $ => choice(
      $.group,
      $.pipe,
      $.dot_pipe,
      $.call,
      $.name,
      $.symbol_name,
      $.name_literal,
      $.string,
      $.multiline_string,
    ),
    call: $ => prec.left(seq(
      field('function', $._expression),
      field('input', choice($.group, $.pipe)),
    )),
    dot_pipe: $ => prec.left(seq($._expression, '.', $._expression)),
    group: $ => seq('(', optional($._bare_group), ')'),
    _bare_group: $ => sepBy1(
      choice(',', $._line_break),
      $._top_expression
    ),
    pipe: $ => seq(
      '{',
      sepBy(
        choice(';', $._line_break),
        sepBy1(',', $._top_expression),
      ),
      '}',
    ),
    symbol_name: _ => token(choice(
      symbol,
      strictSepBy1(name, symbol),
    )),
    name: _ => token(choice(
      name,
      repeat1(seq(name, symbol)),
      repeat1(seq(symbol, name)),
      strictSepBy1(symbol, name),
    )),
    name_literal: _ => seq(
      ':',
      token.immediate(token(choice(
        name,
        repeat1(seq(name, symbol)),
        repeat1(seq(symbol, name)),
        strictSepBy1(symbol, name),
      ))),
    ),
    string: _ => /"([^"]|\\")*"/,
    multiline_string: $ => strictSepBy1(
      $._line_break,
      /`[^\n]*/,
    ),
  },
  conflicts: $ => [
    [$.multiline_string],
  ],
});

function sepBy(sep, rule) {
  return optional(sepBy1(sep, rule));
}

function sepBy1(sep, rule) {
  return seq(
    rule,
    repeat(seq(sep, rule)),
    optional(sep),
  );
}

function strictSepBy1(sep, rule) {
  return seq(
    rule,
    repeat(seq(sep, rule)),
  );
}
