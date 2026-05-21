# Phaser Compressed Texture Plugin

Compressed texture support for Phaser v3.24.1.

> **Note**
> Phaser v3.60 and later include compressed texture support out of the box. Use Phaser's built-in loader instead of this plugin for v3.60+ projects.

## What this plugin adds

This package backports Phaser's compressed texture loader flow for projects pinned to Phaser 3.24.1. It:

- registers `this.load.texture(...)` for compressed texture configs;
- detects the browser's supported WebGL compressed texture formats;
- loads the first supported format from your priority-ordered config;
- supports PVR and KTX containers;
- supports plain images, JSON atlases, and multi-atlases as fallbacks.

## Installation

```sh
npm install phaser-compressed-texture-plugin
```

The package is built against Phaser 3.24.1:

```sh
npm install phaser@3.24.1
```

## Register the plugin

Import the plugin and add it as a global plugin in the Phaser game config:

```js
import Phaser from 'phaser';
import CompressedTexturePlugin from 'phaser-compressed-texture-plugin';

const config = {
  type: Phaser.WEBGL,
  width: 800,
  height: 600,
  plugins: {
    global: [
      {
        key: 'CompressedTexturePlugin',
        plugin: CompressedTexturePlugin,
        start: true,
      },
    ],
  },
  scene: [GameScene],
};

new Phaser.Game(config);
```

This plugin is WebGL-only because compressed texture support depends on WebGL extensions.

## Loading a texture

Use `this.load.texture(key, formats)` from a scene `preload` method. Put entries in GPU priority order and keep `IMG` last as the PNG/JPG fallback.

```js
class GameScene extends Phaser.Scene {
  preload() {
    this.load.texture('ship', {
      ASTC: { type: 'PVR', textureURL: 'assets/ship-astc-4x4.pvr' },
      PVRTC: { type: 'PVR', textureURL: 'assets/ship-pvrtc-4bpp-rgba.pvr' },
      S3TC: { type: 'PVR', textureURL: 'assets/ship-dxt5.pvr' },
      IMG: { textureURL: 'assets/ship.png' },
    });
  }

  create() {
    this.add.image(400, 300, 'ship');
  }
}
```

The loader selects the first entry supported by the current renderer. If none of the compressed entries are supported, it falls back to `IMG` when present.

## Loading an atlas

Provide `atlasURL` alongside each texture URL:

```js
this.load.texture('characters', {
  ASTC: {
    type: 'PVR',
    textureURL: 'assets/characters-astc-4x4.pvr',
    atlasURL: 'assets/characters.json',
  },
  S3TC: {
    type: 'PVR',
    textureURL: 'assets/characters-dxt5.pvr',
    atlasURL: 'assets/characters-dxt5.json',
  },
  IMG: {
    textureURL: 'assets/characters.png',
    atlasURL: 'assets/characters.json',
  },
});
```

## Loading a multi-atlas

For TexturePacker-style multi-atlas exports, use `multiAtlasURL`. The texture URLs are read from the JSON file, so you do not need to repeat `textureURL`:

```js
this.load.texture('level', {
  ASTC: { type: 'PVR', multiAtlasURL: 'assets/level-astc.json' },
  PVRTC: { type: 'PVR', multiAtlasURL: 'assets/level-pvrtc.json' },
  S3TC: { type: 'PVR', multiAtlasURL: 'assets/level-dxt5.json' },
  IMG: { multiAtlasURL: 'assets/level.json' },
});
```

## Supported compressed formats

The plugin checks Phaser/WebGL support for these base formats:

- ETC
- ETC1
- ATC
- ASTC
- BPTC
- RGTC
- PVRTC
- S3TC
- S3TC SRGB

The source can parse compressed textures in PVR and KTX containers. Include a normal image fallback for browsers or GPUs that do not expose a compatible compressed texture extension.

## Building

```sh
npm install
npm run build
```

The distributable files are emitted under `dist/`.

## Compatibility notes

- Use Phaser 3.24.1. The plugin throws on Phaser 3.60+ because the feature is built in there.
- Phaser versions other than 3.24.x are not the target and may require changes.
- Compressed ASTC textures must use unsigned normalized bytes (UNorm) and a linear RGB color space.

## Related resources

- [Texture Compression in 2020](https://aras-p.info/blog/2020/12/08/Texture-Compression-in-2020/)
- [Compressed GPU Texture Formats](https://themaister.net/blog/2020/08/12/compressed-gpu-texture-formats-a-review-and-compute-shader-decoders-part-1/)
- [PVRTexTool](https://developer.imaginationtech.com/pvrtextool/)
- [ASTC Encoder](https://github.com/ARM-software/astc-encoder)
