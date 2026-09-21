import { Router } from 'express';
import { validateEditableWindow } from '../middlewares/validateEditableWindow.js';
import { validateWritingOpen } from '../middlewares/validateWritingOpen.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
    createPostController,
    deletePostController,
    updatePostController
} from './post.controller.js';

const router = Router();

router.post('/', validateWritingOpen, asyncHandler(createPostController));
router.put('/:id', validateWritingOpen, validateEditableWindow('post'), asyncHandler(updatePostController));
router.delete('/:id', validateWritingOpen, asyncHandler(deletePostController));

export default router;
