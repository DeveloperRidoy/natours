const multer = require("multer");
const sharp = require("sharp");

// set up file name and destination
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "public/img/users"),
//   filename: (req, file, cb) =>
//     cb(
//       null,
//       `user-${req.user._id}-${Date.now()}.${file.mimetype.split("/")[1]}`
//     ),
// });

const storage = multer.memoryStorage();

// filtering
const fileFilter = (req, file, cb) => {
  // (1) check if file type is an image
  if (!file.mimetype.startsWith("image")) {
    req.multerError = {
      status: 400,
      message: "Not a photo!.Please provide only photos.",
    };
    return cb(null, false);
  }

  // (2) accept image if everything is ok
  return cb(null, true);
};
const upload = multer({ storage, fileFilter });

// upload single photo
exports.uploadUserPhoto = upload.single("photo");

// compress and resize single photo to square shape
exports.resizeUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();
    req.body.photo = `user-${req.user._id}-${Date.now()}.jpeg}`;

    // image processing
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.body.photo}`);
    next();
  } catch (error) {
    // console.log(erro);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}


// upload multiple tour images
exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
])

// resize multiple tour images
exports.resizeTourImages = async (req, res, next) => {
  try {
    if (!req.files) return next();

    // (1) imageCover
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);

    // (2) images
    req.body.images = [];
    req.files.images.forEach(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    })
    next();
  } catch (error) {
    // console.log(error);
    res.status(500).json({ status: "fail", message: error.message });
  }
}