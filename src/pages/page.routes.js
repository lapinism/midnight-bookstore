import { Router } from 'express';
import { editPage, indexPage, postPage, writePage } from './page.controller.js';

const router = Router();

router.get('/', indexPage);
router.get('/posts/:id', postPage);
router.get('/write', writePage);
router.get('/edit/:id', editPage);

export default router;
