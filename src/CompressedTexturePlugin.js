/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @author       Fielding Johnston <fielding@justfielding.com> - Simply packaged the great work Rich had already done as a plugin for Phaser 3.24.1
 * @copyright    2021 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */
// @ts-nocheck - todo
import AtlasJSONFile from 'phaser/src/loader/filetypes/AtlasJSONFile';
import { JSONHash } from 'phaser/src/textures/parsers/JSONHash';
import Events from 'phaser/src/textures/events';
import Merge from 'phaser/src/utils/object/Merge';
import ImageFile from 'phaser/src/loader/filetypes/ImageFile';
import IsPlainObject from 'phaser/src/utils/object/IsPlainObject';
import GetFastValue from 'phaser/src/utils/object/GetFastValue';
import MultiAtlasFile from 'phaser/src/loader/filetypes/MultiAtlasFile';
import IsSizePowerOfTwo from 'phaser/src/math/pow2/IsSizePowerOfTwo';
import CONST from 'phaser/src/const';

import CompressedTextureFile from './CompressedTextureFile';

/**
 * Adds a Compressed Texture to this Texture Manager.
 *
 * The texture should typically have been loaded via the `CompressedTextureFile` loader,
 * in order to prepare the correct data object this method requires.
 *
 * You can optionally also pass atlas data to this method, in which case a texture atlas
 * will be generated from the given compressed texture, combined with the atlas data.
 *
 * @method Phaser.Textures.TextureManager#addCompressedTexture
 * @fires Phaser.Textures.Events#ADD
 *
 * @param {string} key - The unique string-based key of the Texture.
 * @param {Phaser.Types.Textures.CompressedTextureData} textureData - The Compressed Texture data object.
 * @param {object} [atlasData] - Optional Texture Atlas data.
 *
 * @return {?Phaser.Textures.Texture} The Texture that was created, or `null` if the key is already in use.
 */
Phaser.Textures.TextureManager.prototype.addCompressedTexture = function (key, textureData, atlasData) {
  let texture = null;

  if (this.checkKey(key)) {
    texture = this.create(key, textureData);

    texture.add('__BASE', 0, 0, 0, textureData.width, textureData.height);

    if (atlasData) {
      if (Array.isArray(atlasData)) {
        for (let i = 0; i < atlasData.length; i++) {
          JSONHash(texture, i, atlasData[i]);
        }
      } else {
        JSONHash(texture, 0, atlasData);
      }
    }

    this.emit(Events.ADD, key, texture);
  }
  return texture;
};

/**
 * Determines which compressed texture formats this browser and device supports.
 *
 * Called automatically as part of the WebGL Renderer init process. If you need to investigate
 * which formats it supports, see the `Phaser.Renderer.WebGL.WebGLRenderer#compression` property instead.
 *
 * @method Phaser.Renderer.WebGL.WebGLRenderer#getCompressedTextures
 *
 * @return {Phaser.Types.Renderer.WebGL.WebGLTextureCompression} The compression object.
 */
Phaser.Renderer.WebGL.WebGLRenderer.prototype.getCompressedTextures = function () {
  const extString = 'WEBGL_compressed_texture_';
  const wkExtString = 'WEBKIT_' + extString;

  const hasExt = function (gl, format) {
    const results = gl.getExtension(extString + format) || gl.getExtension(wkExtString + format);

    if (results) {
      const glEnums = {};

      for (let key in results) {
        glEnums[results[key]] = key;
      }

      return glEnums;
    }
  };

  const gl = this.gl;

  return {
    ETC: hasExt(gl, 'etc'),
    ETC1: hasExt(gl, 'etc1'),
    ATC: hasExt(gl, 'atc'),
    ASTC: hasExt(gl, 'astc'),
    BPTC: hasExt(gl, 'bptc'),
    RGTC: hasExt(gl, 'rgtc'),
    PVRTC: hasExt(gl, 'pvrtc'),
    S3TC: hasExt(gl, 's3tc'),
    S3TCSRGB: hasExt(gl, 's3tc_srgb'),
    IMG: true,
  };
};

