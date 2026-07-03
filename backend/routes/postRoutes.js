const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/posts', requireAuth, postController.listPosts);
router.post('/posts', requireAuth, postController.createPost);
router.get('/posts/:id', requireAuth, postController.getPost);
router.patch('/posts/:id', requireAuth, postController.updatePost);
router.delete('/posts/:id', requireAuth, postController.deletePost);
router.post('/posts/:id/comments', requireAuth, postController.addComment);
router.patch('/posts/:id/comments/:commentId', requireAuth, postController.updateComment);
router.delete('/posts/:id/comments/:commentId', requireAuth, postController.deleteComment);
router.post('/posts/:id/like', requireAuth, postController.likePost);
router.post('/posts/:id/unlike', requireAuth, postController.unlikePost);
router.post('/posts/:id/pin', requireAuth, postController.pinPost);
router.post('/posts/:id/unpin', requireAuth, postController.unpinPost);

module.exports = router;
