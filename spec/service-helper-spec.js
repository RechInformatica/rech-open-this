'use babel';

import ServiceHelper from '../lib/service-helper';

describe('ServiceHelper', () => {
  describe('When providing the path', () => {

    it('handles undefineds and nulls well', () => {
      new ServiceHelper([]).providePath(undefined).then((path) => expect(path).toEqual([]));
      new ServiceHelper(undefined).providePath([]).then((path) => expect(path).toEqual([]));
      new ServiceHelper(undefined).providePath(undefined).then((path) => expect(path).toEqual([]));
      new ServiceHelper([]).providePath(null).then((path) => expect(path).toEqual([]));
      new ServiceHelper(null).providePath([]).then((path) => expect(path).toEqual([]));
      new ServiceHelper(null).providePath(null).then((path) => expect(path).toEqual([]));
    });

    it('handles direct array returns', () => {
      let helper = new ServiceHelper([
        ["part 1", "part 2"]
      ]);
      helper.providePath(["original", "path"]).then((path) => expect(path).toEqual(["original", "path", "part 1", "part 2"]));
      //
      helper = new ServiceHelper([
        ["part 1", "part 2"],
        ["part 3"],
        ["part 4", "part 5"],
      ]);
      helper.providePath(["original", "path"]).then((path) => expect(path).toEqual(["original", "path", "part 1", "part 2", "part 3", "part 4", "part 5"]));
    });

    it('handles strings delimited by ; returns', () => {
      helper = new ServiceHelper([
        "part 1;part 2",
        "part 3"
      ]);
      helper.providePath(["original", "path"]).then((path) => expect(path).toEqual(["original", "path", "part 1", "part 2", "part 3"]));
    });

    it('handles functions', () => {
      let helper = new ServiceHelper([
        (path) => {
          for (var i = 1; i <= 3; i++) {
            path.push("part " + i);
          }
          return path;
        }
      ]);
      helper.providePath(["original", "path"]).then((path) => expect(path).toEqual(["original", "path", "part 1", "part 2", "part 3"]));
    });

    it('handles promises', () => {
      let helper = new ServiceHelper([
        (path) => {
          return Promise.resolve(path.concat(["part 1", "part 2"]));
        }
      ]);
      helper.providePath(["original", "path"]).then((path) => expect(path).toEqual(["original", "path", "part 1", "part 2"]));
    });

  });
});
