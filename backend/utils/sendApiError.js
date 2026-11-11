import mongoose from "mongoose";

export default function sendApiError(res, error, operation) {
  const errorName = typeof error?.name === "string" ? error.name : "Error";
  const errorCode = Number.isInteger(error?.code) ? `, code ${error.code}` : "";
  console.error(`${operation} failed (${errorName}${errorCode})`);

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  return res.status(500).json({ message: "An unexpected server error occurred" });
}
