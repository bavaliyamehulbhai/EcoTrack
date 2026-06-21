import fs from "fs";

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  fs.appendFileSync("error-log.txt", new Date().toISOString() + "\\n" + err.stack + "\\n\\n");

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
