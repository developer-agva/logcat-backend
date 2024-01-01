const mongoose = require('mongoose');
// const otpGenerator = require('otp-generator');

const makeId = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

const removeAllSpecialChars = (text) => {
  return text.replace(/[^a-zA-Z]/g, "");
}

const getDaysArray = function (start, end) {
  for (
    var arr = [], dt = new Date(start);
    dt <= end;
    dt.setDate(dt.getDate() + 1)
  ) {
    arr.push(new Date(dt).toISOString().split("T")[0]);
  }
  return arr;
};

const checkCollectionName= async (projectName) => {
  // const collecctionName = await mongoose.connection.db.getCollectionNames()
  
  const collectionNameList = (await mongoose.connection.db.listCollections().toArray()).map(name => name.name)
  
  const isCollectionExist = collectionNameList.filter(collectionName => collectionName !== projectName); 
  console.log(isCollectionExist)

  if (!isCollectionExist) return true

  return false
}

const checkMD5 = (md5Hash)=>{
  // Regular expression to check if string is a MD5 hash
  const regexExp = /^[a-f0-9]{32}$/gi;

  return regexExp.test(md5Hash);
}

module.exports = {
  makeId,
  removeAllSpecialChars,
  getDaysArray,
  checkCollectionName,
  checkMD5
}