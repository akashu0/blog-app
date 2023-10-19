/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User, { IUser } from "../models/user";
import { IGetUserAuthInfoRequest } from "../middleware/tokenCheck";
import isEmailValid from "../utils/isEmailValid";
import bcrypt from "bcrypt";
dotenv.config();
const SECRET_JWT = process.env.SECRET_JWT;

const sendToken = (id: string): string => {
  const token = jwt.sign(
    {
      id: id,
    },
    SECRET_JWT,
    { expiresIn: "10h" }
  );
  return token;
};

export const Login = async (req: Request, res: Response) => {
  try {
    const username = req.body.username as string;
    const password = req.body.password as string;
    if (!username || !password) {
      res.status(400).send({
        message: "Please provide all params",
      });
      return;
    }
    console.log(username, password);

    const userdata = await User.findOne({ username: username });

    if (!userdata) {
      return res.status(400).json({
        message: "user is not found",
      });
    }
    const isPassowrdCorrect = await bcrypt.compare(password, userdata.password);
    if (!isPassowrdCorrect) {
      return res.status(400).json({
        message: "username and password is invalid",
      });
    }
    const token = sendToken(userdata._id as string);

    res.status(200).json({
      message: "login success",
      token: token,
      imageURL: userdata.imageURL,
      username: userdata.username,
      email: userdata.email,
      fullName: userdata.fullName,
      id: userdata._id as string,
    });
  } catch (error: any) {
    res.status(500).json(error.message);
  }
};

export const GetUser = (req: IGetUserAuthInfoRequest, res: Response) => {
  User.findById(req.user.id)
    .then((user: IUser) => {
      if (!user) {
        res.status(404).send({
          message: "Account doesn't exists",
        });
        return;
      }
      res.send({
        imageURL: user.imageURL,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        id: user._id as string,
      });
      return;
    })
    .catch((error) => {
      res.status(500).send(error);
      console.log(error);
      return;
    });
};

export const Register = (req: Request, res: Response) => {
  const username = req.body.username as string;
  const email = req.body.email as string;
  const password = req.body.password as string;
  const fullName = req.body.fullName as string;
  if (!username || !email || !password || !fullName) {
    res.status(400).send({
      message: "Please provide all params",
    });
    return;
  }
  if (!isEmailValid(email)) {
    res.status(400).send({
      message: "Email is invalid",
    });
    return;
  }
  User.findOne({ username: username })
    .then(async (user) => {
      if (user) {
        res.status(409).send({
          message: "Username aleardy exists",
        });
        return;
      }
      const hashedPassowrd = await bcrypt.hash(password, 10);
      const newUser = new User();
      newUser.username = username;
      newUser.email = email;
      newUser.password = hashedPassowrd;
      newUser.fullName = fullName;
      newUser
        .save()
        .then((savedUser) => {
          res.send({
            message: "Account created successfully",
          });
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};
