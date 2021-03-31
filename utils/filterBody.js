const filterBody = (body, allowedFields) => {
    const filteredFields = {};

    Object.keys(body).forEach(field => {
        if (allowedFields.includes(field)) {
            filteredFields[field] = body[field];
        } else {
            throw new Error(`user doesn't have permission to update ${field}`);
        };
    })

    return filteredFields;
}

module.exports = filterBody;