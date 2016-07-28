var common = require('./common');
var os = require('os');
var fs = require('fs');
var path = require('path');

var mktemp;

function getMktemp() {
  if (!mktemp) mktemp = require('./mktemp');
  return mktemp;
}

common.register('tempdir', _tempDir);

// Returns false if 'dir' is not a writeable directory, 'dir' otherwise
function writeableDir(dir) {
  if (!dir || !fs.existsSync(dir))
    return false;

  if (!fs.statSync(dir).isDirectory())
    return false;

  try {
    getMktemp()({ dryRun: true }, path.resolve(dir, 'tmp.shelljs.XXXXXXXXXX'));
    return dir;
  } catch (e) {
    return false;
  }
}


//@
//@ ### tempdir()
//@
//@ Examples:
//@
//@ ```javascript
//@ var tmp = tempdir(); // "/tmp" for most *nix platforms
//@ ```
//@
//@ Searches and returns string containing a writeable, platform-dependent temporary directory.
//@ Follows Python's [tempfile algorithm](http://docs.python.org/library/tempfile.html#tempfile.tempdir).
function _tempDir() {
  var state = common.state;
  if (state.tempDir)
    return state.tempDir; // from cache

  state.tempDir = writeableDir(os.tmpdir && os.tmpdir()) || // node 0.10+
                  writeableDir(os.tmpDir && os.tmpDir()) || // node 0.8+
                  writeableDir(process.env['TMPDIR']) ||
                  writeableDir(process.env['TEMP']) ||
                  writeableDir(process.env['TMP']) ||
                  writeableDir(process.env['Wimp$ScrapDir']) || // RiscOS
                  writeableDir('C:\\TEMP') || // Windows
                  writeableDir('C:\\TMP') || // Windows
                  writeableDir('\\TEMP') || // Windows
                  writeableDir('\\TMP') || // Windows
                  writeableDir('/tmp') ||
                  writeableDir('/var/tmp') ||
                  writeableDir('/usr/tmp') ||
                  writeableDir('.'); // last resort

  return state.tempDir;
}
module.exports = _tempDir;
