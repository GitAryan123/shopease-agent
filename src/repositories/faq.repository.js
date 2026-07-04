import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FAQS_PATH = path.join(__dirname, '..', '..', 'data', 'faqs.json');

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export function getFaqs() {
  const data = loadJson(FAQS_PATH);
  return data.articles || [];
}
