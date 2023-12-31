
const jwt = require("jsonwebtoken");


const tokengenerate = (user ) => {
  
  return (token = jwt.sign({ user }, process.env.SECRET));
};

const verifytoken = (req, res, next) => {
  let token =
    req.body.authorization ||
    req.query.authorization ||
    req.headers["authorization"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
  
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET);
    

    req.user = decoded.user;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
    return next();
};
const verifyadmintoken = (req, res, next) => {
  let token =
    req.body.authorization ||
    req.query.authorization ||
    req.headers["authorization"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    token = token.split(" ")[1];
    
    const decoded = jwt.verify(token, process.env.SECRET);
    
    if (decoded.user.user_type != "admin") {
      res.status(200).send({ message: "Only admin have credentials" });
    }
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};
const verifybuyertoken = (req, res, next) => {
  let token =
    req.body.authorization ||
    req.query.authorization ||
    req.headers["authorization"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    token = token.split(" ")[1];
    
    const decoded = jwt.verify(token, process.env.SECRET);
    
    if (decoded.user.user_type != "buyer") {
      res.status(200).send({ message: "Only admin have credentials" });
    }
    
    req.user = decoded.user;
  } catch (err) {
    return res.status(401).send("Only buyer can request for this API");
  }
  return next();
};
const verifyrefertoken = (data)=>{
  
  return jwt.verify(data, process.env.SECRET).user;
}
module.exports = { tokengenerate, verifytoken, verifyadmintoken ,verifybuyertoken,verifyrefertoken};
