import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend which is postman
    // validation -- not empty
    // check if user is already exist or not: using username and email
    // check for images or  check for avatar require avatar
    // upload them to cloudinary
    // check the avatar is getting uploaded in cloudinary
    // create user object - create entry in db
    // remove password and refreshtoken field from response
    // check for user creation 
    // return response(res).

    //get user details
    const {fullname, username, email, password} = req.body
    console.log("email", email);
    // validation part
    // if(fullname === ""){
    //     throw new ApiError(400, "fullname is required")
    // }
    if(
        [fullname, email, username, password].some((field) => {
            return field?.trim() === ""
        })
    ){
        throw new ApiError(400, "All fields are required")
    }

    //check user is alreay there or not
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists.")
    }

    
    //check for image and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    console.log('getting request.files:',req.files);

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // check if the avatar is there in cloudinary or not
    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    //entry in the db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // check if user is is created or not 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
} )

export {registerUser}