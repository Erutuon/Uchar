# Uchar

This project contains JavaScript functions for dealing with Unicode characters when you do not have access to the internet.

At the moment, `test.html` allows you to retrieve the names of Unicode characters, or retrieve a list of Unicode characters by searching their names. The search results show combining characters over a dotted circle (◌). It is easy to copy characters from the list. Even combining characters can be copied: the dotted circle is automatically removed.

Classes for script codes are added to the characters, based on the script codes used on Wiktionary. You can choose which font a particular font displays in by modifying the CSS.

In the character name search box, use the syntax `x, y` to search for a character name that matches both `x` and `y`. Search for `x; y` to list characters that match either `x` or `y`. Or you can combine the two: `x, y; a, b` will match names that either match both `x` and `y` or `a` and `b`. For programmers or logicians, comma is equivalent to `and` (`&&` in JavaScript) and semicolon is equivalent to `or` (`||` in JavaScript).

## To do
- `test.html` looks crummy. It needs some CSS work.
- Ideally, composed characters that decompose to a given combining character should come up when one searches for that combining character. For instance, searching for `acute` should return Greek characters with `tonos`.
- Save search display preferences.
- Allow more complex search parameters: for instance, `latin, (acute; grave)` to retrieve characters whose names contain `latin` and either `acute` or `grave`.
