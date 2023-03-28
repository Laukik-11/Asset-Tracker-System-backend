const jwt = require("jsonwebtoken");

const adminAuthCheck = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  const token = bearerHeader && bearerHeader.split(" ")[1];
  if (token === null) return res.sendstatus(401);
  //   console.log(token);
  const decodedToken = jwt.verify(token, "secretkey");
  const { id, role } = decodedToken;
  req.user = id;
  if (role == "admin") next();
  else {
    res
      .status(403)
      .send({ success: false, message: "Failed to authenticate user." });
  }
};

module.exports = adminAuthCheck;
