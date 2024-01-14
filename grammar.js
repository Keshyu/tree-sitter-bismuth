// const symbol = /[!@#$%^&*\-=_+\\|/?<>~:]+/;
// const name = /\w+/;
const symbol = /[!@#$%^&*\-=+\\|<>/?~]+/;
const name = /[a-zA-Z0-9_]+/;

module.exports = grammar({
  name: 'bismuth',
  extras: _ => [/[ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/],
  word: $ => $.word,
  externals: $ => [
    // $._line_break,
  ],
  precedences: $ => [
    // [$.call, $.dot_pipe],
    // [$.bare_call, $.call],
    // [$.infix_call, $.call],
    // [$.tail_dedent, $.bare_call],
  ],
  inline: $ => [$._expr, $._top_expr],
  rules: {
    source_file: $ => optional($._bare_decl),
    _bare_decl: $ => sepBy($.break, $._top_expr),

    decl: $ => seq('[', optional($._bare_decl), ']'),
    pipe: $ => seq('{', optional(sepBy($.break, $._top_expr)), '}'),
    group: $ => seq('(', optional(sepBy($.break, $._top_expr)), ')'),
    break: _ => repeat1(choice('\n', ';')),

    _top_expr: $ => choice(
      $.binding,
      $.infix_call,
      $.tail_dedent,
      $.top_call,
      $._expr
    ),
    binding: $ => prec(1, seq(
      choice($.word_name, $.group),
      ':',
      choice($._expr, $.infix_call),
    )),
    tail_dedent: $ => seq($._top_expr, ':'),
    infix_call: $ => seq($._expr, $.symbol_name, $._expr),
    top_call: $ => prec.left(repeat1(prec(1, $._expr))),
    
    _expr: $ => choice(
      $.pipe,
      $.group,
      $.call,
      $.dot_pipe,
      $.comma_group,
      $.word_name,
      $.literal
    ),
    call: $ => seq($._expr, $.group),
    dot_pipe: $ => prec.left(sepBy1('.', $._expr)),
    comma_group: $ => prec.left(sepBy1(',', $._expr)),
    
    literal: $ => seq(':', choice(
      token.immediate(choice(
        name,
        repeat1(seq(name, symbol)),
        repeat1(seq(symbol, name)),
        sepBy(symbol, name),
      )),
      seq(
        token.immediate('('),
        optional(sepBy($.break, $._top_expr)),
        ')',
      ),
    )),
    word_name: $ => token(choice(
      name,
      repeat1(seq(name, symbol)),
      repeat1(seq(symbol, name)),
      sepBy(symbol, name),
    )),
    symbol_name: $ => choice(symbol, sepBy(name, symbol)),
    
    word: _ => /[a-zA-Z0-9_]+|[!@#$%^&*\-=+\\|<>/?~]+/,
    
    // raw_string: $ => seq(
    //   token.immediate('#"'),
    //   optional(/[^"]+/),
    //   '"'
    // ),
    // raw_str_block: $ => seq('#', token.immediate($.str_block)),
    string: $ => seq('"', optional(choice(/[^"\\]+/, $.escape)), '"'),
    str_block: $ => seq(
      '`',
      optional(sepBy('\n', choice(/[^\n\\]+/, $.escape))),
    ),
    escape: _ => '\\\\',
  },
  conflicts: $ => [
  ],
});

function sepBy(sep, rule) {
  return seq(
    rule,
    repeat(seq(sep, rule)),
  );
}

function sepBy1(sep, rule) {
  return seq(
    rule,
    repeat1(seq(sep, rule)),
  );
}
