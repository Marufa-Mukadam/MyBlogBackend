import { db } from "../config/db.js";

export const getUser = (req,res) => {
    const q = "SELECT username, email FROM users";
    db.query(q, (err, data) => {
      if(err){
          res.status(400).send(err)
      }
      else
      {
          return res.status(200).json(data)
      }
    })
}