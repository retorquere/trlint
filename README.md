# Versions: 

* npm: 9.8.0
* node: 20.5.1
* eslint: 8.52.0

# Problem

I'm trying to lint Zotero translators, which are standard
javascript files, but with a leading header, and optionally testcases
at the end. I want to break this file into these 3 chunks (header,
body, testcases) and lint them as javascript using the standard
eslint linter. I can transform the header to javascript in the
processor, but when I start the linter I see that my processor is
called once on the source file (expected) but then also on the
chunks (unexpected). Is that because the source is javascript and
the chunks are themselves also javascript, creating an infinite
regress? An MWE is at https://github.com/retorquere/trlint, runnable
as `npm test`.


