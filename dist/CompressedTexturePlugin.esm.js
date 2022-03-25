import $kXgLj$phasersrcloaderfiletypesAtlasJSONFile from "phaser/src/loader/filetypes/AtlasJSONFile";
import {JSONHash as $kXgLj$JSONHash} from "phaser/src/textures/parsers/JSONHash";
import $kXgLj$phasersrctexturesevents from "phaser/src/textures/events";
import $kXgLj$phasersrcutilsobjectMerge from "phaser/src/utils/object/Merge";
import $kXgLj$phasersrcloaderfiletypesImageFile from "phaser/src/loader/filetypes/ImageFile";
import $kXgLj$phasersrcutilsobjectIsPlainObject from "phaser/src/utils/object/IsPlainObject";
import $kXgLj$phasersrcutilsobjectGetFastValue from "phaser/src/utils/object/GetFastValue";
import $kXgLj$phasersrcloaderfiletypesMultiAtlasFile from "phaser/src/loader/filetypes/MultiAtlasFile";
import $kXgLj$phasersrcmathpow2IsSizePowerOfTwo from "phaser/src/math/pow2/IsSizePowerOfTwo";
import $kXgLj$phasersrcconst from "phaser/src/const";
import $kXgLj$phasersrcloaderfiletypesBinaryFile from "phaser/src/loader/filetypes/BinaryFile";
import $kXgLj$phasersrcutilsClass from "phaser/src/utils/Class";
import $kXgLj$phasersrcloaderfiletypesJSONFile from "phaser/src/loader/filetypes/JSONFile";
import $kXgLj$phasersrcloaderMultiFile from "phaser/src/loader/MultiFile";
















/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2021 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */ /**
 * Parses a KTX format Compressed Texture file and generates texture data suitable for WebGL from it.
 *
 * @function Phaser.Textures.Parsers.KTXParser
 * @memberof Phaser.Textures.Parsers
 *
 * @param {ArrayBuffer} data - The data object created by the Compressed Texture File Loader.
 *
 * @return {Phaser.Types.Textures.CompressedTextureData} The Compressed Texture data.
 */ var $8b581d90e03f5fd4$var$KTXParser = function(data) {
    var idCheck = [
        171,
        75,
        84,
        88,
        32,
        49,
        49,
        187,
        13,
        10,
        26,
        10
    ];
    var i;
    var id = new Uint8Array(data, 0, 12);
    for(i = 0; i < id.length; i++)if (id[i] !== idCheck[i]) {
        console.warn('KTXParser - Invalid file format');
        return;
    }
    var size = Uint32Array.BYTES_PER_ELEMENT;
    var head = new DataView(data, 12, 13 * size);
    var littleEndian = head.getUint32(0, true) === 67305985;
    var glType = head.getUint32(1 * size, littleEndian);
    if (glType !== 0) {
        console.warn('KTXParser - Only compressed formats supported');
        return;
    }
    var internalFormat = head.getUint32(4 * size, littleEndian);
    var width = head.getUint32(6 * size, littleEndian);
    var height = head.getUint32(7 * size, littleEndian);
    var mipmapLevels = Math.max(1, head.getUint32(11 * size, littleEndian));
    var bytesOfKeyValueData = head.getUint32(12 * size, littleEndian);
    var mipmaps = new Array(mipmapLevels);
    var offset = 64 + bytesOfKeyValueData;
    var levelWidth = width;
    var levelHeight = height;
    for(i = 0; i < mipmapLevels; i++){
        var levelSize = new Int32Array(data, offset, 1)[0];
        // levelSize field
        offset += 4;
        mipmaps[i] = {
            data: new Uint8Array(data, offset, levelSize),
            width: levelWidth,
            height: levelHeight
        };
        // add padding for odd sized image
        // offset += 3 - ((levelSize + 3) % 4);
        levelWidth = Math.max(1, levelWidth >> 1);
        levelHeight = Math.max(1, levelHeight >> 1);
        offset += levelSize;
    }
    return {
        mipmaps: mipmaps,
        width: width,
        height: height,
        internalFormat: internalFormat,
        compressed: true,
        generateMipmap: false
    };
};
var $8b581d90e03f5fd4$export$2e2bcd8739ae039 = $8b581d90e03f5fd4$var$KTXParser;