/**
 * Checks if the given compressed texture format is supported, or not.
 *
 * @method Phaser.Renderer.WebGL.WebGLRenderer#supportsCompressedTexture
 *
 * @param {string} baseFormat - The Base Format to check.
 * @param {GLenum} [format] - An optional GLenum format to check within the base format.
 *
 * @return {boolean} True if the format is supported, otherwise false.
 */
Phaser.Renderer.WebGL.WebGLRenderer.prototype.supportsCompressedTexture = function (baseFormat, format) {
  const supportedFormats = this.compression[baseFormat.toUpperCase()];
  if (supportedFormats) {
    if (format) {
      return format in supportedFormats;
    } else {
      return true;
    }
  }

  return false;
};

/**
 * Returns a compressed texture format GLenum name based on the given format.
 *
 * @method Phaser.Renderer.WebGL.WebGLRenderer#getCompressedTextureName
 *
 * @param {string} baseFormat - The Base Format to check.
 * @param {GLenum} [format] - An optional GLenum format to check within the base format.
 *
 * @return {string} The compressed texture format name, as a string.
 */
Phaser.Renderer.WebGL.WebGLRenderer.prototype.getCompressedTextureName = function (baseFormat, format) {
  const supportedFormats = this.compression[baseFormat.toUpperCase()];

  if (format in supportedFormats) {
    return supportedFormats[format];
  }
};

/**
 * Creates a texture from an image source. If the source is not valid it creates an empty texture.
 *
 * @method Phaser.Renderer.WebGL.WebGLRenderer#createTextureFromSource
 *
 * @param {object} source - The source of the texture.
 * @param {number} width - The width of the texture.
 * @param {number} height - The height of the texture.
 * @param {number} scaleMode - The scale mode to be used by the texture.
 * @param {boolean} [forceClamp=false] - Force the texture to use the CLAMP_TO_EDGE wrap mode, even if a power of two?
 *
 * @return {?WebGLTexture} The WebGL Texture that was created, or `null` if it couldn't be created.
 */
Phaser.Renderer.WebGL.WebGLRenderer.prototype.createTextureFromSource = function (
  source,
  width,
  height,
  scaleMode,
  forceClamp,
) {
  if (forceClamp === undefined) {
    forceClamp = false;
  }

  var gl = this.gl;
  var minFilter = gl.NEAREST;
  var magFilter = gl.NEAREST;
  var wrap = gl.CLAMP_TO_EDGE;
  var texture = null;

  width = source ? source.width : width;
  height = source ? source.height : height;

  var pow = IsSizePowerOfTwo(width, height);

  if (pow && !forceClamp) {
    wrap = gl.REPEAT;
  }

  if (scaleMode === CONST.ScaleModes.LINEAR && this.config.antialias) {
    minFilter = pow ? this.mipmapFilter : gl.LINEAR;
    magFilter = gl.LINEAR;
  }

  if (source && source.compressed) {
    //  If you don't set minFilter to LINEAR then the compressed textures don't work!
    minFilter = gl.LINEAR;
    magFilter = gl.LINEAR;
  }

  if (!source && typeof width === 'number' && typeof height === 'number') {
    texture = this.createTexture2D(0, minFilter, magFilter, wrap, wrap, gl.RGBA, null, width, height);
  } else {
    texture = this.createTexture2D(0, minFilter, magFilter, wrap, wrap, gl.RGBA, source);
  }

  return texture;
};

/**
 * A wrapper for creating a WebGLTexture. If no pixel data is passed it will create an empty texture.
 *
 * @method Phaser.Renderer.WebGL.WebGLRenderer#createTexture2D
 *
 * @param {number} mipLevel - Mip level of the texture.
 * @param {number} minFilter - Filtering of the texture.
 * @param {number} magFilter - Filtering of the texture.
 * @param {number} wrapT - Wrapping mode of the texture.
 * @param {number} wrapS - Wrapping mode of the texture.
 * @param {number} format - Which format does the texture use.
 * @param {?object} pixels - pixel data.
 * @param {number} width - Width of the texture in pixels.
 * @param {number} height - Height of the texture in pixels.
 * @param {boolean} [pma=true] - Does the texture have premultiplied alpha?
 * @param {boolean} [forceSize=false] - If `true` it will use the width and height passed to this method, regardless of the pixels dimension.
 * @param {boolean} [flipY=false] - Sets the `UNPACK_FLIP_Y_WEBGL` flag the WebGL Texture uses during upload.
 *
 * @return {WebGLTexture} The WebGLTexture that was created.
 */
