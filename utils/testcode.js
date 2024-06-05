/*
    In JavaScript, call, apply, and bind are methods that allow you to manipulate how a function is called and what 
    
    context it has when it's executed. They are used to set the value of this explicitly and can also be used to 
    
    pass arguments to the function. Here's a brief explanation of each: 
*/

/*

    call: This method calls a function with a given this value and arguments provided individually.

    apply: This method calls a function with a given this value and arguments provided as an array (or an array-like object).

    bind: This method creates a new function that, when called, has its this keyword set to a specified value. It also allows you to 
    
    pre-assign some arguments.

*/

function greetUser(message) {
    console.log(message + 'My name is' + this.name + '.')
}

const user1 = {
    name: "John"
}

const user2 = {
    name: "John"
}
const user3 = {
    name: "John"
}

// Greet users using different methods
console.log(greetUser.call(user1, "Hello"))