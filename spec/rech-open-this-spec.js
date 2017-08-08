'use babel';

import { Provider } from 'atom';
import { RechOpenThis } from '../lib/rech-open-this';
import { File } from 'rech-atom-commons';

describe('RechOpenThis', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    waitsForPromise(() => {
      activationPromise = atom.packages.activatePackage('rech-open-this')
      return activationPromise;
    });
    waitsForPromise(() => {
      return atom.workspace.open("root.js").then(() => {
        // Mock the "getPath" method
        spyOn(atom.workspace.getActiveTextEditor(), "getPath").andReturn("c:\\js\\root.js");
        // Spy the open method
        spyOn(atom.workspace, "open").andCallThrough();
        // Spy the addWarning method
        spyOn(atom.notifications, "addWarning").andCallThrough();
      });
    });
    atom.packages.serviceHub.clear();
    // Mock the file system
    spyOn(File.prototype, "exists").andCallFake(function() {
      if (this.path == undefined) {
        return false;
      }
      return [
        "c:\\js\\file1.js",
        "c:\\somewhereelse\\somethingelse.js",
        "c:\\path-from-service\\somethingelse.js",
      ].includes(this.path.toLowerCase())
    });
  });

  describe('the same pane command', () => {
    it('open full paths', () => {
      runs(function() {
        atom.config.set("rech-open-this.pathForFileSearching", "");
        atom.workspace.getActiveTextEditor().insertText("c:\\js\\file1.js");
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'rech-open-this:same-pane');
      });
      waitsFor(function() {
        return atom.workspace.getTextEditors().length > 1;
      }, "A new tab should be opened", 500);
      runs(function() {
        expect(atom.workspace.open).toHaveBeenCalledWith("c:\\js\\file1.js");
      });
    });

    it('open paths relative to the current file paths', () => {
      runs(function() {
        atom.config.set("rech-open-this.pathForFileSearching", "");
        atom.workspace.getActiveTextEditor().insertText("file1.js");
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'rech-open-this:same-pane');
      });
      waitsFor(function() {
        return atom.workspace.getTextEditors().length > 1;
      }, "A new tab should be opened", 500);
      runs(function() {
        expect(atom.workspace.open).toHaveBeenCalledWith("c:\\js\\file1.js");
      });
    });

    it('searches for files in the path', () => {
      runs(function() {
        atom.config.set("rech-open-this.pathForFileSearching", "c:\\somewhereelse\\");
        atom.workspace.getActiveTextEditor().insertText("somethingelse.js");
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'rech-open-this:same-pane');
      });
      waitsFor(function() {
        return atom.workspace.getTextEditors().length > 1;
      }, "A new tab should be opened", 500);
      runs(function() {
        expect(atom.workspace.open).toHaveBeenCalledWith("c:\\somewhereelse\\somethingelse.js");
      });
    });

    it('respects the path defined by services', () => {
      runs(function() {
        console.log("aqui")
        atom.config.set("rech-open-this.pathForFileSearching", "");
        atom.packages.serviceHub.provide('rech-open-this.service', '1.0.0', (path) => { return path.concat(["c:\\path-from-service\\"]); });
        atom.workspace.getActiveTextEditor().insertText("somethingelse.js");
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'rech-open-this:same-pane');
      });
      waitsFor(function() {
        return atom.workspace.getTextEditors().length > 1;
      }, "A new tab should be opened", 500);
      runs(function() {
        expect(atom.workspace.open).toHaveBeenCalledWith("c:\\path-from-service\\somethingelse.js");
      });
    });

    it('allows services to return promises', () => {
      runs(function() {
        atom.config.set("rech-open-this.pathForFileSearching", "");
        atom.packages.serviceHub.provide('rech-open-this.service', '1.0.0', () => {
          return Promise.resolve(["c:\\path-from-service\\"]);
        });
        atom.workspace.getActiveTextEditor().insertText("somethingelse.js");
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'rech-open-this:same-pane');
      });
      waitsFor(function() {
        return atom.workspace.getTextEditors().length > 1;
      }, "A new tab should be opened", 500);
      runs(function() {
        expect(atom.workspace.open).toHaveBeenCalledWith("c:\\path-from-service\\somethingelse.js");
      });
    });

    it('notify the user if it cannot find the file', () => {
      runs(function() {
        atom.config.set("rech-open-this.pathForFileSearching", "c:\\somewhereelse\\");
        atom.workspace.getActiveTextEditor().insertText("this-does-not-exist.js");
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'rech-open-this:same-pane');
      });
      waitsFor(function() {
        return atom.notifications.getNotifications().length > 0;
      }, "A notification should be opened", 500);
      runs(function() {
        expect(atom.notifications.addWarning).toHaveBeenCalledWith("this-does-not-exist.js could not be found");
      });
    });

  });

});