Phaser.Renderer.WebGL.WebGLRenderer.prototype.createTexture2D = function (
  mipLevel,
  minFilter,
  magFilter,
  wrapT,
  wrapS,
  format,
  pixels,
  width,
  height,
  pma,
  forceSize,
  flipY,
) {
  pma = pma === undefined || pma === null ? true : pma;
  if (forceSize === undefined) {
    forceSize = false;
  }
  if (flipY === undefined) {
    flipY = false;
  }

  var gl = this.gl;
  var texture = gl.createTexture();

  this.setTexture2D(texture, 0);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, pma);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);

  var generateMipmap = false;

  if (pixels === null || pixels === undefined) {
    gl.texImage2D(gl.TEXTURE_2D, mipLevel, format, width, height, 0, format, gl.UNSIGNED_BYTE, null);

    generateMipmap = IsSizePowerOfTwo(width, height);
  } else if (pixels.compressed) {
    width = pixels.width;
    height = pixels.height;
    generateMipmap = pixels.generateMipmap;

    for (var i = 0; i < pixels.mipmaps.length; i++) {
      gl.compressedTexImage2D(
        gl.TEXTURE_2D,
        i,
        pixels.internalFormat,
        pixels.mipmaps[i].width,
        pixels.mipmaps[i].height,
        0,
        pixels.mipmaps[i].data,
      );
    }
  } else {
    if (!forceSize) {
      width = pixels.width;
      height = pixels.height;
    }

    gl.texImage2D(gl.TEXTURE_2D, mipLevel, format, format, gl.UNSIGNED_BYTE, pixels);
    generateMipmap = IsSizePowerOfTwo(width, height);
  }

  if (generateMipmap) {
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  this.setTexture2D(null, 0);

  texture.isAlphaPremultiplied = pma;
  texture.isRenderTexture = false;
  texture.width = width;
  texture.height = height;

  this.nativeTextures.push(texture);

  return texture;
};

export default class CompressedTextureLoaderPlugin extends Phaser.Plugins.BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);
  }

  init() {
    if (Number(Phaser.VERSION.split('.')[1]) >= 60) {
      throw new Error(
        'Phaser v3.60 and later include support for compressed textures out of the box. Please use that instead.',
      );
    } else if (Number(Phaser.VERSION.split('.')[1]) !== 24) {
      throw new Error(
        'Phaser compressed texture plugin was made specifically for use with Phaser v3.24.1. Proceed with caution.',
      );
    }

    // not sure how else to do this =/
    this.game.renderer.compression = Phaser.Renderer.WebGL.WebGLRenderer.prototype.getCompressedTextures.call(
      this.game.renderer,
    );

    this.pluginManager.registerFileType('texture', compressedTextureLoaderCallback);
  }

  addToScene(scene) {
    scene.sys.load['texture'] = compressedTextureLoaderCallback;
  }
}

