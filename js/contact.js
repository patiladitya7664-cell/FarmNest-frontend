// =====================================
// FARMNEST CONTACT PAGE JS
// =====================================


document.addEventListener("DOMContentLoaded",()=>{


const form =
document.getElementById("contactForm");



form.addEventListener("submit",(e)=>{


e.preventDefault();




// GET USER DATA


let name =
form.querySelector(
'input[type="text"]'
).value;



let email =
form.querySelector(
'input[type="email"]'
).value;



let subject =
form.querySelectorAll("input")[2].value;



let message =
form.querySelector("textarea").value;







// VALIDATION


if(name.length < 3){

alert(
"Please enter valid name"
);

return;

}



if(!email.includes("@")){


alert(
"Please enter valid email"
);

return;


}




if(message.length < 10){


alert(
"Message should contain minimum 10 characters"
);


return;


}







// SAVE MESSAGE


let contacts =

JSON.parse(

localStorage.getItem(
"contactMessages"
)

) || [];





let contact = {


name:name,

email:email,

subject:subject,

message:message,

date:
new Date()
.toLocaleString()


};





contacts.push(contact);





localStorage.setItem(

"contactMessages",

JSON.stringify(contacts)

);








// SUCCESS MESSAGE


alert(

"Thank you "+name+
" 🌿 Your message has been sent successfully!"

);





// RESET FORM


form.reset();



});



});