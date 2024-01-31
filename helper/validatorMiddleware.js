//  validate email
const ValidateEmail = (mail) =>
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    // alert("You have entered an invalid email address!")
    return (false)
}

// 10 digit phone number check
const phonenumber = (inputtxt) => 
{
  var phoneno = /^\d{10}$/;
  if((inputtxt.match(phoneno))){
      return true;
    }
    else
    {
    alert("message");
    return false;
    }
}

module.exports = {
    ValidateEmail,
    phonenumber
}