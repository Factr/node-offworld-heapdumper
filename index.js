var tmp             = require("tmp"),
    heapdump        = require("heapdump"),
    moment          = require("moment"),
    util            = require("util"),
    _               = require("underscore"),
    fs              = require("fs");

function HeapDumpOffWorld(world) {
  if (!world) {
    throw new Error("You must provide a World instance such as S3");
  }
  this.world = world;
}

function createDefaultDestinationFilename() {
  return util.format("%s.heapdump", moment().utc().format("YYYYMMDD_HHmmss"));
}

HeapDumpOffWorld.prototype.writeSnapshot = function(options, cb) {
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

      that.world.save(path, options.destinationFilename, function(err, details) {
        fs.unlink(path, function(){
          cb(err, details);
        })
      });
    });
  });
};

HeapDumpOffWorld.Destinations = {
  S3: require("./destinations/S3")
};

module.exports = HeapDumpOffWorld;