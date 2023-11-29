import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const token = req.header("authorization");
    const token1 = token.split(" ")[1];
    if (token1) {
      const decode = jwt.verify(token1, "jwtkey");
      req.userData = decode;
    } 
    else {
      res.status(401).json({ message: "unauthorized user" });
    }
    next(); // Continue to route 
  } catch (error) {
    res.status(401).json({ message: " unauthorized user" });
  }
};
