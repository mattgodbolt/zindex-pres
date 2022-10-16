function matchLength(t1, t2) {
    let index = 0;
    for (; index < Math.min(t1.length, t2.length); ++index) {
        if (t1[index] !== t2[index])
            break;
    }
    return index
}

function findLongestMatch(text, window, maxLen) {
    if (text.length < 3)
        return null;
    const toLookFor = text.slice(0, 3);
    let longestMatch = -1;
    let longestIndex = -1;
    let startIndex = 0;
    while (startIndex < maxLen) {
        const match = window.indexOf(toLookFor, startIndex);
        if (match < 0 || match >= maxLen) break;
        let thisMatchLength = matchLength(text, window.slice(match));
        if (thisMatchLength > longestMatch) {
            longestIndex = startIndex;
            longestMatch = thisMatchLength;
        }
        startIndex = match + 1;
    }
    if (longestMatch >= 0) {
        return [longestIndex, longestMatch];
    }
    return null;
}

export function lzCompress(text) {
    const Lookback = 32768;
    const Lookahead = 258;
    const result = [];

    for (let index = 0; index < text.length; ++index) {
        const windowStartIndex = Math.max(0, index - Lookback);
        const windowEndIndex = Math.min(text.length, index + Lookahead);
        const window = text.slice(windowStartIndex, windowEndIndex);
        const match = findLongestMatch(text.slice(index), window, index);// todo not that
        if (!match) {
            result.push(text[index]);
        } else {
            result.push(`{${match[0] - index + windowStartIndex}, ${match[1]}}`);
            index += match[1];
        }
    }

    return result;
}