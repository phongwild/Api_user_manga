const express = require("express");
const router = express.Router();
const commentController = require('../controllers/commentControllers');

// Lấy danh sách bình luận của manga
router.get("/:mangaId", commentController.getCommentsByManga);

// CRUD bình luận
router.post("/post/:mangaId", commentController.addComment);
router.put("/edit/:mangaId/:commentId", commentController.editComment);
router.delete("/delete/:mangaId/:commentId", commentController.deleteComment);

// reply comment
router.post("/reply/:mangaId/:commentId", commentController.replyComment);
router.put("/reply/:mangaId/:commentId/:replyId", commentController.editReply);
router.delete("/reply/:mangaId/:commentId/:replyId", commentController.deleteReply);


module.exports = router;
