# offworld-heapdumper

An NPM module that makes it easy to save NodeJS heapdumps to an external storage service (starting with Amazon S3).
Useful for troubleshooting memory issues on PaaS environments such as Heroku.

[![build status](https://secure.travis-ci.org/Factr/node-offworld-heapdumper.svg)](http://travis-ci.org/Factr/node-offworld-heapdumper)
[![Coverage Status](https://coveralls.io/repos/Factr/node-offworld-heapdumper/badge.svg?branch=master)](https://coveralls.io/r/Factr/node-offworld-heapdumper?branch=master)
[![dependency status](https://david-dm.org/Factr/node-offworld-heapdumper.svg)](https://david-dm.org/Factr/node-offworld-heapdumper)

## Installation

```
npm install node-offworld-heapdumper --save
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
    var HeapdumpOffworld = require("offworld-heapdumper");
    var S3Destination = HeapdumpOffworld.Destinations.S3;

    var destination = new S3Destination({bucket:"hyacinth"});
    var heapdumper = new HeapdumpOffworld(destination);

    heapdumper.writeSnapshot(function(err, details) {
        if (err) throw err;

        //Since we're using S3 as the destination, the details parameter contains:
        {
           Location: 'https://bucketName.s3.amazonaws.com/filename.ext',
           Bucket: 'bucketName',
           Key: 'filename.ext',
           ETag: '"bf2acbedf84207d696c8da7dbb205b9f-5"'
        }
    });

##### Other examples:

TODO: multi environment using KeyPrefix

## Reference

See the [reference](reference.md) for a full description of how to use this module.

## Credits
[Adam Creeger](https://github.com/acreeger/)
