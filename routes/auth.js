const jwt = require("jsonwebtoken");

const userAuthCheck = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  const token = bearerHeader && bearerHeader.split(" ")[1];
  if (token === null) return res.sendstatus(401);
  //   const publickey = `-----BEGIN PUBLIC KEY-----\n${process.env.PUBLIC_KEY}\n-----END PUBLIC KEY-----`;

  const decodedToken = jwt.verify(token, "secretkey");
  const { id, role } = decodedToken;
  console.log(role);
  req.user = id;
  if (role == "employee" || role == "admin") next();
  else {
    res
      .status(403)
      .send({ success: false, message: "Failed to authenticate user." });
  }
};
module.exports = userAuthCheck;
