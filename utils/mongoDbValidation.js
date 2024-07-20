const mongoose = require('mongoose');

const mongoDbValidation = (id) => {
  console.log('Validating ID:', id);  // Add this line
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid MongoDB ID');
  }
};

module.exports = mongoDbValidation;
