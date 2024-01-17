#include "tree_sitter/parser.h"
#include <ctype.h>
#include <wctype.h>

enum TokenType {
	STR_BLOCK
};

bool is_space(char c) {
	return c == ' '
		|| c == '\n' || c == '\f'
		|| c == '\r' || c == '\t' || c == '\v';
}

bool tree_sitter_bismuth_external_scanner_scan(
  void *payload,
	TSLexer *lexer,
  const bool *valid_symbols
) {
	if (lexer->lookahead == '`') {
		lexer->result_symbol = STR_BLOCK;
		while (lexer->lookahead == '`') {
	  	lexer->advance(lexer, false);
			while (lexer->lookahead != '\n' && !lexer->eof(lexer)) {
	    	lexer->advance(lexer, false);
	    }
			lexer->mark_end(lexer);
			while (is_space(lexer->lookahead)) {
				lexer->advance(lexer, true);      
      }
    }
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
