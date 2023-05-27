const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json({ limit: "11mb" }));
app.use(cors());
const constrains = (req, res, next) => {
  const contentLength = parseInt(req.get("Content-Length"));
  const contentLengthMB = (contentLength / (1024 * 1024)).toFixed(3);

  if (contentLengthMB > 10) {
    return res.send(400).json({ msg: "Too large payload size" });
  }

  console.log("Payload size:", contentLengthMB, "MB");

  if (
    req.body.myFile.toString().startsWith("data:image/png") ||
    req.body.myFile.toString().startsWith("data:image/jpeg") ||
    req.body.myFile.toString().startsWith("data:image/jpg")
  ) {
    next();
  } else {
    return res.status(400).json({ msg: "Wrong image formate" });
  }
};

const port = process.env.PORT || 8080;

//------------------------model------------------------------
const postSchema = new mongoose.Schema({
  myFile: String,
});
const Post = mongoose.model("post", postSchema);

//------------------------routes------------------------------
app.get("/", async (req, res) => {
  try {
    const posts = await Post.find({});
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
  }
});

app.post("/uploads", constrains, async (req, res) => {
  const body = req.body;

  try {
    const newImage = await Post.create(body);
    res.status(201).json({ msg: "New image uploaded" });
  } catch (error) {
    console.log(error);
  }
});

//------------------------running and DB connecting------------------------------
(function start() {
  mongoose
    .connect("mongodb://localhost:27017/images")
    .then(() => {
      app.listen(port, () => {
        console.log("Connected to DB & server running on port: 8080");
      });
    })
    .catch((err) => {
      console.error(
        "Error in database connection",
        "\nRetry to connect in 5 sec"
      );
      console.log(err);
      setTimeout(start, 5000);
    });
})();
