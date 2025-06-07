const { v4: uuidv4 } = require("uuid");

function generateID() {
  return uuidv4(); // Thêm "return" để trả về kết quả
}

module.exports = { generateID };
