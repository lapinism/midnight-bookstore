import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsDir = path.resolve(__dirname, '..', '..', 'views');

function sendView(res, fileName) {
    res.sendFile(path.join(viewsDir, fileName));
}

export function indexPage(req, res) {
    sendView(res, 'index.html');
}

export function postPage(req, res) {
    sendView(res, 'post.html');
}

export function writePage(req, res) {
    sendView(res, 'write.html');
}

export function editPage(req, res) {
    sendView(res, 'edit.html');
}
