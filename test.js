"use strict";

Number.prototype.printHex = function () {
	return "0x" + this.toString(16).toUpperCase();
};

function binarySearch(codePoint, ranges) {
	if (!ranges) {
		console.log("range was falsy");
		return null;
	}

	// console.log(codePoint, ranges);

	if (!binarySearch.cache) {
		binarySearch.cache = [];
	}

	var cacheResult;
	binarySearch.cache.some(function (range) {
		if (isInRange(codePoint, range[0], range[1])) {
			cacheResult = range[2];
			return true;
		}
	});

	if (cacheResult) {
		return cacheResult;
	}

	var iBottom = 1, iMiddle = 0, iTop = ranges.length;

	while (iBottom <= iTop) {
		iMiddle = (iBottom + iTop) >> 1;
		let range = ranges[iMiddle];
		// console.log(range);
		if (!range) {
			return null;
		}
		if (isInRange(codePoint, range[0], range[1])) {
			binarySearch.cache.push(range);
			return range[2];
		} else if (codePoint < range[0]) {
			iTop = iMiddle - 1;
		} else {
			iBottom = iMiddle + 1
		}
	}

	return null;
}

function simpleSearch(codePoint, ranges) {
	var result;
	ranges.some(function (range) {
		if (isInRange(codePoint, range[0], range[1])) {
			result = range[2];
			return true;
		} else if (codePoint < range[0]) {
			return true; // short-circuit loop
		}
	});
	return result;
}

function getScript(codePoint) {
	// console.log(String.fromCodePoint(codePoint), codePoint.printHex(), (codePoint >> 12).printHex());
	var script = charToScript[codePoint] || simpleSearch(codePoint, rangeToScript)
	if (script) {
		return script;
	}
	var ranges = scriptRanges[codePoint >> 12];
	if (ranges.length > 5) {
		return binarySearch(codePoint, ranges);
	} else {
		return simpleSearch(codePoint, ranges);
	}
}

// Print script ranges
/*
scriptRanges.forEach(function(ranges, index) {
	var stringified = ranges
		.map(function(range) {
			if (range.length > 0) {
				return `[ ${range[0].printHex()}, ${range[1].printHex()}, "${range[2]}" ]`
			}
		})
		.join(", ");
	console.log(`[${Number(index).printHex()}]: ${stringified}`);
})
*/

// Requires Unicode data.js, which supplies the UnicodeNames global object.

var UnicodeNamesArray = [];
function searchForCharacterName (searchFor) {
	var result = [];
	var alternatives = [];

	if (typeof searchFor === "string") {
		alternatives = searchFor.split(/;\s*/);
	}

	alternatives = alternatives.map(function(alternative) {
		return alternative.split(/,\s*/);
	});

	// Initialize search array.
	if (UnicodeNamesArray.length === 0) {
		Object.keys(UnicodeNames).forEach(function(codePoint) {
			let name = UnicodeNames[codePoint];
			if (typeof name === "string") {
				name = expandAbbr(name);
				UnicodeNamesArray.push([name, Number(codePoint)]);
			}
		});
	}

	UnicodeNamesArray.forEach(function(UnicodeName) {
		var matched = alternatives.some(function(alternative) {
			return alternative.every(function(alternative) {
				return UnicodeName[0].includes(alternative.toUpperCase());
			});
		});
		if (matched) {
			result.push(UnicodeName);
		}
	});

	return result;
}

function expandAbbr (characterName) {
	if (typeof characterName !== "string")
		throw "Argument to expandAbbr should be string, not " + typeof characterName
	return characterName.replace(
		/\$([a-zA-Z]+)/g,
		function(wholeMatch, letter) {
			return UnicodeNameAbbreviations[letter] || wholeMatch;
		}
	);
}

function isInRange (number, lower, higher) {
	return number >= lower && number <= higher;
}

