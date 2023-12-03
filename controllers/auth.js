import { db } from "../config/db.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { emailVerification } from "../services/AuthService.js";
import * as dotenv from "dotenv";
import {forgotpasswordValidation, loginValidation, registrationValidation} from "../validation/AuthValidation.js";
import fs from "fs";
import path from "path";
import handlebars from 'handlebars'

dotenv.config();
const key = process.env.KEY;

export const forgot_password = async (req, res) => {
  try{
    const { email,newpassword } = req.body;
    const { error} = forgotpasswordValidation.validate(req.body, {
      abortEarly: false, //if there are multiple errors in the validation all of them will be shown else the execution will be stopped as soon as it encounters first error.
    });
    if (error) {
      return res.status(400).json(
        {error:"Invalid Request: ", message:error.details[0].message}
      );
    }
    await db.query("SELECT * FROM users WHERE email=?", [email], (err, data) => {
      if (data.length === 0) {
        return res.status(404).json("user not found");
      }
      else {
        const { otp, hash, hashedotp } = emailVerification(newpassword, email);
        const passwordTemplatePath = path.join( 'views', 'password.handlebars');
        const passwordTemplate = fs.readFileSync(passwordTemplatePath, 'utf-8');
        const compileTemplate = (template) => handlebars.compile(template);
        const passwordEmailTemplate = compileTemplate(passwordTemplate);
        const transporter = nodemailer.createTransport({
          service: process.env.SERVICE, // Use the appropriate email service provider
          auth: {
            user: process.env.MAIL, // Your email address
            pass: process.env.MAILPASS, // app-specific password 
          },
        });
        
        const mailOptions = {
          from: process.env.MAIL,
          to: email,
          subject: "Reset password",
          template: `password`,
          context: {
            OTP: `${otp}`, //replacing {{OTP}} in handlebar with otp value
          },
        };
      
        transporter.sendMail({...mailOptions,html: passwordEmailTemplate(mailOptions.context)}, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            res.status(500).json({ message: "Error sending email" });
          }
           else {
            res.status(200).json({ newpassword: hash, hashedotp: hashedotp });
          }
        });
      }
    });
  } catch(error){
    console.log("error",error);
    if(error){
      res.status(500).send({
        success:false,
        message:error
      })
    }
  }
};

export const verify_otp = async (req, res) => {
  try{
    const { hashedotp, email, otp, values, newpassword } = req.body;
    const [hashValue, otpExpiry] = hashedotp.split(".");
    const now = Date.now();

    if (now > parseInt(otpExpiry)) {
      return res.send("otp expired");
    }
    const otpdata = `${email}.${otp}.${otpExpiry}`;
    const newCalculatedHash = crypto
      .createHmac("sha256", key)
      .update(otpdata)
      .digest("hex");

    if (newCalculatedHash === hashValue) {
      if (newpassword) {
         db.query(`UPDATE users SET password = ? WHERE email = ?`, [newpassword, email]);
        res.status(200).send({
          success:true,
          message:"password updated successfully"        
        })
      } 
      else {
        const data = [
          values.username,
          email,
          values.password,
          values.mobile_number,
          values.address,
          values.pin,
        ];
        db.query("INSERT INTO users(`username`,`email`,`password`,`mobile_number`,`address`,`pin`) VALUES (?) ", [data]);
        res.status(200).send({
          success:true,
          message:"user registered successfully"
        })
      }
    } 
    else {
      return res.send(false);
    }
  } catch (error) {
    res.status(500).send({
      success:false,
      message:error
    })
  }
};

export const register = (req, res) => {

    //validation
    const { error, value } = registrationValidation.validate(req.body, {
      abortEarly: false, //if there are multiple errors in the validation all of them will be shown else the execution will be stopped as soon as it encounters first error.
    });
    if (error) {
      return res.send(
        "Invalid Request: " + JSON.stringify(error.details[0].message)
      );
    }

    //check existing user
    const q = "SELECT * FROM users WHERE email =? or username=?";
    db.query(q, [req.body.email, req.body.username], (err, data) => {
      if (err) {
        res.json(err);
      }
      if (data.length) {
        return res.status(409).json("user already exist");
      }
      const { password,email } = req.body;
      const { otp, hash, hashedotp } = emailVerification(password, email);
      const values = {
        username: req.body.username,
        password: hash,
        mobile_number: req.body.mobile_number,
        address: req.body.address,
        pin: req.body.pin,
      };
    
      // Send OTP to the user's email
      const RegisterEmailTemplatePath = path.join( 'views', 'main.handlebars');
      const RegisterTemplate = fs.readFileSync(RegisterEmailTemplatePath, 'utf-8');
      const compileTemplate = (template) => handlebars.compile(template);
      const RegisterEmailTemplate = compileTemplate(RegisterTemplate);
      console.log(process.env.MAIL),
      console.log(process.env.MAILPASS)
      const transporter = nodemailer.createTransport({
        service: process.env.SERVICE, // Use the appropriate email service provider
        
        auth: {
          
          user: "marufamukadam696@gmail.com", // Your email address
          pass: "ynzdphqivryvzvwv", // app-specific password
        },
      });
      const mailOptions = {
        from: process.env.MAIL,
        to: email,
        subject: "Registration mail",
        template: `password`,
        context: {
          OTP: `${otp}`, //replacing {{OTP}} in handlebar with otp value
        },
      };
      transporter.sendMail({...mailOptions,html: RegisterEmailTemplate(mailOptions.context)}, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          res.status(500).json({ message: "Error sending email" });
        } 
        else 
        {
          res.status(200).json({ hashedotp: hashedotp, values })
        }
      });
    });
};

export const login = (req, res) => {

    //validation
    const { error, value } = loginValidation.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.send(
        "Invalid Request: " + JSON.stringify(error.details[0].message)
      );
    }

    //checking if user is already existing
    const q = "SELECT * FROM users WHERE username=?";
    db.query(q, [req.body.username], (err, data) => {
      if (err) {
        return res.json(err);
      }
      if (data.length === 0) {
        return res.status(404).json("user not found");
      }
      console.log("password",data[0].password)
      //checking password
      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        data[0].password
      );
      if (!isPasswordCorrect){
        res.status(400).json("Incorrect username or password");
      }
      else {
        const role = data[0].role;
        const id=data[0].id
        // console.log(data) //for debugging
        const token = jwt.sign({ id: data[0].id }, "jwtkey");
        res.json({ token, role, id });
      }
    });
};

