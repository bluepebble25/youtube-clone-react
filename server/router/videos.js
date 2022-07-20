const express = require('express');
const router = express.Router();
// const { Video } = require('../models/Video');

const { auth } = require('../middleware/auth');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if(ext !== '.mp4') {
      return cb(res.status(400).end('only mp4 is allowed'), false);
    }
    cb(null, true);
  }
});

const upload = multer({ storage: storage }).single('file');

function makeThumbnail(originalFilePath, res) {

  let thumbnailPath = "";
  let fileDuration = "";

  ffmpeg.ffprobe(originalFilePath, function(err, metadata) {
    // console.dir(metadata); // metadata 객체에 대한 정보 출력 - streams, format
    // console.log(metadata.format.duration); // 재생시간 - 소수 ex) 12.7
    fileDuration = metadata.format.duration;
  });

  ffmpeg(originalFilePath)
    .on('filenames', function(filenames) {
      console.log("Will generate " + filenames.join(', '));
      thumbnailPath = 'uploads/thumbnails/' + filenames[0];
    })
    .on('end', function() {
      console.log('Screenshots taken');
      return res.status(201).json({
        thumbnailPath: thumbnailPath,
        fileDuration: fileDuration
      });
    })
    .on('error', function(err) {
      console.log(err);
      return res.status(500).json(err);
    })
    .screenshots({
      count: 1,
      folder: "uploads/thumbnails",
      size: '320x200',
      // %b input basename ( filename w/o extension)
      filename: 'thumbnail-%b.png'
    });

};

// =========== Video ==============

// 업로드 과정
// 1. 클라이언트로부터 받은 비디오를 저장한다.
// 2. disk에 저장된 filePath와 fileName을 클라이언트에게 전송한다.
// 3. 클라이언트로부터 받은 filePath로 썸네일을 생성하고 thumbnailPath와 재생시간(fileDuration)을 클라이언트에게 전송한다.

router.post('/uploadfiles', (req, res) => {
  upload(req, res, err => {
    if(err) {
      return res.status(500).json(err);
    }
    return res.json({
      filePath: req.file.path,
      fileName: req.file.filename
    });
  });
});

router.post('/thumbnail', (req, res) => {
  makeThumbnail(req.body.filePath, res);
});

module.exports = router;