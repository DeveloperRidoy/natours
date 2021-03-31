const Tour = require('../../mongodb/models/tour');

// check if name and price is provided in the request body
exports.checkFields = (...fields) => (req, res, next) => {
    const errors = [];
    fields.forEach(field => !Object.keys(req.body).includes(field) && errors.push(`${field} field is required`));
    if (errors.length > 0) return res.status(400).json({ status: 'fail', message: errors })
    next();
} 

// check if tour exists and inject in the req
exports.checkIfTourExists = async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');
    if (!tour) return res.status(404).json({ status: 'fail', message: 'no tour found' });

    // inject tour info in the request to use in the next middleware
    req.tour = tour;
    
    next();
}



// inject top five tours query in the req
exports.topFiveTours = (req, res, next) => {
    const query = Tour
        .find()
        .limit(5)
        .sort('-ratingsAverage price');
    req.queryFunction = query;
    next();
}