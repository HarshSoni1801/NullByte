const validator = require('validator');

function validate(data) {
  const mandatoryFields = ['firstName', 'emailId', 'password'];
  
  // Check for missing fields
  for (const field of mandatoryFields) {
    if (!data[field]) {
      throw new Error(`Mandatory field '${field}' is missing`);
    }
  }
  
  if (!validator.isEmail(data.emailId)) {
    throw new Error('Invalid email format');
  }
  
  if (!validator.isStrongPassword(data.password)) {
    throw new Error('Password must be strong, include uppercase, lowercase, number and symbol');
  }
}

module.exports = validate;