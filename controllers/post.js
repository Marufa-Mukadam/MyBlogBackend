import { db } from "../config/db.js";
import jwt from "jsonwebtoken";
import { blogValidation } from "../validation/PostValidation.js";

export const savePost = (req, res) => {
  //flag true(1) means draft flag false(0) means publish
    const { title, description, category, other_category, img } = req.body;
    const { error, value } = blogValidation.validate(req.body, {
      abortEarly: false,
    });
    
    const flag = 1;
    if (error) {
      return res.send(
        "Invalid Request: " + JSON.stringify(error.details[0].message)
      );
    }
    const decode = req.userData;
    const sql =
      "INSERT INTO posts (`title`,`description`,`category`,`other_category`,`img`,`flag`,`user_id`) VALUES (?,?,?,?,?,?,?)";
    db.query(
      sql,
      [title, description, category, other_category, img, flag, decode.id],
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).json(err);
        } 
        else {
          res.status(200).json({ message: "Success", flag: flag });
        }
      }
    );
};

export const publishPost = (req, res) => {
    const { draftId } = req.params;
    const isdraft = 2; //pending
    const sql = "UPDATE posts SET `flag` = ? WHERE `id` = ?";
    db.query(sql, [isdraft, draftId], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Error updating status" });
      } 
      else {
        return res.status(200).json({ message: "published ", flag: isdraft });
      }
    });
};

export const getPosts = (req, res) => {
    const search_category = req.query.search;
    const flag = "false";
    const search_category_value = search_category ? search_category : "";
    const q = `SELECT p.id, username,title,description,p.img,category,other_category,date,flag FROM posts p JOIN users u ON u.id=p.user_id WHERE flag=? and category LIKE '${search_category_value}%'  ORDER BY id desc `;
    db.query(q, flag, (err, data) => {
      if (err) {
        res.status(500).send(err);
      } 
      else {
        return res.status(200).send(data);
      }
    });
};

export const getPost = (req, res) => {
    const q =
      "SELECT p.id, `username`, `title`, `description`, p.img, `category`,`other_category`, `date`, p.user_id FROM users u JOIN posts p ON u.id = p.user_id WHERE p.id = ? ";
    db.query(q, [req.params.id], (err, data) => {
      if (err) {
        res.status(500).json(err);
      } 
      else {
        return res.status(200).json(data[0]);
      }
    });
};

export const addPost = (req, res) => {
    const { user_id } = req.params;
    const date = new Date();
    const flag = 2;
    const { error, value } = blogValidation.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.send(
        "Invalid Request: " + JSON.stringify(error.details[0].message)
      );
    }
    let data = ''
    if(req.body.category ){
    const q1 = "select id from category where name = ?"
     data = db.query(q1,[req.body.category],(err,data1)=>{
      return data1
    })
    console.log("daaataaaa", data)
    
    }
    const q =
      "INSERT INTO posts(`title`, `description`, `img`, `date`,`user_id`,`category`,`other_category`,flag,`category_id`) VALUES (?)";
    const values = [
      req.body.title,
      req.body.description,
      req.body.img,
      date,
      user_id,
      req.body.category,
      req.body.other_category,
      flag,
      1
    ];
    db.query(q, [values], (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      } 
      else {
        return res.status(200).json({ message: "post created", flag: flag });
      }
    });
};

export const deletePost = (req, res) => {
    const postId = req.params.id;
    const q = "DELETE FROM posts Where id = ? AND posts.user_id = ?;";
    db.query(q, [postId, req.body.user_id], (err, data) => {
      if (err) {
        console.log(err);
        return res.status(403).json(err);
      } 
      else {
        return res.status(200).send("Post has been deleted!");
      }
    });
};

export const updatePost = (req, res) => {
    const decode = req.userData;
    const { error, value } = blogValidation.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.send(
        "Invalid Request: " + JSON.stringify(error.details[0].message)
      );
    }
    const flag = 1;
    const postId = req.params.id;
    const q =
      "UPDATE posts SET `title`=?,`description` = ? , `img` = ? ,`category` = ? ,`other_category`=?, `flag` = ? WHERE `id` = ? AND `user_id`=? ";

    db.query(
      q,
      [
        req.body.title,
        req.body.description,
        req.body.img,
        req.body.category,
        req.body.other_category,
        flag,
        postId,
        decode.id,
      ],
      (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } 
        else {
          return res.json("Post has been updated.");
        }
      }
    );
};

