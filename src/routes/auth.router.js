const express = require("express");
const { registerController, loginController, logoutController } = require("../controller/user.controller");

const Router = express.Router()
const authRouter = Router

authRouter.post("/register",registerController)
authRouter.post("/login",loginController)
authRouter.post("/logout",logoutController)

module.exports = authRouter;