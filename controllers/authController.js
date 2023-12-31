import { comparePassword, hashPassword } from "../helpers/authHelper.js"
import userModel from "../models/userModel.js"
import Jwt from "jsonwebtoken"

export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.body
        // validations
        if (!name) { return res.send({ message: 'Name is required' }) }
        if (!email) { return res.send({ message: 'Email is required' }) }
        if (!password) { return res.send({ message: 'Password is required' }) }
        if (!phone) { return res.send({ message: 'Phone is required' }) }
        if (!address) { return res.send({ message: 'Address is required' }) }
        if (!answer) { return res.send({ message: 'Answer is required' }) }

        // check user
        const existingUser = await userModel.findOne({ email })

        // existing user
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: 'Already Register please Login'
            })
        }

        // register user
        const hashedPassword = await hashPassword(password)

        // save
        const user = await new userModel({ name, email, phone, address, password: hashedPassword, answer }).save()
        res.status(201).send({
            success: true, message: 'User Register Successfully', user
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false, message: "Error in Registration", error
        })

    }
};

// POST login
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validation
        if (!email || !password) {
            return res.status(404).send({ success: false, error: 'Invalid Email or Password' })
        }

        // check user
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).send({ success: false, error: 'Email is not registered' })
        }
        const match = await comparePassword(password, user.password)
        if (!match) {
            return res.status(200).send({
                success: false,
                error: 'Invalid Password',
            })
        }

        // token
        const token = await Jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
        res.status(200).send({
            success: true,
            message: 'Login Successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
            },
            token,
        })

    } catch (error) {
        res.status(500).send({
            success: false, message: "Error in Login", error
        })
    }
}

// forgetPasswordController
export const forgetPasswordController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body
        // validations
        if (!email) { return res.send({ message: 'Email is required' }) }
        if (!answer) { return res.send({ message: 'Question is required' }) }
        if (!newPassword) { return res.send({ message: 'New Password is required' }) }
        // check
        const user = await userModel.findOne({email, answer})
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Wrong Email or Answer"
            })
        }
        const hashed = await hashPassword(newPassword)
        await userModel.findByIdAndUpdate(user._id, { password: hashed })
        res.status(200).send({
            success: true,
            message: "Password reset successfully"
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error
        })
    }
}

// test controller
export const testController = (req, res) => {
    try {
        res.send('Protected Routes')
    } catch (error) {
        console.log(error)
        res.send({ error })
    }
}