export const editRejectedPost = (req, res) => {

  const { error, value } = blogValidation.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.send(
      "Invalid Request: " + JSON.stringify(error.details[0].message)
    );
  }
  const flag = 2;
  const { user_id } = req.params;
  const { post_id } = req.body;
  const q =
    "UPDATE posts SET `title`=?, `description`=?, `img`=?, `category`=?, `other_category`=?, `flag`=? WHERE `id`=? AND `user_id`=?";

  db.query(
    q,
    [
      req.body.title,
      req.body.description,
      req.body.img,
      req.body.category,
      req.body.other_category,
      flag,
      post_id,
      user_id,
    ],
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).json(err);
      } else {
        return res.json("Post has been updated.");
      }
    }
  );
};

export const user_addComment = (req, res) => {
  const decode = req.userData;
  const { id } = req.params;
  const { comment, comment_title } = req.body;
  let { parent_id } = req.body;
  const date = new Date();
  if (parent_id === "") {
    parent_id = null;
  }
  // const comment = { text, parent_id };

  const sql =
    "INSERT INTO user_comment (`user_post_id`,`user_id`,`comments`, `comment_title`, `comment_date`,`parent_id`) VALUES (?,?,?,?,?,?)";
  db.query(
    sql,
    [id, decode.id, comment, comment_title, date, parent_id],
    (err, result) => {
      if (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ error: "Error adding comment" });
        return;
      } 
      else {
        console.log("Comment added successfully.");
        res.status(200).json({ message: "Comment added successfully" });
      }
    }
  );
};

export const user_getComment = (req, res) => {
    const { id } = req.params;
    const status = "active";
    const sql = `
      SELECT c.id, c.user_post_id, c.user_id, c.comments, c.comment_title, c.comment_date, c.parent_id, u.username,u.role
      FROM user_comment c
      JOIN users u ON c.user_id = u.id WHERE user_post_id=? and status= ? ORDER BY c.id 
    `;

    const fetchComments = (callback) => {
      db.query(sql, [id, status], (err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, result);
      });
    };

    const formatComments = (comments, parentId = null) => {
      return comments
        .filter((comment) => comment.parent_id === parentId)
        .map((comment) => {
          const replies = formatComments(comments, comment.id);
          if (replies.length > 0) {
            comment.replies = replies;
          }
          return comment;
        });
    };

    try {
      fetchComments((err, comments) => {
        if (err) {
          res.status(400).json(err);
        } 
        else {
          const nestedComments = formatComments(comments);
          res.status(200).json(nestedComments);
        }
      });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
};

export const delComment = (req, res) => {
  const { comment_id } = req.params;
  const status = "inactive";
  const sql = "UPDATE user_comment SET status=? where id=? or parent_id=? ";
  db.query(sql, [status, comment_id, comment_id], (err, result) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.status(200).json({ message: "comment deleted successfully" });
    }
  });
};

export const getMyBlog = (req, res) => {
  const { user_id } = req.params;
  const q = `SELECT p.id,p.title,p.description,p.img,p.category,p.other_category,p.flag FROM posts p WHERE p.user_id=${user_id} ORDER BY p.id desc `;
  db.query(q, (err, data) => {
    if (err) {
      res.status(500).send(err);
    }
    else {
      return res.status(200).json(data);
    }
  });
};

export const searchCategory = (req, res) => {
  const search_category = req.body;
  const q = `SELECT name from category where name LIKE '%${search_category}%' 
  LIMIT 10`;
  db.query(q, (err, data) => {
    if (err) {
      res.status(500).json({ error: err });
    } 
    else {
      console.log(data);
      return res.status(200).json(data);
    }
  });
};

//ADMIN

export const adminPublish = (req, res) => {
    const { Id } = req.params;
    const flag = 0; //Published
    const sql = `UPDATE posts SET flag = ? WHERE id = ?`;
    db.query(sql, [flag, Id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Error updating status" });
      } else {
        return res.status(200).json({ message: "published", flag: flag });
      }
    });
};

export const adminReject = (req, res) => {
    const { Id } = req.params;
    const flag = 3; //Published
    const sql = `UPDATE posts SET flag = ? WHERE id = ?`;
    db.query(sql, [flag, Id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Error updating status" });
      } 
      else {
        return res.status(200).json({ message: "Post rejected", flag: flag });
      }
    });
};

export const getPendingPost = (req, res) => {
    const q =
      "SELECT p.id AS post_id, u.id AS user_id,`username`,`title`,`description`,p.img,`category`,`other_category`,`date`,`flag` FROM posts p JOIN users u ON u.id=p.user_id WHERE flag=? OR flag = ?  ORDER BY date  ";
    const pending = 2;
    const rejected = 3;
    db.query(q, [pending, rejected], (err, data) => {
      if (err) {
        res.status(500).send(err);
      }
      return res.status(200).send(data);
    });
};

export const getCategory = (req, res) => {
    const sqlSelect = "SELECT * FROM category ORDER BY id desc";
    db.query(sqlSelect, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).json(err);
      } 
      else {
        res.status(200).json(result);
      }
    });
};

