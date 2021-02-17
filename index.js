/* jshint node: true */
'use strict';
var DeployPluginBase = require('ember-cli-deploy-plugin');
var GCS = require('./lib/gcs');
var joinUriSegments  = require('./lib/util/join-uri-segments');

module.exports = {
  name: 'ember-cli-deploy-gcs-index',

  createDeployPlugin: function(options) {
    var DeployPlugin = DeployPluginBase.extend({
      name: options.name,
      GCS: GCS,

      defaultConfig: {
        filePattern: 'index.html',
        prefix: '',
        acl: 'public-read',
        distDir: function(context) {
          return context.distDir;
        },
        revisionKey: function(context) {
          var revisionKey = context.revisionData && context.revisionData.revisionKey;
          return context.commandOptions.revision || revisionKey;
        },
        gzippedFiles: function(context) {
          return context.gzippedFiles || [];
        },
        allowOverwrite: false,
        makePublic: true
      },

      requiredConfig: ['bucket', 'projectId'],

      upload: function(/* context */) {
        var projectId      = this.readConfig('projectId');
        var keyFilename    = this.readConfig('keyFilename');
        var bucket         = this.readConfig('bucket');
        var prefix         = this.readConfig('prefix');
        var acl            = this.readConfig('acl');
        var revisionKey    = this.readConfig('revisionKey');
        var distDir        = this.readConfig('distDir');
        var filePattern    = this.readConfig('filePattern');
        var gzippedFiles   = this.readConfig('gzippedFiles');
        var allowOverwrite = this.readConfig('allowOverwrite');
        var filePath       = joinUriSegments(distDir, filePattern);

        var options = {
          bucket: bucket,
          prefix: prefix,
          acl: acl,
          filePattern: filePattern,
          filePath: filePath,
          revisionKey: revisionKey,
          gzippedFilePaths: gzippedFiles,
          allowOverwrite: allowOverwrite
        };

        this.log('preparing to upload revision to Google Cloud Storage bucket `' + bucket + '`', { verbose: true });

        var gcs = new this.GCS({
          plugin: this,
          keyFilename: keyFilename,
          projectId: projectId
        });
        return gcs.upload(options);
      },

      activate: function(/* context */) {
        var projectId      = this.readConfig('projectId');
        var keyFilename    = this.readConfig('keyFilename');
        var bucket      = this.readConfig('bucket');
        var prefix      = this.readConfig('prefix');
        var acl         = this.readConfig('acl');
        var revisionKey = this.readConfig('revisionKey');
        var filePattern = this.readConfig('filePattern');
        var makePublic  = this.readConfig('makePublic');

        var options = {
          bucket: bucket,
          prefix: prefix,
          acl: acl,
          filePattern: filePattern,
          revisionKey: revisionKey,
          makePublic: makePublic
        };

        this.log('preparing to activate `' + revisionKey + '`', { verbose: true });

        var gcs = new this.GCS({
          plugin: this,
          keyFilename: keyFilename,
          projectId: projectId
        });
        return gcs.activate(options);
      },

      fetchRevisions: function(context) {
        return this._list(context)
          .then(function(revisions) {
            return {
              revisions: revisions
            };
          });
      },

      fetchInitialRevisions: function(context) {
        return this._list(context)
          .then(function(revisions) {
            return {
              initialRevisions: revisions
            };
          });
      },

      _list: function(/* context */) {
        var projectId      = this.readConfig('projectId');
        var keyFilename    = this.readConfig('keyFilename');
        var bucket      = this.readConfig('bucket');
        var prefix      = this.readConfig('prefix');
        var filePattern = this.readConfig('filePattern');

        var options = {
          bucket: bucket,
          prefix: prefix,
          filePattern: filePattern
        };

        var gcs = new this.GCS({
          plugin: this,
          keyFilename: keyFilename,
          projectId: projectId
        });
        return gcs.fetchRevisions(options);
      }
    });

    return new DeployPlugin();
  }
};
