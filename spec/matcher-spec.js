'use babel';

import Match from '../lib/match';
import Matcher from '../lib/matcher';

describe('Matcher', () => {
  describe('when looking for paths in a specific line', () => {
    let matcher = new Matcher();
    it('handles undefineds and nulls well', () => {
      expect(matcher.getFilePathsFromLine(undefined)).toEqual([]);
      expect(matcher.getFilePathsFromLine(null)).toEqual([]);
    });
    it('works on files with a single file', () => {
      expect(matcher.getFilePathsFromLine("file.txt")).toEqual([new Match("file.txt")]);
      expect(matcher.getFilePathsFromLine("word.docx")).toEqual([new Match("word.docx")]);
    });
    it('accepts valid file characters', () => {
      expect(matcher.getFilePathsFromLine("file-1.txt")).toEqual([new Match("file-1.txt")]);
      expect(matcher.getFilePathsFromLine("file_1.txt")).toEqual([new Match("file_1.txt")]);
      expect(matcher.getFilePathsFromLine("Spécial_cãracters.txt")).toEqual([new Match("Spécial_cãracters.txt")]);
    });
    it('works with windows paths', () => {
      expect(matcher.getFilePathsFromLine("c:\\users\\johndoe\\myfile.txt")).toEqual([new Match("c:\\users\\johndoe\\myfile.txt")]);
    });
    it('works with linux paths', () => {
      expect(matcher.getFilePathsFromLine("/home/johndoe/myfile.txt")).toEqual([new Match("/home/johndoe/myfile.txt")]);
    });
    it('works on ES6 import (without extension)', () => {
      expect(matcher.getFilePathsFromLine("import Path from './path';")).toEqual([new Match("./path")]);
      expect(matcher.getFilePathsFromLine("import Path from '../lib/path';")).toEqual([new Match("../lib/path")]);
    });
    it('works on ruby requires', () => {
      expect(matcher.getFilePathsFromLine("require 'Script.rb';")).toEqual([new Match("Script.rb")]);
      expect(matcher.getFilePathsFromLine("require \"Script.rb\";")).toEqual([new Match("Script.rb")]);
      expect(matcher.getFilePathsFromLine("require \"../Script.rb\";")).toEqual([new Match("../Script.rb")]);
      expect(matcher.getFilePathsFromLine("require \"./Script.rb\";")).toEqual([new Match("./Script.rb")]);
      expect(matcher.getFilePathsFromLine("require \"/lib/Script.rb\";")).toEqual([new Match("/lib/Script.rb")]);
    });
    it('works on bat calls', () => {
      expect(matcher.getFilePathsFromLine("call Subscript.bat")).toEqual([new Match("Subscript.bat")]);
      expect(matcher.getFilePathsFromLine("call c:\\path\\Subscript.bat")).toEqual([new Match("c:\\path\\Subscript.bat")]);
    });
    it('works on cobol copys and calls', () => {
      expect(matcher.getFilePathsFromLine("copy cygwin.cpy.")).toEqual([new Match("cygwin.cpy")]);
      expect(matcher.getFilePathsFromLine("copy cygwin.cpy replacing ==A== by ==W==.")).toEqual([new Match("cygwin.cpy")]);
      expect(matcher.getFilePathsFromLine("call 'program'.")).toEqual([new Match("program")]);
    });
    it('works on findstr/grep result with line number', () => {
      expect(matcher.getFilePathsFromLine("file.txt:3058:the result")).toEqual([new Match("file.txt", 3058)]);
      expect(matcher.getFilePathsFromLine("file.txt:the result")).toEqual([new Match("file.txt")]);
    });
    it('works on some generic compile output', () => {
      expect(matcher.getFilePathsFromLine("Error: Variable x not found. file = module.js, line = 605")).toEqual([new Match("module.js", 605)]);
    });
  });
});