/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2021 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */ /**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$GetSize(width, height, x, y, dx, dy, mult) {
    if (mult === undefined) mult = 16;
    return Math.floor((width + x) / dx) * Math.floor((height + y) / dy) * mult;
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$PVRTC2bppSize(width, height) {
    width = Math.max(width, 16);
    height = Math.max(height, 8);
    return width * height / 4;
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$PVRTC4bppSize(width, height) {
    width = Math.max(width, 8);
    height = Math.max(height, 8);
    return width * height / 2;
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$DXTEtcSmallSize(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 3, 3, 4, 4, 8);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$DXTEtcAstcBigSize(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 3, 3, 4, 4);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$ATC5x4Size(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 4, 3, 5, 4);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$ATC5x5Size(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 4, 4, 5, 5);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$ATC6x5Size(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 5, 4, 6, 5);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$ATC6x6Size(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 5, 5, 6, 6);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$ATC8x5Size(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 7, 4, 8, 5);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$ATC8x6Size(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 7, 5, 8, 6);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$ATC8x8Size(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 7, 7, 8, 8);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$ATC10x5Size(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 9, 4, 10, 5);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$ATC10x6Size(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 9, 5, 10, 6);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$ATC10x8Size(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 9, 7, 10, 8);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$ATC10x10Size(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 9, 9, 10, 10);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$ATC12x10Size(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 11, 9, 12, 10);
}
/**
 * @ignore
 */ function $9da6bd3fe45b07d9$var$ATC12x12Size(width, height) {
    return $9da6bd3fe45b07d9$var$GetSize(width, height, 11, 11, 12, 12);
}
/**
 * @ignore
 *
 * 0: COMPRESSED_RGB_PVRTC_2BPPV1_IMG
 * 1: COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
 * 2: COMPRESSED_RGB_PVRTC_4BPPV1_IMG
 * 3: COMPRESSED_RGBA_PVRTC_4BPPV1_IMG
 * 6: COMPRESSED_RGB_ETC1
 * 7: COMPRESSED_RGB_S3TC_DXT1_EXT
 * 8: COMPRESSED_RGBA_S3TC_DXT1_EXT
 * 9: COMPRESSED_RGBA_S3TC_DXT3_EXT
 * 11: COMPRESSED_RGBA_S3TC_DXT5_EXT
 * 22: COMPRESSED_RGB8_ETC2
 * 23: COMPRESSED_RGBA8_ETC2_EAC
 * 24: COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2
 * 25: COMPRESSED_R11_EAC
 * 26: COMPRESSED_RG11_EAC
 * 27: COMPRESSED_RGBA_ASTC_4x4_KHR
 * 28: COMPRESSED_RGBA_ASTC_5x4_KHR
 * 29: COMPRESSED_RGBA_ASTC_5x5_KHR
 * 30: COMPRESSED_RGBA_ASTC_6x5_KHR
 * 31: COMPRESSED_RGBA_ASTC_6x6_KHR
 * 32: COMPRESSED_RGBA_ASTC_8x5_KHR
 * 33: COMPRESSED_RGBA_ASTC_8x6_KHR
 * 34: COMPRESSED_RGBA_ASTC_8x8_KHR
 * 35: COMPRESSED_RGBA_ASTC_10x5_KHR
 * 36: COMPRESSED_RGBA_ASTC_10x6_KHR
 * 37: COMPRESSED_RGBA_ASTC_10x8_KHR
 * 38: COMPRESSED_RGBA_ASTC_10x10_KHR
 * 39: COMPRESSED_RGBA_ASTC_12x10_KHR
 * 40: COMPRESSED_RGBA_ASTC_12x12_KHR
 */ var $9da6bd3fe45b07d9$var$FORMATS = {
    0: {
        sizeFunc: $9da6bd3fe45b07d9$var$PVRTC2bppSize,
        glFormat: 35841
    },
    1: {
        sizeFunc: $9da6bd3fe45b07d9$var$PVRTC2bppSize,
        glFormat: 35843
    },
    2: {
        sizeFunc: $9da6bd3fe45b07d9$var$PVRTC4bppSize,
        glFormat: 35840
    },
    3: {
        sizeFunc: $9da6bd3fe45b07d9$var$PVRTC4bppSize,
        glFormat: 35842
    },
    6: {
        sizeFunc: $9da6bd3fe45b07d9$var$DXTEtcSmallSize,
        glFormat: 36196
    },
    7: {
        sizeFunc: $9da6bd3fe45b07d9$var$DXTEtcSmallSize,
        glFormat: 33776
    },
    8: {
        sizeFunc: $9da6bd3fe45b07d9$var$DXTEtcAstcBigSize,
        glFormat: 33777
    },
    9: {
        sizeFunc: $9da6bd3fe45b07d9$var$DXTEtcAstcBigSize,
        glFormat: 33778
    },
    11: {
        sizeFunc: $9da6bd3fe45b07d9$var$DXTEtcAstcBigSize,
        glFormat: 33779
    },
    22: {
        sizeFunc: $9da6bd3fe45b07d9$var$DXTEtcSmallSize,
        glFormat: 37492
    },
    23: {
        sizeFunc: $9da6bd3fe45b07d9$var$DXTEtcAstcBigSize,
        glFormat: 37496
    },
    24: {
        sizeFunc: $9da6bd3fe45b07d9$var$DXTEtcSmallSize,
        glFormat: 37494
    },
    25: {
        sizeFunc: $9da6bd3fe45b07d9$var$DXTEtcSmallSize,
        glFormat: 37488
    },
    26: {
        sizeFunc: $9da6bd3fe45b07d9$var$DXTEtcAstcBigSize,
        glFormat: 37490
    },
    27: {
        sizeFunc: $9da6bd3fe45b07d9$var$DXTEtcAstcBigSize,
        glFormat: 37808
    },
    28: {
        sizeFunc: $9da6bd3fe45b07d9$var$ATC5x4Size,
        glFormat: 37809
    },
    29: {
        sizeFunc: $9da6bd3fe45b07d9$var$ATC5x5Size,
        glFormat: 37810
    },
    30: {
        sizeFunc: $9da6bd3fe45b07d9$var$ATC6x5Size,
        glFormat: 37811
    },
    31: {
        sizeFunc: $9da6bd3fe45b07d9$var$ATC6x6Size,
        glFormat: 37812
    },
    32: {
        sizeFunc: $9da6bd3fe45b07d9$var$ATC8x5Size,
        glFormat: 37813
    },
    33: {
        sizeFunc: $9da6bd3fe45b07d9$var$ATC8x6Size,
        glFormat: 37814
    },
    34: {
        sizeFunc: $9da6bd3fe45b07d9$var$ATC8x8Size,
        glFormat: 37815
    },
    35: {
        sizeFunc: $9da6bd3fe45b07d9$var$ATC10x5Size,
        glFormat: 37816
    },
    36: {
        sizeFunc: $9da6bd3fe45b07d9$var$ATC10x6Size,
        glFormat: 37817
    },
    37: {
        sizeFunc: $9da6bd3fe45b07d9$var$ATC10x8Size,
        glFormat: 37818
    },
    38: {
        sizeFunc: $9da6bd3fe45b07d9$var$ATC10x10Size,
        glFormat: 37819
    },
    39: {
        sizeFunc: $9da6bd3fe45b07d9$var$ATC12x10Size,
        glFormat: 37820
    },
    40: {
        sizeFunc: $9da6bd3fe45b07d9$var$ATC12x12Size,
        glFormat: 37821
    }
};
/**
 * Parses a PVR format Compressed Texture file and generates texture data suitable for WebGL from it.
 *
 * @function Phaser.Textures.Parsers.PVRParser
 * @memberof Phaser.Textures.Parsers
 *
 * @param {ArrayBuffer} data - The data object created by the Compressed Texture File Loader.
 *
 * @return {Phaser.Types.Textures.CompressedTextureData} The Compressed Texture data.
 */ var $9da6bd3fe45b07d9$var$PVRParser = function(data) {
    var header = new Uint32Array(data, 0, 13);
    //  PIXEL_FORMAT_INDEX
    var pvrFormat = header[2];
    var internalFormat = $9da6bd3fe45b07d9$var$FORMATS[pvrFormat].glFormat;
    var sizeFunction = $9da6bd3fe45b07d9$var$FORMATS[pvrFormat].sizeFunc;
    //  MIPMAPCOUNT_INDEX
    var mipmapLevels = header[11];
    //  WIDTH_INDEX
    var width = header[7];
    //  HEIGHT_INDEX
    var height = header[6];
    //  HEADER_SIZE + METADATA_SIZE_INDEX
    var dataOffset = 52 + header[12];
    var image = new Uint8Array(data, dataOffset);
    var mipmaps = new Array(mipmapLevels);
    var offset = 0;
    var levelWidth = width;
    var levelHeight = height;
    for(var i = 0; i < mipmapLevels; i++){
        var levelSize = sizeFunction(levelWidth, levelHeight);
        mipmaps[i] = {
            data: new Uint8Array(image.buffer, image.byteOffset + offset, levelSize),
            width: levelWidth,
            height: levelHeight
        };
        levelWidth = Math.max(1, levelWidth >> 1);
        levelHeight = Math.max(1, levelHeight >> 1);
        offset += levelSize;
    }
    return {
        mipmaps: mipmaps,
        width: width,
        height: height,
        internalFormat: internalFormat,
        compressed: true,
        generateMipmap: false
    };
};
var $9da6bd3fe45b07d9$export$2e2bcd8739ae039 = $9da6bd3fe45b07d9$var$PVRParser;


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
 */ var $895fbc78e648d411$var$CompressedTextureFile = new $kXgLj$phasersrcutilsClass({
    Extends: $kXgLj$phasersrcloaderMultiFile,
    initialize: function CompressedTextureFile(loader, key, entry, xhrSettings) {
        if (entry.multiAtlasURL) {
            var multi = new $kXgLj$phasersrcloaderfiletypesJSONFile(loader, {
                key: key,
                url: entry.multiAtlasURL,
                xhrSettings: xhrSettings,
                config: entry
            });
            $kXgLj$phasersrcloaderMultiFile.call(this, loader, 'texture', key, [
                multi
            ]);
        } else {
            var extension = entry.textureURL.substr(entry.textureURL.length - 3);
            if (!entry.type) entry.type = extension.toLowerCase() === 'ktx' ? 'KTX' : 'PVR';
            var image = new $kXgLj$phasersrcloaderfiletypesBinaryFile(loader, {
                key: key,
                url: entry.textureURL,
                extension: extension,
                xhrSettings: xhrSettings,
                config: entry
            });
            if (entry.atlasURL) {
                var data = new $kXgLj$phasersrcloaderfiletypesJSONFile(loader, {
                    key: key,
                    url: entry.atlasURL,
                    xhrSettings: xhrSettings,
                    config: entry
                });
                $kXgLj$phasersrcloaderMultiFile.call(this, loader, 'texture', key, [
                    image,
                    data
                ]);
            } else $kXgLj$phasersrcloaderMultiFile.call(this, loader, 'texture', key, [
                image
            ]);
        }
        this.config = entry;
    },
    /**
   * Called by each File when it finishes loading.
   *
   * @method Phaser.Loader.FileTypes.CompressedTextureFile#onFileComplete
   *
   * @param {Phaser.Loader.File} file - The File that has completed processing.
   */ onFileComplete: function(file) {
        var index = this.files.indexOf(file);
        if (index !== -1) {
            this.pending--;
            if (!this.config.multiAtlasURL) return;
            if (file.type === 'json' && file.data.hasOwnProperty('textures')) {
                //  Inspect the data for the files to now load
                var textures = file.data.textures;
                var config = this.config;
                var loader = this.loader;
                var currentBaseURL = loader.baseURL;
                var currentPath = loader.path;
                var currentPrefix = loader.prefix;
                var baseURL = $kXgLj$phasersrcutilsobjectGetFastValue(config, 'multiBaseURL', this.baseURL);
                var path = $kXgLj$phasersrcutilsobjectGetFastValue(config, 'multiPath', this.path);
                var prefix = $kXgLj$phasersrcutilsobjectGetFastValue(config, 'prefix', this.prefix);
                var textureXhrSettings = $kXgLj$phasersrcutilsobjectGetFastValue(config, 'textureXhrSettings');
                if (baseURL) loader.setBaseURL(baseURL);
                if (path) loader.setPath(path);
                if (prefix) loader.setPrefix(prefix);
                for(var i = 0; i < textures.length; i++){
                    //  "image": "texture-packer-multi-atlas-0.png",
                    var textureURL = textures[i].image;
                    var key = 'CMA' + this.multiKeyIndex + '_' + textureURL;
                    var image = new $kXgLj$phasersrcloaderfiletypesBinaryFile(loader, key, textureURL, textureXhrSettings);
                    this.addToMultiFile(image);
                    loader.addFile(image);
                    //  "normalMap": "texture-packer-multi-atlas-0_n.png",
                    if (textures[i].normalMap) {
                        var normalMap = new $kXgLj$phasersrcloaderfiletypesBinaryFile(loader, key, textures[i].normalMap, textureXhrSettings);
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
   */ addToCache: function() {
        if (this.isReadyToProcess()) {
            var entry = this.config;
            if (entry.multiAtlasURL) this.addMultiToCache();
            else {
                var renderer = this.loader.systems.renderer;
                var textureManager = this.loader.textureManager;
                var textureData;
                var image = this.files[0];
                var json = this.files[1];
                if (entry.type === 'PVR') textureData = $9da6bd3fe45b07d9$export$2e2bcd8739ae039(image.data);
                else if (entry.type === 'KTX') textureData = $8b581d90e03f5fd4$export$2e2bcd8739ae039(image.data);
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
   */ addMultiToCache: function() {
        var entry = this.config;
        var json = this.files[0];
        var data = [];
        var images = [];
        var normalMaps = [];
        var renderer = this.loader.systems.renderer;
        var textureManager = this.loader.textureManager;
        var textureData;
        for(var i = 1; i < this.files.length; i++){
            var file = this.files[i];
            if (file.type === 'normalMap') continue;
            var pos = file.key.indexOf('_');
            var key = file.key.substr(pos + 1);
            var image = file.data;
            //  Now we need to find out which json entry this mapped to
            for(var t = 0; t < json.data.textures.length; t++){
                var item = json.data.textures[t];
                if (item.image === key) {
                    if (entry.type === 'PVR') textureData = $9da6bd3fe45b07d9$export$2e2bcd8739ae039(image);
                    else if (entry.type === 'KTX') textureData = $8b581d90e03f5fd4$export$2e2bcd8739ae039(image);
                    if (textureData && renderer.supportsCompressedTexture(entry.format, textureData.internalFormat)) {
                        textureData.format = renderer.getCompressedTextureName(entry.format, textureData.internalFormat);
                        images.push(textureData);
                        data.push(item);
                        if (file.linkFile) normalMaps.push(file.linkFile.data);
                    }
                    break;
                }
            }
        }
        if (normalMaps.length === 0) normalMaps = undefined;
        textureManager.addAtlasJSONArray(this.key, images, data, normalMaps);
        this.complete = true;
    }
});
var $895fbc78e648d411$export$2e2bcd8739ae039 = $895fbc78e648d411$var$CompressedTextureFile;


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
 */ Phaser.Textures.TextureManager.prototype.addCompressedTexture = function(key, textureData, atlasData) {
    let texture = null;
    if (this.checkKey(key)) {
        texture = this.create(key, textureData);
        texture.add('__BASE', 0, 0, 0, textureData.width, textureData.height);
        if (atlasData) {
            if (Array.isArray(atlasData)) for(let i = 0; i < atlasData.length; i++)$kXgLj$JSONHash(texture, i, atlasData[i]);
            else $kXgLj$JSONHash(texture, 0, atlasData);
        }
        this.emit($kXgLj$phasersrctexturesevents.ADD, key, texture);
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
 */ Phaser.Renderer.WebGL.WebGLRenderer.prototype.getCompressedTextures = function() {
    const extString = 'WEBGL_compressed_texture_';
    const wkExtString = 'WEBKIT_' + extString;
    const hasExt = function(gl, format) {
        const results = gl.getExtension(extString + format) || gl.getExtension(wkExtString + format);
        if (results) {
            const glEnums = {};
            for(let key in results)glEnums[results[key]] = key;
            return glEnums;
        }
    };
    const gl1 = this.gl;
    return {
        ETC: hasExt(gl1, 'etc'),
        ETC1: hasExt(gl1, 'etc1'),
        ATC: hasExt(gl1, 'atc'),
        ASTC: hasExt(gl1, 'astc'),
        BPTC: hasExt(gl1, 'bptc'),
        RGTC: hasExt(gl1, 'rgtc'),
        PVRTC: hasExt(gl1, 'pvrtc'),
        S3TC: hasExt(gl1, 's3tc'),
        S3TCSRGB: hasExt(gl1, 's3tc_srgb'),
        IMG: true
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
 */ Phaser.Renderer.WebGL.WebGLRenderer.prototype.supportsCompressedTexture = function(baseFormat, format) {
    const supportedFormats = this.compression[baseFormat.toUpperCase()];
    if (supportedFormats) {
        if (format) return format in supportedFormats;
        else return true;
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
 */ Phaser.Renderer.WebGL.WebGLRenderer.prototype.getCompressedTextureName = function(baseFormat, format) {
    const supportedFormats = this.compression[baseFormat.toUpperCase()];
    if (format in supportedFormats) return supportedFormats[format];
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
 */ Phaser.Renderer.WebGL.WebGLRenderer.prototype.createTextureFromSource = function(source, width, height, scaleMode, forceClamp) {
    if (forceClamp === undefined) forceClamp = false;
    var gl = this.gl;
    var minFilter = gl.NEAREST;
    var magFilter = gl.NEAREST;
    var wrap = gl.CLAMP_TO_EDGE;
    var texture = null;
    width = source ? source.width : width;
    height = source ? source.height : height;
    var pow = $kXgLj$phasersrcmathpow2IsSizePowerOfTwo(width, height);
    if (pow && !forceClamp) wrap = gl.REPEAT;
    if (scaleMode === $kXgLj$phasersrcconst.ScaleModes.LINEAR && this.config.antialias) {
        minFilter = pow ? this.mipmapFilter : gl.LINEAR;
        magFilter = gl.LINEAR;
    }
    if (source && source.compressed) {
        //  If you don't set minFilter to LINEAR then the compressed textures don't work!
        minFilter = gl.LINEAR;
        magFilter = gl.LINEAR;
    }
    if (!source && typeof width === 'number' && typeof height === 'number') texture = this.createTexture2D(0, minFilter, magFilter, wrap, wrap, gl.RGBA, null, width, height);
    else texture = this.createTexture2D(0, minFilter, magFilter, wrap, wrap, gl.RGBA, source);
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
 */ Phaser.Renderer.WebGL.WebGLRenderer.prototype.createTexture2D = function(mipLevel, minFilter, magFilter, wrapT, wrapS, format, pixels, width, height, pma, forceSize, flipY) {
    pma = pma === undefined || pma === null ? true : pma;
    if (forceSize === undefined) forceSize = false;
    if (flipY === undefined) flipY = false;
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
        generateMipmap = $kXgLj$phasersrcmathpow2IsSizePowerOfTwo(width, height);
    } else if (pixels.compressed) {
        width = pixels.width;
        height = pixels.height;
        generateMipmap = pixels.generateMipmap;
        for(var i = 0; i < pixels.mipmaps.length; i++)gl.compressedTexImage2D(gl.TEXTURE_2D, i, pixels.internalFormat, pixels.mipmaps[i].width, pixels.mipmaps[i].height, 0, pixels.mipmaps[i].data);
    } else {
        if (!forceSize) {
            width = pixels.width;
            height = pixels.height;
        }
        gl.texImage2D(gl.TEXTURE_2D, mipLevel, format, format, gl.UNSIGNED_BYTE, pixels);
        generateMipmap = $kXgLj$phasersrcmathpow2IsSizePowerOfTwo(width, height);
    }
    if (generateMipmap) gl.generateMipmap(gl.TEXTURE_2D);
    this.setTexture2D(null, 0);
    texture.isAlphaPremultiplied = pma;
    texture.isRenderTexture = false;
    texture.width = width;
    texture.height = height;
    this.nativeTextures.push(texture);
    return texture;
};
class $9d9d4f4f934ab8fd$export$2e2bcd8739ae039 extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager){
        super(pluginManager);
    }
    init() {
        if (Number(Phaser.VERSION.split('.')[1]) >= 60) throw new Error('Phaser v3.60 and later include support for compressed textures out of the box. Please use that instead.');
        else if (Number(Phaser.VERSION.split('.')[1]) !== 24) throw new Error('Phaser compressed texture plugin was made specifically for use with Phaser v3.24.1. Proceed with caution.');
        // not sure how else to do this =/
        this.game.renderer.compression = Phaser.Renderer.WebGL.WebGLRenderer.prototype.getCompressedTextures.call(this.game.renderer);
        this.pluginManager.registerFileType('texture', $9d9d4f4f934ab8fd$var$compressedTextureLoaderCallback);
    }
    addToScene(scene) {
        scene.sys.load['texture'] = $9d9d4f4f934ab8fd$var$compressedTextureLoaderCallback;
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
 */ function $9d9d4f4f934ab8fd$var$compressedTextureLoaderCallback(key1, url, xhrSettings1) {
    const renderer = this.systems.renderer;
    const AddEntry = function(loader, key, urls, xhrSettings) {
        let entry = {
            format: null,
            type: null,
            textureURL: undefined,
            atlasURL: undefined,
            multiAtlasURL: undefined,
            multiPath: undefined,
            multiBaseURL: undefined
        };
        if ($kXgLj$phasersrcutilsobjectIsPlainObject(key)) {
            const config = key;
            key = $kXgLj$phasersrcutilsobjectGetFastValue(config, 'key');
            urls = $kXgLj$phasersrcutilsobjectGetFastValue(config, 'url'), xhrSettings = $kXgLj$phasersrcutilsobjectGetFastValue(config, 'xhrSettings');
        }
        let matched = false;
        for(let textureBaseFormat in urls)if (renderer.supportsCompressedTexture(textureBaseFormat)) {
            const urlEntry = urls[textureBaseFormat];
            if (typeof urlEntry === 'string') entry.textureURL = urlEntry;
            else entry = $kXgLj$phasersrcutilsobjectMerge(urlEntry, entry);
            entry.format = textureBaseFormat.toUpperCase();
            matched = true;
            break;
        }
        if (!matched) console.warn('No supported compressed texture format or IMG fallback', key);
        else if (entry.format === 'IMG') {
            let multifile;
            if (entry.multiAtlasURL) {
                multifile = new $kXgLj$phasersrcloaderfiletypesMultiAtlasFile(this, key, entry.multiAtlasURL, entry.multiPath, entry.multiBaseURL, xhrSettings);
                loader.addFile(multifile.files);
            } else if (entry.atlasURL) {
                multifile = new $kXgLj$phasersrcloaderfiletypesAtlasJSONFile(loader, key, entry.textureURL, entry.atlasURL, xhrSettings);
                loader.addFile(multifile.files);
            } else loader.addFile(new $kXgLj$phasersrcloaderfiletypesImageFile(loader, key, entry.textureURL, xhrSettings));
        } else {
            const texture = new $895fbc78e648d411$export$2e2bcd8739ae039(loader, key, entry, xhrSettings);
            loader.addFile(texture.files);
        }
    };
    if (Array.isArray(key1)) for(let i = 0; i < key1.length; i++)AddEntry(this, key1[i]);
    else AddEntry(this, key1, url, xhrSettings1);
    return this;
}


export {$9d9d4f4f934ab8fd$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=CompressedTexturePlugin.esm.js.map
