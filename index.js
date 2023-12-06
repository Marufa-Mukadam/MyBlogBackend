import express from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import cors from 'cors';
// import {getFileStream, uploadFile} from './s3.js'  //cloud code
import fs from 'fs';
import utils from 'util'
import exphbs from "express-handlebars"
const app = express();
//const unlinkFile=utils.promisify(fs.unlink)
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "D:/My-Blog-live/My-Blog/my-blog-client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname); //datenow is used to prevent overriding of file
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), function (req, res) {
  const file = req.file;
  res.status(200).json(file.filename);
});

const hbs= exphbs.create({
  extname: ".handlebars",
  layoutsDir: "D:\\My-Blog\\my-blog\\api\\views\\layouts",
  defaultLayout: "main",
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "D:\\My-Blog\\my-blog\\api\\views");

app.get("/",(req,res)=>{
  res.send("hello")
})
//CLOUD CODE
// app.get ("/images/:key",(req,res)=>{
//   const key=req.params.key
//   const readStream=getFileStream(key)
//   readStream.pipe(res)
// })
// app.post("/api/upload", upload.single("image"), async (req, res) => {
//   const file = req.file;
//   const result=await uploadFile(file)
//   await unlinkFile(file.path)
//   console.log("image key",result.key)
//   res.send({imagePath:`/images/${result.key}`})
//   // res.status(200).json(file.filename);
// });
//paramaeter:1st route,middleware,function

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

export {hbs}
const port = 3002
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});