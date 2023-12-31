#include "tree_sitter/parser.h"

enum TokenType {
	LINE_BREAK
};

bool tree_sitter_bismuth_external_scanner_scan(
  void *payload,
	TSLexer *lexer,
  const bool *valid_symbols
) {
	if (valid_symbols[LINE_BREAK] && lexer->lookahead == '\n') {
		lexer->result_symbol = LINE_BREAK;
		lexer->advance(lexer, true);
		return true;
	} else {
		return false;
	}
}

void* tree_sitter_bismuth_external_scanner_create() {
	return NULL;
}

void tree_sitter_bismuth_external_scanner_destroy(void *payload) { } 

unsigned tree_sitter_bismuth_external_scanner_serialize(
  void *payload,
  char *buffer
) {
	return 0;
}

void tree_sitter_bismuth_external_scanner_deserialize(
  void *payload,
  const char *buffer,
  unsigned length
) { }
