import express from 'express';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler.js';
import { pageErrorHandler } from './middlewares/pageErrorHandler.js';
import commentRoutes from './comments/comment.routes.js';
import pageRoutes from './pages/page.routes.js';
import postRoutes from './posts/post.routes.js';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', true);
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');
app.use(helmet());
app.use(express.json({ limit: '64kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(pageRoutes);
app.use(pageErrorHandler);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Server running on port ${port}`);
});
