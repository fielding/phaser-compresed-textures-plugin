/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @author       Fielding Johnston <fielding@justfielding.com> - Simply packaged the great work Rich had already done as a plugin for Phaser 3.24.1
 * @copyright    2021 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

import BinaryFile from 'phaser/src/loader/filetypes/BinaryFile';
import Class from 'phaser/src/utils/Class';
import JSONFile from 'phaser/src/loader/filetypes/JSONFile';
import GetFastValue from 'phaser/src/utils/object/GetFastValue';

import MultiFile from './MultiFile';
import KTXParser from './KTXParser';
import PVRParser from './PVRParser';

/**
 * @classdesc
 * A Compressed Texture File suitable for loading by the Loader.
 *
 * These are created when you use the Phaser.Loader.LoaderPlugin#texture method and are not typically created directly.
 *
 * For documentation about what all the arguments and configuration options mean please see Phaser.Loader.LoaderPlugin#texture.
 *
 * @class CompressedTextureFile
 * @extends Phaser.Loader.MultiFile
 * @memberof Phaser.Loader.FileTypes
 * @constructor
 *
 * @param {Phaser.Loader.LoaderPlugin} loader - A reference to the Loader that is responsible for this file.
 * @param {string} key - The key to use for this file.
 * @param {Phaser.Types.Loader.FileTypes.CompressedTextureFileEntry} entry - The compressed texture file entry to load.
 * @param {Phaser.Types.Loader.XHRSettingsObject} [xhrSettings] - Extra XHR Settings specifically for this file.
 */

var CompressedTextureFile = new Class({
  Extends: MultiFile,

  initialize: function CompressedTextureFile(loader, key, entry, xhrSettings) {
    if (entry.multiAtlasURL) {
      var multi = new JSONFile(loader, {
        key: key,
        url: entry.multiAtlasURL,
        xhrSettings: xhrSettings,
        config: entry,
      });

      MultiFile.call(this, loader, 'texture', key, [multi]);
    } else {
      var extension = entry.textureURL.substr(entry.textureURL.length - 3);

      if (!entry.type) {
        entry.type = extension.toLowerCase() === 'ktx' ? 'KTX' : 'PVR';
      }

      var image = new BinaryFile(loader, {
        key: key,
        url: entry.textureURL,
        extension: extension,
        xhrSettings: xhrSettings,
        config: entry,
      });

      if (entry.atlasURL) {
        var data = new JSONFile(loader, {
          key: key,
          url: entry.atlasURL,
          xhrSettings: xhrSettings,
          config: entry,
        });

        MultiFile.call(this, loader, 'texture', key, [image, data]);
      } else {
        MultiFile.call(this, loader, 'texture', key, [image]);
      }
    }

    this.config = entry;
  },

  /**
   * Called by each File when it finishes loading.
   *
   * @method Phaser.Loader.FileTypes.CompressedTextureFile#onFileComplete
   *
   * @param {Phaser.Loader.File} file - The File that has completed processing.
   */
  onFileComplete: function (file) {
    var index = this.files.indexOf(file);

    if (index !== -1) {
      this.pending--;

      if (!this.config.multiAtlasURL) {
        return;
      }

      if (file.type === 'json' && file.data.hasOwnProperty('textures')) {
        //  Inspect the data for the files to now load
        var textures = file.data.textures;

        var config = this.config;
        var loader = this.loader;

        var currentBaseURL = loader.baseURL;
        var currentPath = loader.path;
        var currentPrefix = loader.prefix;

        var baseURL = GetFastValue(config, 'multiBaseURL', this.baseURL);
        var path = GetFastValue(config, 'multiPath', this.path);
        var prefix = GetFastValue(config, 'prefix', this.prefix);
        var textureXhrSettings = GetFastValue(config, 'textureXhrSettings');

        if (baseURL) {
          loader.setBaseURL(baseURL);
        }

        if (path) {
          loader.setPath(path);
        }

        if (prefix) {
          loader.setPrefix(prefix);
        }

        for (var i = 0; i < textures.length; i++) {
          //  "image": "texture-packer-multi-atlas-0.png",
          var textureURL = textures[i].image;

          var key = 'CMA' + this.multiKeyIndex + '_' + textureURL;

          var image = new BinaryFile(loader, key, textureURL, textureXhrSettings);

          this.addToMultiFile(image);

          loader.addFile(image);

          //  "normalMap": "texture-packer-multi-atlas-0_n.png",
          if (textures[i].normalMap) {
            var normalMap = new BinaryFile(loader, key, textures[i].normalMap, textureXhrSettings);

            normalMap.type = 'normalMap';

            image.setLink(normalMap);

            this.addToMultiFile(normalMap);

            loader.addFile(normalMap);
          }
        }

        //  Reset the loader settings
        loader.setBaseURL(currentBaseURL);
        loader.setPath(currentPath);
        loader.setPrefix(currentPrefix);
      }
    }
  },

  /**
   * Adds this file to its target cache upon successful loading and processing.
   *
   * @method Phaser.Loader.FileTypes.CompressedTextureFile#addToCache
   */
  addToCache: function () {
    if (this.isReadyToProcess()) {
      var entry = this.config;

      if (entry.multiAtlasURL) {
        this.addMultiToCache();
      } else {
        var renderer = this.loader.systems.renderer;
        var textureManager = this.loader.textureManager;
        var textureData;

        var image = this.files[0];
        var json = this.files[1];

        if (entry.type === 'PVR') {
          textureData = PVRParser(image.data);
        } else if (entry.type === 'KTX') {
          textureData = KTXParser(image.data);
        }

        if (textureData && renderer.supportsCompressedTexture(entry.format, textureData.internalFormat)) {
          textureData.format = renderer.getCompressedTextureName(entry.format, textureData.internalFormat);

          var atlasData = json && json.data ? json.data : null;

          textureManager.addCompressedTexture(image.key, textureData, atlasData);
        }
      }

      this.complete = true;
    }
  },

  /**
   * Adds all of the multi-file entties to their target caches upon successful loading and processing.
   *
   * @method Phaser.Loader.FileTypes.CompressedTextureFile#addMultiToCache
   */
  addMultiToCache: function () {
    var entry = this.config;
    var json = this.files[0];

    var data = [];
    var images = [];
    var normalMaps = [];

    var renderer = this.loader.systems.renderer;
    var textureManager = this.loader.textureManager;
    var textureData;

    for (var i = 1; i < this.files.length; i++) {
      var file = this.files[i];

      if (file.type === 'normalMap') {
        continue;
      }

      var pos = file.key.indexOf('_');
      var key = file.key.substr(pos + 1);

      var image = file.data;

      //  Now we need to find out which json entry this mapped to
      for (var t = 0; t < json.data.textures.length; t++) {
        var item = json.data.textures[t];

        if (item.image === key) {
          if (entry.type === 'PVR') {
            textureData = PVRParser(image);
          } else if (entry.type === 'KTX') {
            textureData = KTXParser(image);
          }

          if (textureData && renderer.supportsCompressedTexture(entry.format, textureData.internalFormat)) {
            textureData.format = renderer.getCompressedTextureName(entry.format, textureData.internalFormat);

            images.push(textureData);

            data.push(item);

            if (file.linkFile) {
              normalMaps.push(file.linkFile.data);
            }
          }

          break;
        }
      }
    }

    if (normalMaps.length === 0) {
      normalMaps = undefined;
    }

    textureManager.addAtlasJSONArray(this.key, images, data, normalMaps);

    this.complete = true;
  },
});

export default CompressedTextureFile;
