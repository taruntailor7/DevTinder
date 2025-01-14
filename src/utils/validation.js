const validator = require('validator');

const validateSignUpDate = (req) => {
    const {firstName, lastName, email, password} = req.body;

    if(!firstName || !lastName) {
        throw new Error("Name is required!");
    } else if(!validator.isEmail(email)) {
        throw new Error("Email is not valid!");
    } else if(!validator.isStrongPassword(password)) {
        throw new Error("Please enter a string password");
    }
}

const validateEditProfileData = (req) => {
    const data = req.body;

    const ALLOWED_UPDATED = ["firstName", "lastName", "email", "photoUrl", "about", "gender", "age", "skills"];

    const isEditAllowed = Object.keys(data).every((field) =>
      ALLOWED_UPDATED.includes(field)
    );

    return isEditAllowed;
}

module.exports = {
    validateSignUpDate,
    validateEditProfileData
}