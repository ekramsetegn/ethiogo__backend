// utils/emailValidator.js
const axios = require('axios');

const isEmailValid = async (email) => {
  try {
    const apiKey = process.env.MAILBOXLAYER_API_KEY;
    const response = await axios.get(
      `http://apilayer.net/api/check?access_key=${apiKey}&email=${email}&smtp=1&format=1`
    );

    console.log(" MailboxLayer response:", response.data);

    const { format_valid, mx_found, smtp_check, score } = response.data;

    return (
      format_valid === true &&
      mx_found === true &&
      smtp_check === true &&
      score > 0.5
    );
  } catch (error) {
    console.error(" MailboxLayer verification error:", error.message);
    return false;
  }
};

module.exports = isEmailValid;
