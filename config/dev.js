mongoDbPass = "HACbKMQdowghJLqL";
module.exports = {
  mongoURI: `mongodb+srv://admin:${mongoDbPass}@pmdb-eryzv.mongodb.net/test?retryWrites=true`,
  secret: process.env.NODE_ENV === "production" ? process.env.SECRET : "secret"
};
