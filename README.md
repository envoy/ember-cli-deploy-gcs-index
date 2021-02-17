# ember-cli-deploy-gcs-index [![Build Status](https://travis-ci.org/envoy/ember-cli-deploy-gcs-index.svg?branch=master)](https://travis-ci.org/envoy/ember-cli-deploy-gcs-index)


> An ember-cli-deploy plugin to deploy ember-cli's bootstrap index file to [Google Cloud Storage](https://cloud.google.com/storage/).

This plugin uploads a file, presumably index.html, to a specified
GCS-bucket. It follows the same strategy as
[ember-cli-deploy-s3-index](https://github.com/ember-cli-deploy/ember-cli-deploy-s3-index).

More often than not this plugin will be used in conjunction with the [lightning method of deployment][1] where the ember application assets will be served from GCS and the index.html file will also be served from GCS.

## What is an ember-cli-deploy plugin?

A plugin is an addon that can be executed as a part of the ember-cli-deploy pipeline. A plugin will implement one or more of the ember-cli-deploy's pipeline hooks.

For more information on what plugins are and how they work, please refer to the [Plugin Documentation][2].

## Quick Start
To get up and running quickly, do the following:

- Ensure [ember-cli-deploy-build][4] is installed and configured.
- Ensure [ember-cli-deploy-revision-data][6] is installed and configured.
- Ensure [ember-cli-deploy-display-revisions](https://github.com/duizendnegen/ember-cli-deploy-display-revisions) is installed and configured.

- Install this plugin

```bash
$ ember install ember-cli-deploy-gcs-index
```

- Place the following configuration into `config/deploy.js`

```javascript
ENV['gcs-index'] = {
  projectId: '<your-gcs-project-id>',
  keyFilename: 'path-to-your-JSON-key-file',
  bucket: '<your-bucket-name>'
}
```

- Run the pipeline

```bash
$ ember deploy
```

## ember-cli-deploy Hooks Implemented

For detailed information on what plugin hooks are and how they work, please refer to the [Plugin Documentation][2].

- `configure`
- `upload`
- `activate`
- `fetchRevisions`

## Configuration Options


For detailed information on how configuration of plugins works, please refer to the [Plugin Documentation][2].

### projectId

The Google Cloud project ID.

*Default:* `undefined`

### keyFilename

This assumes you are not deploying on Google Compute Engine, so you need to pass your service account JSON credential. See [configuring gcloud-node](https://github.com/GoogleCloudPlatform/gcloud-node#elsewhere).

*Default:* `undefined`

### bucket (`required`)

The GCS bucket that the files will be uploaded to.

*Default:* `undefined`


### prefix

A directory within the `bucket` that the files should be uploaded in to.

*Default:* `''`

### filePattern

A file matching this pattern will be uploaded to GCS. The active key in GCS will be a combination of the `bucket`, `prefix`, `filePattern`. The versioned keys will have `revisionKey` appended.

*Default:* `'index.html'`

### acl

The ACL to apply to the objects.

*Default:* `'public-read'`

### distDir

The root directory where the file matching `filePattern` will be searched for. By default, this option will use the `distDir` property of the deployment context.

*Default:* `context.distDir`

### revisionKey

The unique revision number for the version of the file being uploaded to GCS. The key will be a combination of the `keyPrefix` and the `revisionKey`. By default this option will use either the `revision` passed in from the command line or the `revisionData.revisionKey` property from the deployment context.

*Default:* `context.commandOptions.revision || context.revisionData.revisionKey`

### allowOverwrite

A flag to specify whether the revision should be overwritten if it already exists in GCS.

*Default:* `false`

### makePublic

A flag to make the `index.html` file public.

*Default:* `true`

### How do I activate a revision?

A user can activate a revision by either:

- Passing a command line argument to the `deploy` command:

```bash
$ ember deploy --activate=true
```

- Running the `deploy:activate` command:

```bash
$ ember deploy:activate --revision <revision-key>
```

- Setting the `activateOnDeploy` flag in `deploy.js`

```javascript
ENV.pipeline = {
  activateOnDeploy: true
}
```

### What does activation do?

When *ember-cli-deploy-gcs-index* uploads a file to GCS, it uploads it
under the key defined by a combination of the four config properties
`bucket`, `prefix`, `filePattern` and `revisionKey`.

So, if the `filePattern` was configured to be `index.html` and there
had been a few revisons deployed, then your bucket might look
something like this:

```bash
                           PRE assets/
2015-09-27 07:25:26        585 crossdomain.xml
2015-09-27 07:47:42       1207 index.html
2015-09-27 07:25:51       1207 index.html:a644ba43cdb987288d646c5a97b1c8a9
2015-09-27 07:20:27       1207 index.html:61cfff627b79058277e604686197bbbd
2015-09-27 07:19:11       1207 index.html:9dd26dbc8f3f9a8a342d067335315a63
```

Activating a revision would copy the content of the passed revision to
`index.html` which is used to host your ember application via the
[static web hosting](https://cloud.google.com/storage/docs/website-configuration)
feature built into GCS.

```bash
$ ember deploy:activate --revision a644ba43cdb987288d646c5a97b1c8a9
```

### When does activation occur?

Activation occurs during the `activate` hook of the pipeline. By default, activation is turned off and must be explicitly enabled by one of the 3 methods above.

## Prerequisites

The following properties are expected to be present on the deployment `context` object:

- `distDir`                     (provided by [ember-cli-deploy-build][4])
- `project.name()`              (provided by [ember-cli-deploy][5])
- `revisionKey`                 (provided by [ember-cli-deploy-revision-data][6])
- `commandLineArgs.revisionKey` (provided by [ember-cli-deploy][5])
- `deployEnvironment`           (provided by [ember-cli-deploy][5])

## Using History-Location
You can deploy your Ember application to GCS and still use the
history-api for pretty URLs. To achieve this set `index.html` as the
[error page](https://cloud.google.com/storage/docs/website-configuration#step4).

![Index and error page](https://s3.amazonaws.com/f.cl.ly/items/2w0s2J3l343O3n472e0Z/conf.png?v=969598a5)


## Running Tests

- `npm test`

[1]: https://github.com/lukemelia/ember-cli-deploy-lightning-pack "ember-cli-deploy-lightning-pack"
[2]: http://ember-cli.github.io/ember-cli-deploy/plugins "Plugin Documentation"
[3]: https://www.npmjs.com/package/redis "Redis Client"
[4]: https://github.com/ember-cli-deploy/ember-cli-deploy-build "ember-cli-deploy-build"
[5]: https://github.com/ember-cli/ember-cli-deploy "ember-cli-deploy"sh1
[6]: https://github.com/ember-cli-deploy/ember-cli-deploy-revision-data "ember-cli-deploy-revision-data"
