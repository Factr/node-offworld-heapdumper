# heapdump-offworld

An NPM module that makes it easy to save NodeJS heapdumps to an external storage service (starting with Amazon S3).
Useful for troubleshooting memory issues on PaaS environments such as Heroku.

[![build status](https://secure.travis-ci.org/Factr/node-heapdump-offworld.svg)](http://travis-ci.org/Factr/node-heapdump-offworld)
[![Coverage Status](https://coveralls.io/repos/Factr/node-heapdump-offworld/badge.svg)](https://coveralls.io/r/Factr/node-heapdump-offworld)
[![dependency status](https://david-dm.org/Factr/node-heapdump-offworld.svg)](https://david-dm.org/Factr/node-heapdump-offworld)

## Installation

```
npm install node-heapdump-offworld --save
```

## Usage

At some point, there might be multiple `Destinations` for your heapdump, but for now there is only Amazon S3. The
following examples will be using S3.

### Let's start with a simple example

#### Uploading to S3 with minimal configuration

In this scenario, we push the heapdump to the S3 bucket of your choice with default settings, which are:

* An `ACL` of `private`
* A name derived from the current time (UTC) i.e. `20150101_153454.heapdump`
* S3 Authentication credentials taken from [standard AWS SDK Configuration options](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html).

##### Code
    var HeapdumpOffworld = require("heapdump-offworld");
    var S3Destination = HeapdumpOffworld.Destinations.S3;

    var destination = new S3Destination({bucket:"hyacinth"});
    var heapdumper = new HeapdumpOffworld(destination);

    heapdumper.writeSnapshot(function(err, details) {
        if (err) throw err;

        //details contains:
        // TODO: What does details contain?
    });

## TODO: Other examples: multi environment using KeyPrefix

##Reference

See the [reference](reference.md) for a full description of how to use this module.

## Credits
[Adam Creeger](https://github.com/acreeger/)