/**
 * Adds a Compressed Texture file to the current load queue. This feature is WebGL only.
 *
 * This method takes a key and a configuration object, which lists the different formats
 * and files associated with them.
 *
 * The texture format object should be ordered in GPU priority order, with IMG as the last entry.
 *
 * You can call this method from within your Scene's `preload`, along with any other files you wish to load:
 *
 * ```javascript
 * preload ()
 * {
 *     this.load.texture('yourPic', {
 *         ASTC: { type: 'PVR', textureURL: 'pic-astc-4x4.pvr' },
 *         PVRTC: { type: 'PVR', textureURL: 'pic-pvrtc-4bpp-rgba.pvr' },
 *         S3TC: { type: 'PVR', textureURL: 'pic-dxt5.pvr' },
 *         IMG: { textureURL: 'pic.png' }
 *     });
 * ```
 *
 * If you wish to load a texture atlas, provide the `atlasURL` property:
 *
 * ```javascript
 * preload ()
 * {
 *     const path = 'assets/compressed';
 *
 *     this.load.texture('yourAtlas', {
 *         'ASTC': { type: 'PVR', textureURL: `${path}/textures-astc-4x4.pvr`, atlasURL: `${path}/textures.json` },
 *         'PVRTC': { type: 'PVR', textureURL: `${path}/textures-pvrtc-4bpp-rgba.pvr`, atlasURL: `${path}/textures-pvrtc-4bpp-rgba.json` },
 *         'S3TC': { type: 'PVR', textureURL: `${path}/textures-dxt5.pvr`, atlasURL: `${path}/textures-dxt5.json` },
 *         'IMG': { textureURL: `${path}/textures.png`, atlasURL: `${path}/textures.json` }
 *     });
 * }
 * ```
 *
 * If you wish to load a Multi Atlas, as exported from Texture Packer Pro, use the `multiAtlasURL` property instead:
 *
 * ```javascript
 * preload ()
 * {
 *     const path = 'assets/compressed';
 *
 *     this.load.texture('yourAtlas', {
 *         'ASTC': { type: 'PVR', atlasURL: `${path}/textures.json` },
 *         'PVRTC': { type: 'PVR', atlasURL: `${path}/textures-pvrtc-4bpp-rgba.json` },
 *         'S3TC': { type: 'PVR', atlasURL: `${path}/textures-dxt5.json` },
 *         'IMG': { atlasURL: `${path}/textures.json` }
 *     });
 * }
 * ```
 *
 * When loading a Multi Atlas you do not need to specify the `textureURL` property as it will be read from the JSON file.
 *
 * Instead of passing arguments you can pass a configuration object, such as:
 *
 * ```javascript
 * this.load.texture({
 *     key: 'yourPic',
 *     url: {
 *         ASTC: { type: 'PVR', textureURL: 'pic-astc-4x4.pvr' },
 *         PVRTC: { type: 'PVR', textureURL: 'pic-pvrtc-4bpp-rgba.pvr' },
 *         S3TC: { type: 'PVR', textureURL: 'pic-dxt5.pvr' },
 *         IMG: { textureURL: 'pic.png' }
 *    }
 * });
 * ```
 *
 * See the documentation for `Phaser.Types.Loader.FileTypes.CompressedTextureFileConfig` for more details.
 *
 * The number of formats you provide to this function is up to you, but you should ensure you
 * cover the primary platforms where appropriate.
 *
 * The 'IMG' entry is a fallback to a JPG or PNG, should the browser be unable to load any of the other
 * formats presented to this function. You should really always include this, although it is optional.
 *
 * Phaser supports loading both the PVR and KTX container formats. Within those, it can parse
 * the following texture compression formats:
 *
 * ETC
 * ETC1
 * ATC
 * ASTC
 * BPTC
 * RGTC
 * PVRTC
 * S3TC
 * S3TCSRGB
 *
 * For more information about the benefits of compressed textures please see the
 * following articles:
 *
 * Texture Compression in 2020 (https://aras-p.info/blog/2020/12/08/Texture-Compression-in-2020/)
 * Compressed GPU Texture Formats (https://themaister.net/blog/2020/08/12/compressed-gpu-texture-formats-a-review-and-compute-shader-decoders-part-1/)
 *
 * To create compressed texture files use a 3rd party application such as:
 *
 * Texture Packer (https://www.codeandweb.com/texturepacker/tutorials/how-to-create-sprite-sheets-for-phaser3?utm_source=ad&utm_medium=banner&utm_campaign=phaser-2018-10-16)
 * PVRTexTool (https://developer.imaginationtech.com/pvrtextool/) - available for Windows, macOS and Linux.
 * Mali Texture Compression Tool (https://developer.arm.com/tools-and-software/graphics-and-gaming/mali-texture-compression-tool)
 * ASTC Encoder (https://github.com/ARM-software/astc-encoder)
 *
 * ASTCs must have a Channel Type of Unsigned Normalized Bytes (UNorm) and a Linear RGB Color Space.
 *
 * The file is **not** loaded right away. It is added to a queue ready to be loaded either when the loader starts,
 * or if it's already running, when the next free load slot becomes available. This happens automatically if you
 * are calling this from within the Scene's `preload` method, or a related callback. Because the file is queued
 * it means you cannot use the file immediately after calling this method, but must wait for the file to complete.
 * The typical flow for a Phaser Scene is that you load assets in the Scene's `preload` method and then when the
 * Scene's `create` method is called you are guaranteed that all of those assets are ready for use and have been
 * loaded.
 *
 * The key must be a unique String. It is used to add the file to the global Texture Manager upon a successful load.
 * The key should be unique both in terms of files being loaded and files already present in the Texture Manager.
 * Loading a file using a key that is already taken will result in a warning. If you wish to replace an existing file
 * then remove it from the Texture Manager first, before loading a new one.
 *
 * If you have specified a prefix in the loader, via `Loader.setPrefix` then this value will be prepended to this files
 * key. For example, if the prefix was `LEVEL1.` and the key was `Data` the final key will be `LEVEL1.Data` and
 * this is what you would use to retrieve the text from the Texture Manager.
 *
 * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
 *
 * Unlike other file loaders in Phaser, the URLs must include the file extension.
 *
 * Note: The ability to load this type of file will only be available if the Compressed Texture File type has been built into Phaser.
 * It is available in the default build but can be excluded from custom builds.
 *
 * @method Phaser.Loader.LoaderPlugin#texture
 * @fires Phaser.Loader.LoaderPlugin#ADD
 *
 * @param {(string|Phaser.Types.Loader.FileTypes.CompressedTextureFileConfig|Phaser.Types.Loader.FileTypes.CompressedTextureFileConfig[])} key - The key to use for this file, or a file configuration object, or array of them.
 * @param {Phaser.Types.Loader.FileTypes.CompressedTextureFileConfig} [url] - The compressed texture configuration object. Not required if passing a config object as the `key` parameter.
 * @param {Phaser.Types.Loader.XHRSettingsObject} [xhrSettings] - An XHR Settings configuration object. Used in replacement of the Loaders default XHR Settings.
 *
 * @return {this} The Loader instance.
 */

