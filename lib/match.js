'use babel';

/**
 * File search match in the buffer
 */
export default class Match {

  /**
   * Creates a new match
   */
  constructor(file, row, column) {
    this.file = file;
    this.row = row;
    this.column = column;
  }

};
