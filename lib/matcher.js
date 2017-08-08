'use babel';
import Match from './match';

/**
 * File search matcher
 */
export default class Matcher {

  constructor() {
  }

  /**
   * Extracts file paths from the line
   */
  getFilePathsFromLine(line) {
    if (line == undefined) {
      return [];
    }
    let result = [];
    // Nomralize: Compile output
    line = line.replace(/[,;]?\s*line\s*[=:]\s*(\d+)/i, ":$1");
    // Full filenames in the line
    let matches = line.match(/([A-Z]:)?([^:\s\*\?\"\'\<\>\|]+\.\w+)(:\d+)?/gi);
    if (matches != null) {
      result = result.concat(matches.map((match) => {
        return this.buildMatch(match);
      }));
    }
    // Returns stuff that is between quotes and looks like a file name (import from 'match')
    matches = line.match(/[\'\"]([A-Z]:)?([^:\s\*\?\"\'\<\>\|]+(\.\w+)?(:\d+)?[\'\"])/gi);
    if (matches != null) {
      result = result.concat(matches.map((match) => {
          return this.buildMatch(match.replace(/['\"]/g, ""));
      }));
    }
    // Remove duplicates
    var obj = {};
    for ( var i=0, len=result.length; i < len; i++ ) {
      obj[result[i].file] = result[i];
    }
    result = new Array();
    for ( var key in obj ) {
      result.push(obj[key]);
    }
    return result;
  }

  /**
   * Builds a match based on a text
   */
  buildMatch(text) {
    // Regex for obtaining row and column number
    let match = /^((?:.:)?.+?)(?::(\d+))?$/.exec(text)
    // Parses the row number (undefined if NaN)
    let row = parseInt(match[2]);
    row = isNaN(row) ? undefined : row;
    // Returns the match
    return new Match(match[1], row);
  }

};
