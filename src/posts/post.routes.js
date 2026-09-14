import { Router } from 'express';
import { validateEditableWindow } from '../middlewares/validateEditableWindow.js';
import { validateWritingOpen } from '../middlewares/validateWritingOpen.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
    createPostController,
    deletePostController,
    getPostController,
    listPostsController,
    updatePostController
} from './post.controller.js';

const router = Router();

router.get('/', asyncHandler(listPostsController));
router.post('/', validateWritingOpen, asyncHandler(createPostController));
router.get('/:id', asyncHandler(getPostController));
router.put('/:id', validateWritingOpen, validateEditableWindow('post'), asyncHandler(updatePostController));
router.delete('/:id', validateWritingOpen, asyncHandler(deletePostController));

export default router;