function isCombining (codePoint) {
	var codePoint;
	if (typeof character === "string")
		codePoint = character.codePointAt(0);
	else if (typeof character === "number")
		codePoint = character;
	if (combiningCharacters.single[codePoint])
		return true;
	for (const range of combiningCharacters.ranges) {
		if (isInRange(codePoint, range[0], range[1]))
			return true;
		if (codePoint < range[0])
			break;
	}
	return false;
}

// Hides table cells based on the status of a checkbox.
function hide(element, toggle) {
	$(element).css(
		"display",
		$(toggle).prop("checked")
			? "none"
			: "table-cell"
	);
}

// Helper function, for modifying data on clipboard when copy or cut event is fired.
// Used below to remove dotted circle from a combining character.
function modifyClipboard(transformationFunction) {
	return function(event) {
		event.preventDefault();
		var originalSelection = window.getSelection().toString();
		var selection = transformationFunction(originalSelection);
		event.originalEvent.clipboardData.setData("text/plain", selection);
	}
}

window.onload = function () {
	console.log("Ready!");

	$("#character-name-lookup input").change(function () {
		var value = $("#character-name-lookup input").val();

		if (typeof window.characterNameLookup !== "object") {
			window.characterNameLookup = {};
		}

		// console.log(value);

		if (window.characterNameLookup.value === value) {
			return null;
		} else {
			window.characterNameLookup.value = value;
		}

		var names = [];

		for (let i = 0; i < value.length; i++) {
			let codepoint = value[i].codePointAt(0);
			let name = UnicodeNames[codepoint]
			if (name) {
				name = expandAbbr(name)
				name = name.toLowerCase();
				names.push(name);
			}
		}

		$("#character-name-lookup .result").html(
			names.join(", ")
		);
	});

	$("#character-name-toggle").click(function () {
		hide(".character-name", "#character-name-toggle");
	});

	$("#codepoint-toggle").click(function () {
		hide(".codepoint", "#codepoint-toggle");
	});

	$("#character-name-search").change(function () {
		var value = $("#character-name-search").val();

		var $resultTable = $("#character-search .result tbody");

		// If there was no previous search, do nothing.
		if (!window.previousCharacterSearch) {
			window.previousCharacterSearch = value;

		// If previous search parameter was identical to current one, do nothing.
		} else if (window.previousCharacterSearch == value) {
			return null;

		// Clear the previous search results.
		} else {
			window.previousCharacterSearch = value;
			$resultTable.empty();
		}

		searchForCharacterName(value)
			.forEach(function(nameArray) {
				var name = nameArray[0].toLowerCase();
				var codePoint = Number(nameArray[1]);
				var $characterRow = $("<tr/>")
					.addClass("character-row");
				$("<td/>")
					.attr({
						class: "character-copyable",
						contenteditable: "true",
						autocomplete: "off",
						autocorrect: "off",
						autocapitalize: "off",
						spellcheck: "false"
					})
					.addClass(getScript(codePoint))
					.on("copy cut", modifyClipboard(function(clipboard) {
						// If followed by another character,
						// dotted circle is the seat for a combining character.
						return clipboard.replace(/◌(?=.)/g, "");
					}))
					.html((isCombining(codePoint) ? "◌" : "") + String.fromCodePoint(codePoint))
					.appendTo($characterRow);
				$("<td/>")
					.addClass("codepoint")
					.html(codePoint.printHex())
					.appendTo($characterRow);
				$("<td/>")
					.addClass("character-name")
					.html(name)
					.appendTo($characterRow);
				$resultTable.append($characterRow);
				// var element = `<span class="character-copyable" contenteditable="true" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">${addDottedCircle(codePoint)}</span><span class="character-parenthesis"> (<span class="codepoint">${codePoint.printHex()}</span><span class="character-comma">, </span><span class="character-name">${name}</span>)</span>`;
			});

		hide(".codepoint", ".codepoint-toggle");
		hide(".character-name", ".character-name-toggle");
	});

	$("#character-name-search").keypress(function(event) {
		// Enter key triggers "onchange" event of textbox.
		if (event.which === 13) {
			$("#character-name-search").trigger("change");
			return false;
		} else {
			return true;
		}
	})
};
