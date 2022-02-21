const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');
const {mergeFiles} = require("./merge_streams.js");

const app = express();

app.use("/public", express.static(path.join(__dirname,'public')));
app.use(fileUpload({
  createParentPath: true,
}));
app.use(cors());

app.get('/index.html', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
});

app.get('/', (req, res) => {
  res.redirect('/index.html')
});

app.post("/merge", async (req, res) => {

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(500).send('No files were uploaded.');
  }
  if (Object.keys(req.files).length < 2) {
    return res.status(500).send("Please provide two files.")
  }

  const file1 = req.files.file1;
  const file2 = req.files.file2;

  const allowedType = "text/plain";
  if(file1.mimetype != allowedType || file2.mimetype != allowedType) {
    return res.status(400).send("Only text files allowed.");
  }

  console.log(JSON.stringify(file2.mimetype));

  const basePath = __dirname + "/tmp/";
  await file1.mv(basePath + file1.name);
  await file2.mv(basePath + file2.name);

  console.log(`Upload successful: ${file1.name}, ${file2.name}`);

  const downloadUrl = await mergeFiles(basePath + file1.name, basePath + file2.name);

  res.status(200).send(downloadUrl);
});

module.exports = app;