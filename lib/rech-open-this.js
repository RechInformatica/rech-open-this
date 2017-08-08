'use babel';

import { CompositeDisposable, Disposable } from 'atom';
import { AtomEditor, Path, SelectDialog } from 'rech-atom-commons';
import Matcher from './matcher';
import Match from './match';
import PathResolver from './path-resolver';
import ServiceHelper from './service-helper';

export default {

  pathServices: [],
  matcher: new Matcher(),
  resolver: new PathResolver(),


  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'rech-open-this:same-pane': () => this.openOnSamePane()
    }));
    // Observe settings
    this.subscriptions.add(atom.config.observe('rech-open-this.pathForFileSearching', (value) => { this.pathForFileSearching = value }));
    this.subscriptions.add(atom.config.observe('rech-open-this.lookInProjectPaths', (value) => { this.lookInProjectPaths = value }));
    this.subscriptions.add(atom.config.observe('rech-open-this.optionalExtensions', (value) => { this.optionalExtensions = value }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  consumePathService(service) {
    this.pathServices.push(service);
    return new Disposable(() => {
      this.pathServices.splice(this.pathServices.indexOf(service), 1);
    })
  },

  serialize() {
    return {};
  },

  /**
   * Opens the file under the cursor on the same pane as the current file
   */
  openOnSamePane() {
    let matches = this.getCursorMatches();
    if (matches.length > 1) {
      matches = new SelectDialog(matches, (match) => { return {
        name: match.file,
        description: (match.row != undefined ? "Line " + match.row : ""),
        icon: 'icon-file-text'
      }}).show().then((match) => {
        this.openMatchOnSamePane(match);
      });
    } else {
      this.openMatchOnSamePane(matches[0]);
    }
  },

  openMatchOnSamePane(match) {
    this.resolve(match).then((file) => {
      atom.workspace.open(file).then((textEditor) => {
        // After opening the file, if there is a row, position it
        if (match.row != undefined) {
          new AtomEditor(textEditor).setCursor(match.row - 1);
        }
      });
    }).catch((message) => {
      atom.notifications.addWarning(message);
    });
  },

  /**
   * Returns the matches in the lines with cursors
   *
   * @return {Match[]}
   */
  getCursorMatches() {
    let cursorMatches = [];
    new AtomEditor().getCursorLines().forEach((line) => {
      this.matcher.getFilePathsFromLine(line).forEach((match) => {
        cursorMatches.push(match);
      });
    });
    return cursorMatches;
  },

  /**
   * Resolves the name of a match, returning the full file name
   *
   * @param {Match}
   * @return {string}
   */
  resolve(match) {
    return new Promise((resolve, reject) => {
      this.getPathForFileSearching().then((path) => {
        let thePath = this.resolver.resolve(match.file, path, this.optionalExtensions);
        if (thePath != undefined) {
          resolve(thePath);
        } else {
          reject(match.file + " could not be found")
        }
      });
    });
  },

  /**
   * Constructus the path for file searching
   */
  getPathForFileSearching() {
    var path = [];
    // Injects the current file path
    if (new AtomEditor().getPath() != null) {
      path.push(new Path(new AtomEditor().getPath()).directory());
    }
    // Inject project paths
    if (this.lookInProjectPaths) {
      projectPaths = atom.project.getPaths();
      for (var i in projectPaths) {
        path.push(projectPaths[i]);
      }
    }
    // Inject paths from the config
    path = path.concat(this.pathForFileSearching.split(";"));
    // Injects paths from services
    return new ServiceHelper(this.pathServices).providePath(path);
  }
};