export const addCat = (req, res) => {
    const q = "SELECT * FROM category where name=?";
    db.query(q, [req.body.category], (err, data) => {
      if (err){
        return res.json(err);
      }
      if (data.length > 0){
        return res.status(400).json({ message: "category already exist" });
      }
      else {
        const sqlSelect = "INSERT INTO category (`name`) VALUES (?)";
        db.query(sqlSelect, [req.body.category], (err, result) => {
          if (err) {
            res.status(400).json(err);
          } 
          else {
            res.status(200).json({ message: "Success" });
          }
        });
      }
    });
};

export const deleteCat = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE c FROM category c LEFT JOIN (SELECT category, COUNT(id) AS count FROM posts GROUP BY category) p ON c.name = p.category WHERE c.id = ? AND (p.count IS NULL OR p.count = 0)`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      res.status(400).json(err);
    } 
    else {
      if (result.affectedRows > 0) {
        res.status(200).json({ message: "category deleted successfully" });
      } 
      else {
        res
          .status(400)
          .json({ message: "category not found or cannot be deleted " });
      }
    }
  });
};

//comment API

// export const addComment = (req, res) => {
//   const { id } = req.params;
//   const { comment, user_id } = req.body;
//   const date = new Date();
//   const sql ="INSERT INTO comments (`text`,`post_id`,`user_id`,`comment_date`) VALUES (?)";
//   const values = [comment, id, user_id, date];
//   try{
//   db.query(sql, [values], (err, result) => {
//     if (err) {
//       res.status(400).json(err);
//     } else {
//       res.status(200).json({ message: "Success" });
//     }
//   })}catch(err){
//     res.status(500).json({error:"Internal server error"})
//   }
// };

//SELECT p.id, `username`,`title`,`description`,p.img,`category`,`other_category`,`date`,`flag` FROM posts p JOIN users u ON u.id=p.user_id WHERE category=? AND flag=?  ORDER BY id desc

// export const admingetComment = (req, res) => {
//   const {id}=req.params
//   const sql = "SELECT c.id,c.post_id,c.user_id,c.text,c.comment_date,c.parent_id, u.username FROM comments c join users u on c.user_id=u.id where post_id=? ";

//   // Format comments into a nested JSON structure

//   try{
//   db.query(sql, [id], (err, result) => {
//     if (err) {
//       res.status(400).json(err);
//     } else {
//       console.log({result})

//     }
//   })}catch(err){
//     res.status(500).json({error:"Internal server error"})
//   }
//};

export const admingetComment = (req, res) => {
    const { id } = req.params;
    const status = "active";
    const sql = `
      SELECT c.id, c.post_id, c.user_id, c.comment_title, c.text, c.comment_date, c.parent_id, u.username,u.role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE post_id = ? and status = ? ORDER BY c.id 
    `;

    const fetchComments = (callback) => {
      db.query(sql, [id, status], (err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, result);
      });
    };

    const formatComments = (comments, parentId = null) => {
      return comments
        .filter((comment) => comment.parent_id === parentId)
        .map((comment) => {
          const replies = formatComments(comments, comment.id);
          if (replies.length > 0) {
            comment.replies = replies;
          }
          return comment;
        });
    };

    try {
      fetchComments((err, comments) => {
        if (err) {
          res.status(400).json(err);
        } 
        else {
          const nestedComments = formatComments(comments);
          res.status(200).json(nestedComments);
        }
      });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
};

export const addComment = (req, res) => {
    const decode = req.userData;
    const { id } = req.params;
    const { comment, comment_title } = req.body;
    let { parent_id } = req.body;
    const date = new Date();
    if (parent_id === "") {
      parent_id = null;
    }
   
    const sql =
      "INSERT INTO comments (`text`,`post_id`,`user_id`,`comment_date`,`comment_title`,`parent_id`) VALUES (?,?,?,?,?,?)";
    db.query(
      sql,
      [comment, id, decode.id, date, comment_title, parent_id],
      (err, result) => {
        if (err) {
          console.error("Error adding comment:", err);
          res.status(500).json({ error: "Error adding comment" });
          return;
        } 
        else {
          console.log("Comment added successfully.");
          res.status(200).json({ message: "Comment added successfully" });
        }
      }
    );
};

export const admin_delComment = (req, res) => {
    const { id } = req.params;
    const status = "inactive";
    const sql = "UPDATE comments SET status=? where id=? or parent_id=? ";
    db.query(sql, [status, id, id], (err, result) => {
      if (err) {
        res.status(500).json({ error: "error deleting comment" });
      } 
      else {
        res.status(200).json({ message: "comment deleted successfully" });
      }
    });
};
