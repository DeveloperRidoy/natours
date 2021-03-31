
// function for deleting one document
exports.deleteOneDoc = (Model) => async (req, res) => {
    try {
      await Model.findOneAndDelete({ _id: req.params.id });
      res.json({
        status: "success",
        message: `${Model.collection.name.slice(0, Model.collection.name.length - 1)} deleted`,
      });
    } catch (err) {
      // console.log(err);
      res.status(500).json({ status: "fail", message: err.message });
    }
  };

// function for getting all doucments
exports.getAllDocs = (Model) => async (req, res) => {
  const query = req.queryFunction && req.queryFunction.query;
  // adjusting filter for review Model
  let filter = {};

  if (Model.collection.name === 'reviews' && req.params.id) { filter.tour = req.params.id };
  
  try {
        const docs = query 
            // ? await query.explain() ...see the query stats with explain()
            ? await query.find(filter)
            : await Model.find(filter)
  
      if (query && docs.length === 0)
        return res.status(404).json({
          status: "fail",
          message: "Resource not found",
        });

      res.json({
        status: "success",
        results: docs.length,
        page: req.queryFunction ? req.queryFunction.page : undefined,
        limit: req.queryFunction ? req.queryFunction.limit : undefined,
        data: { [Model.collection.name]: docs },
      });
    } catch (err) {
      // console.log(err);
      res.status(500).json({ status: "fail", message: err.message });
  }
}
  
// function for getting single doc
exports.getDoc = (Model) => async (req, res) => {
  const doc = req[Model.collection.name] ? req[Model.collection.name]  : await Model.findById(req.params.id);
  res.json({
    status: "success",
    data: { [Model.collection.name.slice(0, Model.collection.name.length - 1 )]: doc},
  });
};


// function for updating single doc
exports.updateOneDoc = (Model) => async (req, res) => {
  // handle error created by multer fileFilter
  if (req.multerError) return res.status(req.multerError.status).json({ status: 'fail', message: req.multerError.msg });

  try {
    const updatedDoc = await Model.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true, useFindAndModify: false }
    );
    res.json({
      status: "success",
      data: { updatedDoc },
    });
  } catch (err) {
    //console.log(err);
    if (err.codeName === "DuplicateKey")
      return res.status(500).json({
        status: "fail",
        message: "Model with the same name already exists",
      });

    res.status(500).json({ status: "fail", message: err.message });
  }
};

// function for creating new doc
exports.createNewDoc = (Model) => async (req, res) => {
  // const newDoc = new Model(req.body);
  try {
    // await newDoc.save();
    // adjust req.body for reviews
    if (Model.collection.name === 'reviews' && req.params.id) {
      req.body.tour = req.params.id;
      req.body.user = req.user.id
    }

    const newDoc = await Model.create(req.body);
    
    res.json({
      message: "success",
      data: {
        [Model.collection.name.substring(0, Model.collection.name.length - 1)]: newDoc,
      },
    });     
  } catch (err) {
    // console.log(err);
    if (err.code === 11000)
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Model with the same name already exists",
        });
    res.status(500).json({ status: "fail", message: err.message });
  }
};
