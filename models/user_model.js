const {Schema, model, mongoose} = require("mongoose");

const user_Schema = Schema({
    _id: Schema.Types.ObjectId,
    username : { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', user_Schema);

module.exports = User