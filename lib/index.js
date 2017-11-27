'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultOptions = undefined;
exports.transformImportsInline = transformImportsInline;

var _path = require('path');

var _transform = require('./transform');

var _transform2 = _interopRequireDefault(_transform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultOptions = exports.defaultOptions = {
  baseDir: '/static',
  extensions: ['.gif', '.jpeg', '.jpg', '.png', '.svg']
};

var applyTransform = function applyTransform(p, t, state, value, calleeName) {
  var ext = (0, _path.extname)(value);
  var options = Object.assign({}, defaultOptions, state.opts);

  if (options.extensions && options.extensions.indexOf(ext) >= 0) {
    var dir = (0, _path.dirname)((0, _path.resolve)(state.file.opts.filename));
    var absPath = (0, _path.resolve)(dir, value);

    (0, _transform2.default)(p, t, state, options, absPath, calleeName);
  }
};

function transformImportsInline(_ref) {
  var t = _ref.types;

  return {
    visitor: {
      ImportDeclaration: function ImportDeclaration(p, state) {
        applyTransform(p, t, state, p.node.source.value, 'import');
      },
      CallExpression: function CallExpression(p, state) {
        var callee = p.get('callee');
        if (!callee.isIdentifier() || !callee.equals('name', 'require')) {
          return;
        }

        var arg = p.get('arguments')[0];
        if (!arg || !arg.isStringLiteral()) {
          return;
        }

        applyTransform(p, t, state, arg.node.value, 'require');
      }
    }
  };
}

exports.default = transformImportsInline;