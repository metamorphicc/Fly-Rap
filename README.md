# Fly Rap Studio

Original stylized scene: a fruit fly performing a rap take in a recording studio.

## Files

- `fly_rap_studio.html` - Three.js scene and phone-readable HUD.
- `generate-audio.mjs` - creates an original synthetic beat and fly-like vocal texture.
- `fly_rap_studio.wav` - generated audio track.
- `render-fly-rap.mjs` - renders frames and muxes audio into mp4.
- `probe-fly-rap.mjs` - exports QA screenshots.
- `fly_rap_studio.mp4` - final video with sound.

## Generate Audio

```powershell
node .\generate-audio.mjs
```

The audio is synthetic: kick, snare, hats, bass, pad, and buzzy rap syllables. No samples.

## Probe Visuals

```powershell
node .\probe-fly-rap.mjs
```

Screenshots go into `.probe/`.

## Render Video

```powershell
node .\render-fly-rap.mjs
```

Output:

```text
fly_rap_studio.mp4
```

Current settings:

- `1080x1350`
- `18s`
- `24fps`
- AAC audio
- no letterboxing
