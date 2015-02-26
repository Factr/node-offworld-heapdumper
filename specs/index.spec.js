var expect = require("chai").expect;
var sinon = require("sinon");
var moment = require("moment");
var util = require("util");

//Deps to mock out
var _tmp = require("tmp");
var _heapdump = require("heapdump");
var _fs = require("fs");

var HeapdumpOffworld = require("../index");
var S3World = require("../destinations/S3");

var clock;
describe("node-heapdump-offworld", function () {

  afterEach(function() {
    if (clock) clock.restore();
  });

  describe("Destinations", function() {
    it("should exist", function() {
      expect(HeapdumpOffworld).to.have.property("Destinations");
    });
    it("should have an S3 instance", function() {
      //S3World = require("../destinations/S3");
      expect(HeapdumpOffworld.Destinations).to.have.property("S3");
      expect(HeapdumpOffworld.Destinations.S3).to.equal(S3World);
    });
  });

  describe("constructor", function() {
    it("should throw when world is not provided", function() {
      var shouldThrow = function() {
        new HeapdumpOffworld();
      };

      expect(shouldThrow).to.throw(Error, "You must provide a World instance such as S3");
    });
  });
  describe("writeSnapshot", function() {
    var heapdumper;
    var clock;
    var fakeDate;
    var world;
    var sandbox; //TODO: Move higher
    var fakeDetails = {url:"blah"};
    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      world = {
        save: sandbox.stub().yields(null, fakeDetails)
      };

      sandbox.stub(_tmp, "tmpName");
      _tmp.tmpName.yields(null, "tempfilename.heapdump");

      sandbox.stub(_heapdump, "writeSnapshot");
      _heapdump.writeSnapshot.yields();

      fakeDate = new Date();
      heapdumper = new HeapdumpOffworld(world);
      clock = sandbox.useFakeTimers(fakeDate.getTime());
    });

    afterEach(function() {
      sandbox.restore();
    });

    it("should use the provided destination filename", function(done) {
      var opts = {
        destinationFilename: "destination.file"
      };

      heapdumper.writeSnapshot(opts, function() {
        expect(world.save).to.have.been.calledWith("tempfilename.heapdump", "destination.file");
        done();
      });
    });

    it("should use a default destination filename if no options are passed", function(done) {
      heapdumper.writeSnapshot(function() {
        var defaultDestinationFilename = util.format("%s.heapdump", moment(fakeDate).utc().format("YYYYMMDD_HHmmss"));
        expect(world.save).to.have.been.calledWith("tempfilename.heapdump", defaultDestinationFilename);
        done();
      });
    });
    it("should call the callback with an error if one occurs during creation of tmp file name", function(done) {
      var expectedErr = new Error();
      _tmp.tmpName.yields(expectedErr);

      heapdumper.writeSnapshot(function(err) {
        expect(err).to.equal(expectedErr);
        done();
      });
    });
    it("should call the callback with an error if one occurs during snapshot", function(done) {
      var expectedErr = new Error();
      _heapdump.writeSnapshot.yields(expectedErr);

      heapdumper.writeSnapshot(function(err) {
        expect(err).to.equal(expectedErr);
        done();
      });
    });
    it("should call the callback with an error if one occurs during save", function(done) {
      var expectedErr = new Error();
      world.save.yields(expectedErr);

      heapdumper.writeSnapshot(function(err) {
        expect(err).to.equal(expectedErr);
        done();
      });
    });
    it("should call the callback with the details of the saved file if all is good", function(done) {
      heapdumper.writeSnapshot(function(err, details) {
        expect(err).to.equal(null);
        expect(details).to.equal(fakeDetails);
        done();
      });
    });
    it("should still succeed if deleting the temp file fails", function(done) {
      var expectedErr = new Error();
      sandbox.stub(_fs,"unlink");
      _fs.unlink.yields(expectedErr);
      heapdumper.writeSnapshot(function(err, details) {
        expect(err).to.equal(null);
        expect(details).to.equal(fakeDetails);
        expect(_fs.unlink).to.have.been.calledOnce.and.calledWith("tempfilename.heapdump");
        done();
      });
    });
    it("should delete the temporary file after it is done", function(done) {
      sandbox.stub(_fs,"unlink");
      _fs.unlink.yields();
      heapdumper.writeSnapshot(function() {
        expect(_fs.unlink).to.have.been.calledOnce.and.calledWith("tempfilename.heapdump");
        done();
      });
    });
  });
});
