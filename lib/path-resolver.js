'use babel';
import Match from './match';
import { File } from 'rech-atom-commons';

/**
 * File search matcher
 */
export default class Matcher {

  constructor() {
  }

  /**
   *
   */
  resolve(file, path, optionalExtensions = "") {
    if (file == undefined || path == undefined) {
      return undefined;
    }
    optionalExtensions = [""].concat(optionalExtensions.split(";"));
    for (var k in optionalExtensions) {
      if (new File(file + optionalExtensions[k]).exists()) {
        return file + optionalExtensions[k];
      }
      for (var i in path) {
        if (new File(path[i] + file + optionalExtensions[k]).exists()) {
          return path[i] + file + optionalExtensions[k];
        }
        // Check with unix paths
        if (!path[i].endsWith("/")) {
          if (new File(path[i] + "/" + file + optionalExtensions[k]).exists()) {
            return path[i] + "/" + file + optionalExtensions[k];
          }
        }
        // Check with windows paths
        if (!path[i].endsWith("\\")) {
          if (new File(path[i] + "\\" + file + optionalExtensions[k]).exists()) {
            return path[i] + "\\" + file + optionalExtensions[k];
          }
        }
      }
    }
    return undefined;
  }

};
