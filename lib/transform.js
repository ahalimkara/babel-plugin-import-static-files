'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getHash(str) {
  return _crypto2.default.createHash('sha1').update(str, 'utf8').digest('hex').slice(0, 8);
}

function getFile(state, absPath, opts) {
  var root = (opts.replaceExtendDir ? '' + state.file.opts.sourceRoot + opts.replaceExtendDir : state.file.opts.sourceRoot) || process.cwd();
  var file = absPath.replace(root, '');

  if (opts.baseDir) {
    file = _path2.default.join(opts.baseDir, file);
    _fsExtra2.default.copySync(absPath, _path2.default.join(root, file));
  }

  return '/' + file.replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/^\/+/g, '');
}

var getVariableName = function getVariableName(p) {
  if (p.node.specifiers && p.node.specifiers[0] && p.node.specifiers[0].local) {
    return p.node.specifiers[0].local.name;
  }
};

exports.default = function (p, t, state, opts, absPath, calleeName) {
  var file = getFile(state, absPath, opts);
  var hash = '';

  if (opts.hash === 1) {
    var content = _fsExtra2.default.readFileSync(absPath, 'utf8').trim();
    hash = '?' + getHash(content);
  }

  var uri = '' + (opts.baseUri || '') + file + hash;

  if (calleeName === 'require') {
    p.replaceWith(t.StringLiteral(uri));
    return;
  }

  var variableName = getVariableName(p);
  if (variableName) {
    p.replaceWith(t.variableDeclaration('const', [t.variableDeclarator(t.identifier(variableName), t.stringLiteral(uri))]));
  }
};