var AWS               = require("aws-sdk"),
    S3UploadStream    = require("s3-upload-stream"),//(new AWS.S3())
    _                 = require("underscore"),
    fs                = require("fs");

//TODO: Document each option in README.md
/***
 *
 * @param options An object containing the following options:
 *            bucket (required),
 *            acl (default: private),
 *            region (default: us-east-1),
 *            accessKeyId,
 *            secretAccessKey,
 *            sessionToken,
 *            keyPrefix
 * @constructor
 */
function S3World(options) {
  //TODO: keyPrefix that is either a string or a function
  var defaults = {
    keyPrefix: "",
    acl: "private", //TODO TEST
    region: "us-east-1"
  };
  this.options = _.extend({}, defaults, options);

  if (!options.bucket) {
    throw new Error("heapdump-offworld-S3: bucket is a required option");
  }

  var AWSConfigProps = ["sessionToken", "accessKeyId", "secretAccessKey", "region"];
  var s3Config = {};

  AWSConfigProps.forEach(function(propName) {
    if (options[propName]) {
      s3Config[propName] = options[propName];
    }
  });

  this.S3 = new AWS.S3(s3Config);
  this.s3UploadStream = new S3UploadStream(this.S3);
}

/**
 *
 * @param heapdumpPath (required) The path of headdump to transport off world
 * @param destinationFilename (required) The filename of the file on the external world.
 * @param cb An optional callback with two params:
 *            err - contains an error object if something went wrong,
 *            data - information about the saved heapdump
 */
S3World.prototype.save = function (heapdumpPath, destinationFilename, cb) {
  if (!heapdumpPath) {
    throw new Error("A valid heapdumpPath must be provided");
  }
  //TODO: check that the file exists

  if (!destinationFilename) {
    throw new Error("A destinationFilename must be provided");
  }

  cb = cb || function() {};
  var worldOptions = this.options;
  var path = heapdumpPath;
  var s3Options = {
    Bucket: worldOptions.bucket,
    Key: worldOptions.keyPrefix + destinationFilename,
    ACL: worldOptions.acl,
    ContentType: "application/octet-stream"
  };

  var upload = this.s3UploadStream.upload(s3Options);

  upload.on("uploaded", function (details) {
    cb(null, details);
  });

  upload.on("error", function (error) {
    cb(error);
  });

  var fileStream = fs.createReadStream(path);

  fileStream.on("error", function(err) {
    cb(err, null);
  });

  fileStream.pipe(upload);
};

module.exports = S3World;