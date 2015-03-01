///**
// * Offworld Heapdumper
// * @module offworld-heapdumper
// * @type {exports}
// */

var tmp             = require("tmp"),
    heapdump        = require("heapdump"),
    moment          = require("moment"),
    util            = require("util"),
    _               = require("underscore"),
    fs              = require("fs");

/**
 * Responsible for taking heap dumps, transporting them off-world to exotic destinations. Like Amazon S3.
 * @param destination - a configured destination object, probably S3 at the moment. TODO: Link to S3
 * @constructor
 */
function OffWorldHeapDumper(destination) {
  if (!destination) {
    throw new Error("You must provide a World instance such as S3");
  }
  this.destination = destination;
}

function createDefaultDestinationFilename() {
  return util.format("%s.heapdump", moment().utc().format("YYYYMMDD_HHmmss"));
}

/**
 * Call this method to create a heapdump and save it to the destination specified in the {@link OffWorldHeapDumper}
 * constructor.
 * @param options (optional) {object} An options object containing:
 *     - destinationFilename (optional) - defaults to a filename derived from the current UTC date:
 *     `YYYYMMDD_HHmmss.heapdump`
 * @param cb {function} A callback of the form function(err, details):
 *     - err - any error that occured during the save and upload process
 *     - details - if successful, this contains the result of the upload. The exact format depends on the `Destination`.
 */
OffWorldHeapDumper.prototype.writeSnapshot = function(options, cb) {
  if (typeof options === "function") {
    cb = options;
    options = {};
  }
  cb = cb || function() {};
  var that = this;
  var defaults = {
    destinationFilename: createDefaultDestinationFilename()
  };
  
  options = _.extend({}, defaults, options);

  tmp.tmpName(function(err, path) {
    if (err) return cb(err);

    heapdump.writeSnapshot(path, function(err) {
      if (err) return cb(err);

      that.destination.save(path, options.destinationFilename, function(err, details) {
        fs.unlink(path, function(){
          cb(err, details);
        })
      });
    });
  });
};

/**
 * Access to the Destinations included in offworld-heapdumper. The available properties are:
 * * S3: {@link S3World}
 * @type {{S3: (S3World|exports)}}
 */
OffWorldHeapDumper.Destinations = {
  S3: require("./destinations/S3")
};

module.exports = OffWorldHeapDumper;