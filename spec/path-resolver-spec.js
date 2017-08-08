'use babel';

import PathResolver from '../lib/path-resolver';
import { File } from 'rech-atom-commons';

describe('PathResolver', () => {
  describe('when resolving paths', () => {
    let resolver = new PathResolver();

    // Mocks the File.exists method so that we can create a fake filesystem
    beforeEach(() => {
      spyOn(File.prototype, "exists").andCallFake(function() {
        if (this.path == undefined) {
          return false;
        }
        return [
          "c:\\js\\file1.js",
          "c:\\js\\file2.js",
          "c:\\css\\file1.css",
          "c:\\css\\file2.css",
          "c:\\all\\file1.js",
          "c:\\all\\file2.js",
          "c:\\all\\file1.css",
          "c:\\all\\file2.css"
        ].includes(this.path.toLowerCase())
      });
    });

    it('handles undefineds and nulls well', () => {
      expect(resolver.resolve(undefined, undefined)).toEqual(undefined);
      expect(resolver.resolve(null, null)).toEqual(undefined);
      expect(resolver.resolve("Test.js", undefined)).toEqual(undefined);
      expect(resolver.resolve("Test.js", null)).toEqual(undefined);
      expect(resolver.resolve(undefined, ["Test.js"])).toEqual(undefined);
      expect(resolver.resolve(null, ["Test.js"])).toEqual(undefined);
    });

    it('works with absolute paths', () => {
      expect(resolver.resolve("c:\\js\\file1.js", [])).toBe("c:\\js\\file1.js");
      expect(resolver.resolve("c:\\js\\file1.js", ["c:\\all\\"])).toBe("c:\\js\\file1.js");
      expect(resolver.resolve("c:\\css\\file1.js", ["c:\\all\\"])).toBe(undefined);
    });

    it('works with filenames only', () => {
      expect(resolver.resolve("file1.js", ["c:\\js\\"])).toBe("c:\\js\\file1.js");
      expect(resolver.resolve("file2.js", ["c:\\js\\"])).toBe("c:\\js\\file2.js");
      expect(resolver.resolve("file3.js", ["c:\\js\\"])).toBe(undefined);
      expect(resolver.resolve("file1.css", ["c:\\css\\"])).toBe("c:\\css\\file1.css");
      expect(resolver.resolve("file2.css", ["c:\\css\\"])).toBe("c:\\css\\file2.css");
      expect(resolver.resolve("file3.css", ["c:\\css\\"])).toBe(undefined);
    });

    it('the path does not require the end path separator', () => {
      expect(resolver.resolve("file1.js", ["c:\\js"])).toBe("c:\\js\\file1.js");
      expect(resolver.resolve("file1.css", ["c:\\css"])).toBe("c:\\css\\file1.css");
    });

    it('looks through the path', () => {
      expect(resolver.resolve("file1.js", ["c:\\js\\", "c:\\css\\"])).toBe("c:\\js\\file1.js");
      expect(resolver.resolve("file1.css", ["c:\\js\\", "c:\\css\\"])).toBe("c:\\css\\file1.css");
    });

    it('respects the order of the path', () => {
      expect(resolver.resolve("file1.js", ["c:\\js\\", "c:\\css\\", "c:\\all\\"])).toBe("c:\\js\\file1.js");
      expect(resolver.resolve("file1.css", ["c:\\js\\", "c:\\css\\", "c:\\all\\"])).toBe("c:\\css\\file1.css");
    });

    it('works with files without extension (if set in config)', () => {
      expect(resolver.resolve("file1", ["c:\\js\\", "c:\\css\\"], ".js")).toBe("c:\\js\\file1.js");
    });

  });
});
