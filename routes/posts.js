import express from "express"
import { addPost, addCat,deletePost, getPost, getPosts,  publishPost,  updatePost, savePost, getCategory,  adminPublish, adminReject, getPendingPost, deleteCat, addComment, admingetComment, user_addComment, user_getComment, admin_delComment, delComment, getMyBlog, editRejectedPost } from "../controllers/post.js";
import {auth} from "../middleware/auth.js"

const router=express.Router();

//user API's
router.get("/getMyBlogs/:user_id",getMyBlog)
router.get("/getAllBlogs",getPosts) //get all posts
router.get("/getBlog/:id",getPost) //view single post api 
router.post("/addblogs/:user_id",addPost) //add blog api ued while creating new blog 
router.put("/editRejectedPost/:user_id",editRejectedPost)
router.post("/save-draft",auth,savePost) // draft post api
router.post("/publish-post/:draftId",publishPost) // saving the post as published
router.post("/save-post",auth,savePost) //used for saving the post as draft and add to database
router.delete("/delete-post/:id",deletePost)//deleting the post api
router.put("/update-post/:id",auth,updatePost)//update post api
router.get("/getCategory",getCategory)//geting the categories name api
router.post("/addcat/",addCat)//add category api
router.post("/user-addComment/:id", auth, user_addComment) 
router.get("/user-getComment/:id",  user_getComment) 
router.post("/delComment/:comment_id",delComment)

//Admin API'S
router.post("/admin-publish/:Id", adminPublish) 
router.post("/admin-reject/:Id", adminReject) 
router.get("/admin-pendingblogs", getPendingPost) 
router.delete("/admin-deleteCat/:id", deleteCat) 
router.post("/admin-addComment/:id",auth, addComment) 
router.get("/admin-getComment/:id",admingetComment) 
router.post("/admin-delComment/:id",admin_delComment)

export default router