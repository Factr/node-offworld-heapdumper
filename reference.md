#Index

**Classes**

* [class: OffWorldHeapDumper](#OffWorldHeapDumper)
  * [new OffWorldHeapDumper(destination)](#new_OffWorldHeapDumper)
  * [OffWorldHeapDumper.Destinations](#OffWorldHeapDumper.Destinations)
  * [offWorldHeapDumper.writeSnapshot(options, cb)](#OffWorldHeapDumper#writeSnapshot)
* [class: S3World](#S3World)
  * [new S3World(options)](#new_S3World)
  * [s3World.save(heapdumpPath, destinationFilename, cb)](#S3World#save)
 
<a name="OffWorldHeapDumper"></a>
#class: OffWorldHeapDumper
**Members**

* [class: OffWorldHeapDumper](#OffWorldHeapDumper)
  * [new OffWorldHeapDumper(destination)](#new_OffWorldHeapDumper)
  * [OffWorldHeapDumper.Destinations](#OffWorldHeapDumper.Destinations)
  * [offWorldHeapDumper.writeSnapshot(options, cb)](#OffWorldHeapDumper#writeSnapshot)

<a name="new_OffWorldHeapDumper"></a>
##new OffWorldHeapDumper(destination)
Responsible for taking heap dumps, transporting them off-world to exotic destinations. Like Amazon S3.

**Params**

- destination  - a configured destination object, probably S3 at the moment. TODO: Link to S3  

<a name="OffWorldHeapDumper.Destinations"></a>
##OffWorldHeapDumper.Destinations
Access to the Destinations included in offworld-heapdumper. The available properties are:
* S3: [S3World](#S3World)

**Type**: `Object`  
<a name="OffWorldHeapDumper#writeSnapshot"></a>
##offWorldHeapDumper.writeSnapshot(options, cb)
Call this method to create a heapdump and save it to the destination specified in the [OffWorldHeapDumper](#OffWorldHeapDumper) constructor.

**Params**

- options `object` - (optional)  An options object containing:
    - destinationFilename (optional) - defaults to a filename derived from the current UTC date: `YYYYMMDD_HHmmss.heapdump`  
- cb `function` - A callback of the form function(err, details):
    - err - any error that occured during the save and upload process
    - details - if successful, this contains the result of the upload. The exact format depends on the `Destination`.  

<a name="S3World"></a>
#class: S3World
**Members**

* [class: S3World](#S3World)
  * [new S3World(options)](#new_S3World)
  * [s3World.save(heapdumpPath, destinationFilename, cb)](#S3World#save)

<a name="new_S3World"></a>
##new S3World(options)
Use this to upload a heapdump to S3.

The details object provided in the [writeSnapshot](#OffWorldHeapDumper#writeSnapshot) callback is of the form:
TODO: Document details (from s3-upload-stream)

**Params**

- options  - (required)
An object containing the following options:
* bucket (required),
* acl (default: private),
* region (default: us-east-1),
* accessKeyId,
* secretAccessKey,
* sessionToken,
* keyPrefix  

<a name="S3World#save"></a>
##s3World.save(heapdumpPath, destinationFilename, cb)
**Params**

- heapdumpPath  - (required) The path of headdump to transport off world  
- destinationFilename  - (required) The filename of the file on the external world.  
- cb  - An optional callback with two params:
           err - contains an error object if something went wrong,
           data - information about the saved heapdump  

