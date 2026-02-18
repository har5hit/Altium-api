import fs from 'node:fs/promises';
import path from 'node:path';
import { generateSwiftSdk } from './generators/swift/generate-swift-sdk.mjs';

const generators = {
  swift: generateSwiftSdk,
};

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeOutputFiles(outputDir, files) {
  await fs.rm(outputDir, { recursive: true, force: true });
  await ensureDir(outputDir);
  const writtenPaths = [];

  for (const file of files) {
    const filePath = path.join(outputDir, file.name);
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, file.content, 'utf8');
    writtenPaths.push(filePath);
  }

  return writtenPaths;
}

export async function generateSdk({ lang, sourceSpec, outputDir }) {
  const generator = generators[lang];
  if (!generator) {
    throw new Error(`Unsupported language "${lang}". Supported languages: ${Object.keys(generators).join(', ')}`);
  }

  const files = generator(sourceSpec);

  return writeOutputFiles(outputDir, files);
}
