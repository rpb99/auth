const User = require("../models/User");
const { Sequelize } = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password)
      res.status(400).res.json({ success: false, msg: "Login failed" });

    // check user
    const user = await User.findOne({
      where: { [Op.or]: [{ email }, { username: email }] },
    });

    if (!user)
      res.status(401).json({ success: false, msg: "Invalid credentials" });

    // Check password matches
    const isMatch = await user.isMatch(password);

    if (!isMatch)
      res.status(401).json({
        success: false,
        msg: "Invalid credentials",
      });

    sendTokenRes(user, 200, res);
  },
  async register(req, res) {
    const { username, email, password } = req.body;

    const user = await User.create({
      username,
      email,
      password,
    });

    sendTokenRes(user, 200, res);
  },
  async logout(req, res) {
    res.cookie("token", "none", {
      expires: new Date(new Date().getTime() + 3 * 1000),
      httpOnly: true,
    });
    res.json({ success: true, data: {} });
  },
  async currentUser(req, res) {
    const user = await User.findOne({
      attributes: ["username", "email"],
      where: { id: req.user.id },
    });
    res.json(user);
  },
};

const sendTokenRes = (user, statusCode, res) => {
  const token = user.generateAccessToken();
  const options = {
    sameSite: "strict",
    path: "/",
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") options.secure = true;

  res.status(statusCode).cookie("token", token, options).json({
    sucess: true,
    token,
  });
};
