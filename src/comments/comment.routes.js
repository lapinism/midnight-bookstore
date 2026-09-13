import { Router } from 'express';
import { validateWritingOpen } from '../middlewares/validateWritingOpen.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
    createCommentController,
    deleteCommentController,
    updateCommentController
} from './comment.controller.js';

const router = Router();

router.post('/', validateWritingOpen, asyncHandler(createCommentController));
router.put('/:id', validateWritingOpen, asyncHandler(updateCommentController));
router.delete('/:id', validateWritingOpen, asyncHandler(deleteCommentController));

export default router;
