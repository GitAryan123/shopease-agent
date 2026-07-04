import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ORDERS_PATH = path.join(__dirname, '..', '..', 'data', 'orders.json');

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export function getOrders() {
  const data = loadJson(ORDERS_PATH);
  return data.orders || [];
}
