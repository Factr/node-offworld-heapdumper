#Index

**Classes**

* [class: OffWorldHeapDumper](#OffWorldHeapDumper)
  * [new OffWorldHeapDumper(destination)](#new_OffWorldHeapDumper)
  * [OffWorldHeapDumper.Destinations](#OffWorldHeapDumper.Destinations)
  * [offWorldHeapDumper.writeSnapshot(options, cb)](#OffWorldHeapDumper#writeSnapshot)
* [class: S3World](#S3World)
  * [new S3World(options)](#new_S3World)
  * [s3World.transport(heapdumpPath, destinationFilename, cb)](#S3World#transport)
  * [type: S3World~s3Data](#S3World..s3Data)
 
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

- destination  - a configured destination object, probably S3 at the moment. See [S3World](#S3World).  

<a name="OffWorldHeapDumper.Destinations"></a>
##OffWorldHeapDumper.Destinations
Access to the Destinations included in offworld-heapdumper. The available properties are:
* S3: [S3World](#S3World)

**Type**: `Object`  
<a name="OffWorldHeapDumper#writeSnapshot"></a>
##offWorldHeapDumper.writeSnapshot(options, cb)
Call this method to asyncronously create a heapdump and save it to the destination specified in
the [OffWorldHeapDumper](#OffWorldHeapDumper) constructor.

**Params**

- options `object` - (optional)  An options object containing:
    - destinationFilename (optional) - defaults to a filename derived from the current UTC date:
    `YYYYMMDD_HHmmss.heapdump`  
- cb `function` - A callback of the form function(err, details):
    - err - any error that occured during the save and upload process
    - details - if successful, this contains the result of the upload. The exact format depends on the `Destination`.  

<a name="S3World"></a>
#class: S3World
**Members**

* [class: S3World](#S3World)
  * [new S3World(options)](#new_S3World)
  * [s3World.transport(heapdumpPath, destinationFilename, cb)](#S3World#transport)
  * [type: S3World~s3Data](#S3World..s3Data)

<a name="new_S3World"></a>
##new S3World(options)
Use this to upload a heapdump to S3.

The details object provided in the [writeSnapshot](#OffWorldHeapDumper#writeSnapshot) callback is of the form:

    {
      Location: 'https://bucketName.s3.amazonaws.com/filename.ext',
      Bucket: 'bucketName',
      Key: 'filename.ext',
      ETag: '"bf2acbedf84207d696c8da7dbb205b9f-5"'
    }

**Params**

- options  - (required)
An object containing the following options:
    * bucket (required),
    * acl (default: `private`)
    * region (default: `us-east-1`),
    * keyPrefix (default: `""`) - prepended to the destination filename on S3. If this ends with a `/`,
      it will act as a directory
    * accessKeyId (default: taken from standard AWS configuration -
      see [AWS SDK Configuration Options](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html)),
    * secretAccessKey (default: taken from standard AWS configuration -
      see [AWS SDK Configuration Options](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html)),
    * sessionToken (default: taken from standard AWS configuration -
      see [AWS SDK Configuration Options](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html))  

<a name="S3World#transport"></a>
##s3World.transport(heapdumpPath, destinationFilename, cb)
Asyncronously transports the heapdump to S3, calling the optional callback when it is done.

**Params**

- heapdumpPath  - (required) The path of headdump to transport off world  
- destinationFilename  - (required) The filename of the file on the external world.  
- cb  - An optional callback with two params:
    * err - contains an error object if something went wrong,
    * data - information about the saved heapdump. See [s3Data](#S3World..s3Data)  

<a name="S3World..s3Data"></a>
##type: S3World~s3Data
**Properties**

- Location `string` - The url of the saved file on S3  
- Bucket `string` - The bucket the file was saved into  
- Key `string` - The 'key' that the file was saved as  
- ETag `string` - The saved file's e-tag  

**Scope**: inner typedef of [S3World](#S3World)  
**Type**: `Object`  
