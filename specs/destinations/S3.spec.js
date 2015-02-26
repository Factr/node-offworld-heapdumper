var AWS = require("aws-sdk");
var S3UploadStream = require("s3-upload-stream");
var fs = require("fs");

var S3Destination = require("../../destinations/S3");
var expect = require("chai").expect;
var sinon = require("sinon");
var EventEmitter = require("events").EventEmitter;

describe("S3World", function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });
  afterEach(function() {
    sandbox.restore();
  });

  describe("constructor", function() {
    it("should throw if bucket is not provided", function (){
      var noBucket = function() {
        new S3Destination({});
      };

      var noOptions = function() {
        new S3Destination({});
      };

      expect(noBucket).to.throw(Error, "heapdump-offworld-S3: bucket is a required option");
      expect(noOptions).to.throw(Error, "heapdump-offworld-S3: bucket is a required option");
    });
    it("should default to sensible config defaults", function() {
      var s3 = new S3Destination({bucket:"keeping-up-appearances"});
      expect(s3).to.have.property("options");
      expect(s3.options).to.have.property("region", "us-east-1");
      expect(s3.options).to.have.property("acl", "private");
      expect(s3.options).to.have.property("keyPrefix", "");
    });
    it("should pass AWS access creds to the S3 constructor if supplied", function(done) {
      sandbox.stub(AWS,"S3", function(opts) {
        expect(opts).to.exist;
        expect(opts).to.have.property("sessionToken", "ABCDEF");
        expect(opts).to.have.property("accessKeyId", "KEY123");
        expect(opts).to.have.property("secretAccessKey", "SECRET123");
        done();
      });

      var s3Opts = {
        "sessionToken": "ABCDEF",
        "accessKeyId": "KEY123",
        "secretAccessKey": "SECRET123",
        "bucket": "not-for-kicking"
      };

      new S3Destination(s3Opts);
    });
    it("should pass AWS region to the S3 constructor", function(done) {
      sandbox.stub(AWS,"S3", function(opts) {
        expect(opts).to.exist;
        expect(opts).to.have.property("region", "us-west-1");
        done();
      });

      var s3Opts = {
        "region": "us-west-1",
        "bucket": "not-for-kicking"
      };

      new S3Destination(s3Opts);
    });
  });

  function stubUploadFunction(stubEventEmitter, fileStreamEventEmitter, error, details) {
    if (S3UploadStream.prototype.upload.restore) {
      S3UploadStream.prototype.upload.restore();
    }
    var eventToTrigger = !!error ? "error" : "uploaded";
    var eventParam = error || details;
    sandbox.stub(S3UploadStream.prototype, "upload", function() {
      fileStreamEventEmitter.on("end", function() {
        stubEventEmitter.emit(eventToTrigger, eventParam);
      });

      stubEventEmitter.hello = "moto";
      return stubEventEmitter;
    });
  }

  function stubFileStream(stubEventEmitter, error) {
    if (fs.createReadStream.restore) {
      fs.createReadStream.restore();
    }

    var eventToTrigger = !!error ? "error" : "end";

    stubEventEmitter.pipe = function() {
      stubEventEmitter.emit(eventToTrigger, error);
    };

    sandbox.stub(fs, "createReadStream").returns(stubEventEmitter);
  }

  describe("save", function() {
    var fakeUploadResult = {};
    var stubEventEmitterForFileStream, stubEventEmitterForUploadStream;
    beforeEach(function() {
      stubEventEmitterForFileStream = new EventEmitter();
      stubFileStream(stubEventEmitterForFileStream, null);

      stubEventEmitterForUploadStream = new EventEmitter();
      stubUploadFunction(stubEventEmitterForUploadStream, stubEventEmitterForFileStream, null, fakeUploadResult);
    });
    it("should throw if heapdumpPath is not provided", function() {
      var nullPath = function() {
        var s3 = new S3Destination({bucket:"keeping-up-appearances"});
        s3.save(null, "dFile");
      };

      expect(nullPath).to.throw(Error, "A valid heapdumpPath must be provided");
    });
    it("should throw if destinationFilename is not provided", function() {
      var nullDestination = function() {
        var s3 = new S3Destination({bucket:"keeping-up-appearances"});
        s3.save("heapPath", null);
      }

      var missingDestination = function() {
        var s3 = new S3Destination({bucket:"keeping-up-appearances"});
        s3.save("heapPath");
      }

      expect(nullDestination).to.throw(Error, "A destinationFilename must be provided");
      expect(missingDestination).to.throw(Error, "A destinationFilename must be provided");
    });
    it("should prepend the keyPrefix to the destinationFilename and pass it in as key", function(done) {
      var s3 = new S3Destination({bucket:"keeping-up-appearances", keyPrefix: "not_prix_fixe/"});
      s3.save("heapPath", "key", function() {
        expect(S3UploadStream.prototype.upload).to.have.been.calledOnce;
        var spyCall = S3UploadStream.prototype.upload.getCall(0);
        var opts = spyCall.args[0];
        expect(opts).to.exist;
        expect(opts).to.be.a("object");
        expect(opts).to.have.property("Key", "not_prix_fixe/key");
        done();
      });
    });
    it("should use the supplied properties to upload to S3", function (done){
      var s3 = new S3Destination({bucket:"hole-in-my", keyPrefix: "not_prix_fixe/", acl:"public"});
      s3.save("heapPath", "key", function() {
        expect(S3UploadStream.prototype.upload).to.have.been.calledOnce;
        var spyCall = S3UploadStream.prototype.upload.getCall(0);
        var opts = spyCall.args[0];
        expect(opts).to.exist;
        expect(opts).to.be.a("object");
        expect(opts).to.have.property("Bucket", "hole-in-my");
        expect(opts).to.have.property("ACL", "public");
        done();
      });
    });
    it("should send a good content-type to S3", function (done){
      var s3 = new S3Destination({bucket:"hole-in-my", keyPrefix: "not_prix_fixe/"});
      s3.save("heapPath", "key", function() {
        expect(S3UploadStream.prototype.upload).to.have.been.calledOnce;
        var spyCall = S3UploadStream.prototype.upload.getCall(0);
        var opts = spyCall.args[0];
        expect(opts).to.exist;
        expect(opts).to.be.a("object");
        expect(opts).to.have.property("ContentType", "application/octet-stream");
        done();
      });
    });
    it("should call the supplied call back with the S3 info when the upload succeeds", function(done) {
      var s3 = new S3Destination({bucket:"hole-in-my"});
      s3.save("heapPath", "key", function(err, details) {
        expect(err).to.not.exist;
        expect(details).to.equal(fakeUploadResult);
        done();
      });
    });
    it("should call the supplied call back with an error when the upload fails", function(done) {
      var expectedError = new Error();
      stubUploadFunction(stubEventEmitterForUploadStream, stubEventEmitterForFileStream, expectedError, null);

      var s3 = new S3Destination({bucket:"hole-in-my"});
      s3.save("heapPath", "key", function(err, details) {
        expect(err).to.equal(expectedError);
        expect(details).not.to.exist;
        done();
      });
    });
    it("should call the supplied call back with an error when the heapdump file on disk can't be read", function(done) {
      var expectedError = new Error("TESTY");
      stubFileStream(stubEventEmitterForFileStream, expectedError);

      var s3 = new S3Destination({bucket:"hole-in-my"});
      s3.save("heapPath", "key", function(err, details) {
        expect(err).to.equal(expectedError);
        expect(details).not.to.exist;
        done();
      });
    });
  });
});