function compressedTextureLoaderCallback(key, url, xhrSettings) {
  const renderer = this.systems.renderer;

  const AddEntry = function (loader, key, urls, xhrSettings) {
    let entry = {
      format: null,
      type: null,
      textureURL: undefined,
      atlasURL: undefined,
      multiAtlasURL: undefined,
      multiPath: undefined,
      multiBaseURL: undefined,
    };

    if (IsPlainObject(key)) {
      const config = key;

      key = GetFastValue(config, 'key');
      (urls = GetFastValue(config, 'url')), (xhrSettings = GetFastValue(config, 'xhrSettings'));
    }

    let matched = false;

    for (let textureBaseFormat in urls) {
      if (renderer.supportsCompressedTexture(textureBaseFormat)) {
        const urlEntry = urls[textureBaseFormat];

        if (typeof urlEntry === 'string') {
          entry.textureURL = urlEntry;
        } else {
          entry = Merge(urlEntry, entry);
        }

        entry.format = textureBaseFormat.toUpperCase();

        matched = true;

        break;
      }
    }

    if (!matched) {
      console.warn('No supported compressed texture format or IMG fallback', key);
    } else if (entry.format === 'IMG') {
      let multifile;
      if (entry.multiAtlasURL) {
        multifile = new MultiAtlasFile(
          this,
          key,
          entry.multiAtlasURL,
          entry.multiPath,
          entry.multiBaseURL,
          xhrSettings,
        );
        loader.addFile(multifile.files);
      } else if (entry.atlasURL) {
        multifile = new AtlasJSONFile(loader, key, entry.textureURL, entry.atlasURL, xhrSettings);
        loader.addFile(multifile.files);
      } else {
        loader.addFile(new ImageFile(loader, key, entry.textureURL, xhrSettings));
      }
    } else {
      const texture = new CompressedTextureFile(loader, key, entry, xhrSettings);

      loader.addFile(texture.files);
    }
  };

  if (Array.isArray(key)) {
    for (let i = 0; i < key.length; i++) {
      AddEntry(this, key[i]);
    }
  } else {
    AddEntry(this, key, url, xhrSettings);
  }

  return this;
}
