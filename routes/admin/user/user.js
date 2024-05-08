const User = require('../../../models/user_model.js')
const bcrypt = require('bcrypt');
 const jwt = require('jsonwebtoken');
 const { mongoose} = require("mongoose");

const CreateUser = async function (req, res, next) {
    
    try {
         const { username, password } = req.body;
         const saltRounds = 10;
         const hashedPassword = await bcrypt.hashSync(password, saltRounds);
         const user = new User({ _id : new mongoose.Types.ObjectId(), username : username, password: hashedPassword });
         await user.save();
         res.status(201).json("User is registered succesfully");
    } catch (error) {
         res.status(500).json( "Registration failed" );
    }
}

const Login = async function (req, res, next) {
    
    try {
         const { username, password } = req.body;
         const user = await User.findOne({ username });
         if (!user) {
         return res.status(401).json({ error: 'There is no such user' });
         }
         const passwordMatch = await bcrypt.compare(password, user.password);
         if (!passwordMatch) {
         return res.status(401).json({ error: 'Password is incorrect' });
         }
         const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
            expiresIn: '1h',
         });
 
         res.status(201).json({token});
    } catch (error) {
         res.status(500).json( "Login process failed" );
    }
}

module.exports = {CreateUser, Login}