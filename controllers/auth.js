import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../connect.js";

export const register = (req, res) => {
  //CHECK USER IF EXISTS

  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");
    //CREATE A NEW USER
    //Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const q =
      "INSERT INTO users (`username`,`email`,`password`,`name`) VALUE (?)";

    const values = [
      req.body.username,
      req.body.email,
      hashedPassword,
      req.body.name,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created.");
    });
  });
};

export const login = (req, res) => {
  // 1. Validate user credentials
  const q = "SELECT * FROM users WHERE username = ?";
  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    const checkPassword = bcrypt.compareSync(req.body.password, data[0].password);
    if (!checkPassword) {
      return res.status(400).json("Wrong password or username!");
    }

    // 2. Generate JWT token with appropriate expiration time
    const token = jwt.sign({ id: data[0].id }, "secretkey", { expiresIn: "1h" });  // Adjust expiration time as needed

    // 3. Set cookie with secure and HttpOnly flags for enhanced security
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: true, // Only set secure flag if using HTTPS in production
        sameSite: "none", // Mitigate CSRF attacks (consider additional CSRF protection)
      })
      .status(200)
      .json({ message: "Login successful!", user: { ...data[0] } }); // Optionally send sanitized user data
  });
};

export const logout = (req, res) => {
  res.clearCookie("accessToken",{
    secure:true,
    sameSite:"none"
  }).status(200).json("User has been logged out.")
};