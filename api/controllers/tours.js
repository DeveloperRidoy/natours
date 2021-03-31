const Tour = require('../../mongodb/models/tour');
const { getAllDocs, getDoc, deleteOneDoc, updateOneDoc, createNewDoc } = require('./handlerFactory');

// @route         GET api/v1/tours
// @desc          get all tours
// @accessibility public

exports.getAllTours = getAllDocs(Tour)

// @route         GET api/v1/tours/:id
// @desc          get tour by id
// @accessibility public

exports.getTour = getDoc(Tour)

// @route         POST api/v1/tours
// @desc          create new tour
// @accessibility private

exports.createTour = createNewDoc(Tour);

// @route         patch api/v1/tours/:id
// @desc          update a tour
// @accessibility private

exports.updateTour = updateOneDoc(Tour);

// @route         DELETE api/v1/tours/:id
// @desc          Delete a tour
// @accessibility private

exports.deleteTour = deleteOneDoc(Tour);

// @route         GET api/v1/tours/tour-Stats
// @desc          Get tour stats
// @accessibility private

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverage: { $gte: 4.5 }
        }
      },
      {
        $group: {
          _id: {$toUpper: '$difficulty'}, 
          numTours: {$sum: 1},
          numRatings: {$sum: '$ratingsQuantity'},
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: {$max: '$price'}
        }
      },
      {
        $sort: {avgPrice: -1}
      },
      // {
      //   $match: {_id: {$ne: 'EASY'}}
      // }
    ])
    
    res.json({
      status: 'success',
      data: {stats}
    })

  } catch (err) {
    console.log(err);
    res.status(500).json({status: 'fail', message: err.message})
  }
}

// @route         GET api/v1/tours/monthly-plan/:year
// @desc          Get monthly plan of all tours
// @accessibility private

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            $month: '$startDates'
          },
          numTours: { $sum: 1 },
          tours: { $push: '$name' },
        }
      },
      {
        $addFields: {
          month: '$_id'
        }
      },
      {
        $project: {
        _id: 0
        }
      },
      {
        $sort: {
          numTours: -1
        }
      },
      // {
      //   $limit: 6
      // }
    ])

    res.json({
      status: 'success',
      results: plan.length,
      data: {plan}
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "fail", message: "server err" });
  }
}

// @route         GET api/v1/tours/tours-within/:distances/:latlng/unit/:unit
// @desc          Get tour via geospacial co-ordinates
// @accessiblity  private

exports.getToursWihtin = async (req, res) => {
  try {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    // (1) check if lat and lng was provided
    if(!lat || !lng) return res.status(400).json({status: 'fail', message: "Only lat was provided.Please provide lat and lng in this format: 'lat,lng'"})

    // (2) check if unit is in meter or kelometer
    if (unit !== 'ml' && unit !== 'km') return res.status(400).json({ status: 'fail', message: "unit must be 'ml' or 'km'.Here m stands for mile and km stands for kilometer" });

    // (3) setup radius based on unit
    const radius = unit === 'ml' ? distance / 3963.19 : distance / 6378.13604710633

    // (4) get the tours based on geospasial co-ordinates
    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });
      res.json({
        status: 'success',
        results: tours.length,
      data: {tours}
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}

// @route         GET api/v1/tours/get-distances/:latlng/unit/:unit
// @desc          Get tours distance from own location
// @accessiblity  private

exports.getDistances = async (req, res) => {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");
    // (1) check if lat and lng was provided
    if(!lat || !lng) return res.status(400).json({status: 'fail', message: "Only lat was provided.Please provide lat and lng in this format: 'lat,lng'"})

    // (2) check if unit is in meter or kelometer
    if (unit !== 'ml' && unit !== 'km' && unit !== 'm') return res.status(400).json({ status: 'fail', message: "unit must be 'm', 'ml' or 'km'.Here m, ml and km stands for meter, mile, kilometer respectfully" });

    // (3) set multiplier based on unit
    const multiplier = unit === "ml" ? 0.000621371 : unit === 'km' ? 0.001 : unit === 'm' && 1;

    // (4) get tours distances
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',//returns meters by default
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {distance: 1, name: 1}
      }
    ])
    
    // (4) return response
    res.json({
      status: 'success',
      results: distances.length,
      data: {distances}
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}