const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class authController {
  async login (req, res) {
    // Our login logic starts here
    try {
      // Get user input
      const {email, password} = req.body;

      // Validate user input
      if (!(email && password)) {
        res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne({email});

      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          {user_id: user._id, email},
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );

        // save user token
        user.token = token;

        // user
        res.status(200).json(user);
        console.log('login')
      } else
        res.status(400).send("Invalid Credentials");
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  }

  async registration(req, res) {
    // Our register logic starts here
    try {
      // Get user input
      const {email, password, username} = req.body;

      // Validate user input
      if (!(email && password && username)) {
        res.status(400).send("All input is required");
      }

      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await User.findOne({email});

      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }

      //Encrypt user password
      let encryptedPassword = await bcrypt.hash(password, 10);

      // Create user in our database
      const user = await User.create({
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
        username
      });

      // Create token
      const token = jwt.sign(
        {user_id: user._id, email},
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;

      // return new user
      res.status(201).json(user);
      console.log('registered')
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
    // Our register logic ends here
  }
}

module.exports = new authController();