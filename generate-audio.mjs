import fs from 'node:fs';

const out = 'C:/Users/User/Desktop/claude twitter create/swarm-launch-video/fly-rap-studio/fly_rap_studio.wav';
const sampleRate = 44100;
const seconds = 18;
const channels = 2;
const bpm = 92;
const beat = 60 / bpm;
const total = sampleRate * seconds;

function clamp(x) { return Math.max(-1, Math.min(1, x)); }
function fract(x) { return x - Math.floor(x); }
function envExp(t, decay) { return t < 0 ? 0 : Math.exp(-t / decay); }
function noise(i) {
  let x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return fract(x) * 2 - 1;
}
function pulse(time, step, offset = 0) {
  const local = fract((time - offset) / step) * step;
  return local;
}

const bassNotes = [43.65, 43.65, 51.91, 38.89, 43.65, 58.27, 51.91, 38.89];
const rapSyllables = [0.18, 0.42, 0.72, 1.05, 1.36, 1.7, 2.02, 2.34, 2.72, 3.04, 3.34, 3.68];

const pcm = Buffer.alloc(total * channels * 2);

for (let i = 0; i < total; i++) {
  const t = i / sampleRate;
  const barPos = (t / beat) % 4;
  const beatIndex = Math.floor(t / beat);

  let s = 0;

  const kickOffsets = [0, 1.5, 2.75];
  for (const o of kickOffsets) {
    const k = pulse(t, beat * 4, o * beat);
    if (k < 0.22) {
      const f = 45 + 90 * Math.exp(-k / 0.035);
      s += Math.sin(2 * Math.PI * f * t) * envExp(k, 0.105) * 0.9;
    }
  }

  for (const o of [1, 3]) {
    const sn = pulse(t, beat * 4, o * beat);
    if (sn < 0.18) {
      s += noise(i) * envExp(sn, 0.045) * 0.14;
      s += Math.sin(2 * Math.PI * 172 * t) * envExp(sn, 0.09) * 0.26;
    }
  }

  const hh = pulse(t, beat / 2, 0);
  if (hh < 0.035) {
    s += noise(i * 3) * envExp(hh, 0.012) * 0.055;
  }

  const note = bassNotes[Math.floor(t / (beat / 2)) % bassNotes.length];
  const bassEnv = 0.42 + 0.32 * Math.max(0, Math.sin(2 * Math.PI * (t / beat)));
  s += Math.tanh(Math.sin(2 * Math.PI * note * t) * 1.8) * 0.22 * bassEnv;

  const chordRoot = beatIndex % 8 < 4 ? 174.61 : 155.56;
  const pad = (
    Math.sin(2 * Math.PI * chordRoot * t) +
    Math.sin(2 * Math.PI * chordRoot * 1.25 * t) * 0.62 +
    Math.sin(2 * Math.PI * chordRoot * 1.5 * t) * 0.48
  ) * 0.035;
  s += pad * (0.65 + 0.35 * Math.sin(2 * Math.PI * 0.12 * t));

  for (const syllable of rapSyllables) {
    const local = pulse(t, beat * 4, syllable);
    if (local < 0.13) {
      const e = Math.sin(Math.PI * local / 0.13) ** 0.7;
      const formant = 185 + 42 * Math.sin(t * 9) + 22 * Math.sin(t * 17);
      const buzz = Math.sin(2 * Math.PI * formant * t) + 0.24 * Math.sin(2 * Math.PI * formant * 1.52 * t);
      const throat = Math.sin(2 * Math.PI * (formant * 0.5) * t) * 0.42;
      const rasp = noise(i * 11) * 0.055;
      s += (buzz * 0.13 + throat * 0.12 + rasp * 0.025) * e;
    }
  }

  const adlib = pulse(t, beat * 8, beat * 7.1);
  if (adlib < 0.42) {
    const e = Math.sin(Math.PI * adlib / 0.42);
    s += Math.sin(2 * Math.PI * (410 + 35 * Math.sin(t * 12)) * t) * e * 0.032;
  }

  const warm = s + Math.sin(2 * Math.PI * 92 * t) * 0.018;
  s = Math.tanh(warm * 0.92) * 0.78;
  const pan = Math.sin(2 * Math.PI * 0.07 * t) * 0.18;
  const l = clamp(s * (1 - pan));
  const r = clamp(s * (1 + pan));
  pcm.writeInt16LE(Math.round(l * 32767), (i * channels) * 2);
  pcm.writeInt16LE(Math.round(r * 32767), (i * channels + 1) * 2);
}

const dataSize = pcm.length;
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + dataSize, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(channels, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * channels * 2, 28);
header.writeUInt16LE(channels * 2, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(dataSize, 40);

fs.writeFileSync(out, Buffer.concat([header, pcm]));
console.log('wrote', out);
