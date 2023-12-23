import {Schema, mongoose} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        require: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String, //cloudinary url
        require: true,
    },
    coverImage: {
        type: String, //cloudinary url
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    password:{
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String,
    }
}, {timestamps: true})

userSchema.pre(
    "save",
    async function (next) {
        if(!this.isModified("password")) return next();  //checking if the password is changed or not if its not changed then return false if its changed then bycrypt.hast code will run which is in bleow line.
        this.password = await bcrypt.hash(this.password, 10)
        next()
    }
)

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema)