const mongoose = require('mongoose');
const validator =  require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
        index: true, // We are indexing firstname so our search will be faster
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true, // if we make unique true then mongo db automatically creates a index for that field and unique index is more faster then normal
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Invalid Email Address!");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        validate(value) {
            if(!validator.isStrongPassword(value)) {
                throw new Error("Enter a Strong Password!");
            }
        }
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        enum: {
            values: ['male', 'female', 'others'],
            message: `{VALUE} is not a valid gender type`,
        }
        // validate(value){
        //     if(!['male', 'female', 'others'].includes(value)){
        //         throw new Error("Not a valid gender");
        //     }
        // }
    },
    photoUrl: {
        type: String,
        default: 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg',
        validate(value) {
            if(!validator.isURL(value)) {
                throw new Error("Invalid photo url");
            }
        }
    },
    about: {
        type: String,
        default: "This is a default about of th user!"
    },
    skills: {
        type: [String],
    },
}, { timestamps: true });

// Created Compound index on firstName and lastName, value can be(1, -1, 2d...)
userSchema.index({ firstName: 1, lastName: 1 }); 

// Index on one column either like this or make index:true
userSchema.index({ gender: 1 });

// Don't use arrow functions here below as arrow functions 
// does't not have there own this
userSchema.methods.getJWT = async function() {
    const user = this;
    const token = await jwt.sign({_id: user._id}, "DEV@Tinder@7", { expiresIn: '7d'});
    return token;
}

userSchema.methods.validatePassword = async function(passwordInputByUser) {
    const user = this;
    const passwordHash = user.password
    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
    return isPasswordValid;
}

module.exports = mongoose.model("User", userSchema);