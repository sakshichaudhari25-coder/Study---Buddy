import jwt from 'jsonwebtoken'
import mongoose from "mongoose";

const authMiddleware=(req,res,next)=>{
    try{
        if (!process.env.JWT_SECRET) {
            return res.status(503).json({
                message:"Authentication is temporarily unavailable",
            })
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                message:"Authentication required. Please login.",
            })
        }
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        if (
            typeof decoded !== "object" ||
            typeof decoded.userId !== "string" ||
            !mongoose.isValidObjectId(decoded.userId)
        ) {
            return res.status(401).json({
                message:"Invalid or expired token"
            })
        }

        req.userId = decoded.userId;

        next()
    }catch{
        return res.status(401).json({
            message:"Invalid or expired token"
        })
    }
}

export default authMiddleware