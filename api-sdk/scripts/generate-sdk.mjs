#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import { collectSourceSpec } from '../src/source/collect-source-spec.mjs';
import { generateSdk } from '../src/generate-sdk.mjs';

function parseArgs(argv) {
  const rawNpmOut = process.env.npm_config_out;
  const normalizedNpmOut =
    rawNpmOut && rawNpmOut !== 'true' && rawNpmOut !== 'false' ? rawNpmOut : undefined;

  const npmConfig = {
    lang: process.env.npm_config_lang,
    outDir: normalizedNpmOut,
  };

  const args = {
    lang: npmConfig.lang || 'swift',
    sourceRoot: path.resolve(process.cwd(), 'src'),
    outDir: '',
  };

  if (npmConfig.outDir) {
    args.outDir = npmConfig.outDir;
  }
  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('-')) {
      positional.push(token);
      continue;
    }
    if (token === '--lang' && argv[i + 1]) {
      args.lang = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--source-root' && argv[i + 1]) {
      args.sourceRoot = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--out' && argv[i + 1]) {
      args.outDir = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--help' || token === '-h') {
      return { help: true };
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  if (positional.length > 0) {
    args.lang = positional[0];
  }
  if (positional.length > 1 && !args.outDir) {
    args.outDir = positional[1];
  }

  if (!args.outDir) {
    args.outDir = path.resolve(process.cwd(), 'api-sdk', 'generated', args.lang);
  } else {
    args.outDir = path.resolve(process.cwd(), args.outDir);
  }

  return { help: false, ...args };
}

function printHelp() {
  // eslint-disable-next-line no-console
  console.log(`Usage:
  npm run sdk:generate --lang swift --out api-sdk/generated/swift

Flags:
  --lang <language>       Target language (swift supported now)
  --source-root <dir>     Source code root to scan (default: src)
  --out <dir>             Output directory (default: api-sdk/generated/<lang>)
`);
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    printHelp();
    return;
  }

  const sourceSpec = await collectSourceSpec(parsed.sourceRoot);
  const writtenFiles = await generateSdk({
    lang: parsed.lang,
    sourceSpec,
    outputDir: parsed.outDir,
  });

  // eslint-disable-next-line no-console
  console.log(`Generated ${parsed.lang} SDK at: ${parsed.outDir}`);
  for (const file of writtenFiles) {
    // eslint-disable-next-line no-console
    console.log(`- ${file}`);
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
