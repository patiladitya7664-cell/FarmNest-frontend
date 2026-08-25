/*
==========================================================
   FARMNEST JAVASCRIPT v1.0
==========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       LOADER
    ========================== */

    const loader = document.querySelector(".loader");

    window.addEventListener("load", () => {

        setTimeout(() => {

            if (loader) {
                loader.style.opacity = "0";
                loader.style.visibility = "hidden";
            }

        }, 1000);

    });

    /* ==========================
       MOBILE MENU
    ========================== */

    const menuBtn = document.querySelector(".menu-btn");
    const nav = document.querySelector("nav");

    if (menuBtn) {

        menuBtn.addEventListener("click",()=>{

            nav.classList.toggle("showMenu");

        });

    }

    /* ==========================
       STICKY HEADER
    ========================== */

    const header = document.querySelector("header");

    window.addEventListener("scroll",()=>{

        if(window.scrollY>80){

            header.classList.add("sticky");

        }else{

            header.classList.remove("sticky");

        }

    });

    /* ==========================
       ACTIVE NAVIGATION
    ========================== */

    const links=document.querySelectorAll("nav a");

    links.forEach(link=>{

        if(link.href===window.location.href){

            link.classList.add("active");

        }

    });

    /* ==========================
       SMOOTH SCROLL
    ========================== */

    document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

        anchor.addEventListener("click",function(e){

            e.preventDefault();

            const target=document.querySelector(this.getAttribute("href"));

            if(target){

                target.scrollIntoView({

                    behavior:"smooth"

                });

            }

        });

    });

});
/* =====================================================
   FARMNEST ABOUT PAGE ANIMATIONS
===================================================== */


document.addEventListener("DOMContentLoaded",()=>{


/* ================= COUNTER ANIMATION ================= */


const counters = document.querySelectorAll(".stats h2");


counters.forEach(counter=>{


let target = counter.innerText;


let number = parseInt(
target.replace(/[^0-9]/g,'')
);


let suffix = target.replace(/[0-9]/g,'');


let count = 0;


let speed = number / 100;



let updateCounter = ()=>{


if(count < number){


count += speed;


counter.innerText =
Math.ceil(count)+suffix;


setTimeout(updateCounter,20);


}

else{


counter.innerText =
number + suffix;


}


};



updateCounter();



});








/* ================= SCROLL REVEAL ================= */


const revealElements =
document.querySelectorAll(
".mission-card,.farmer-card,.why-grid div,.team-card,.gallery-grid img"
);



const revealOnScroll = ()=>{


revealElements.forEach(element=>{


let position =
element.getBoundingClientRect().top;


let screen =
window.innerHeight - 100;



if(position < screen){


element.style.opacity="1";

element.style.transform="translateY(0)";


}


});


};





revealElements.forEach(element=>{


element.style.opacity="0";


element.style.transform=
"translateY(40px)";


element.style.transition=
"0.8s ease";


});



window.addEventListener(
"scroll",
revealOnScroll
);


revealOnScroll();



});

/* =====================================================
   FARMNEST REGISTER FUNCTIONALITY
===================================================== */


document.addEventListener("DOMContentLoaded",()=>{



const userType =
document.getElementById("userType");



const farmerDetails =
document.getElementById("farmerDetails");





/* ================= SHOW FARMER DETAILS ================= */


if(userType){



userType.addEventListener(
"change",
()=>{


if(userType.value==="farmer"){


farmerDetails.style.display="flex";


}

else{


farmerDetails.style.display="none";


}


});


}







/* ================= REGISTER SYSTEM ================= */


const registerForm =
document.getElementById("registerForm");



if(registerForm){



registerForm.addEventListener(
"submit",
(e)=>{


e.preventDefault();




let name =
document.getElementById("regName").value;



let email =
document.getElementById("regEmail").value;



let phone =
document.getElementById("regPhone").value;



let password =
document.getElementById("regPassword").value;



let type =
document.getElementById("userType").value;







let users =

JSON.parse(
localStorage.getItem("users")
)

||

[];







/* Duplicate Email Check */


let exists =
users.find(
user=>user.email===email
);



if(exists){


alert(
"Email already registered!"
);


return;


}







let newUser={


name:name,


email:email,


phone:phone,


password:password,


type:type


};







users.push(newUser);




localStorage.setItem(
"users",
JSON.stringify(users)
);





/* Auto Login */


localStorage.setItem(
"user",
JSON.stringify(newUser)
);






alert(
"Registration Successful 🌱"
);





if(type==="farmer"){


window.location.href=
"farmer/dashboard.html";


}

else{


window.location.href=
"HOMEPAGE/index.html";


}





});



}



});
/* =====================================================
   FARMNEST LOGIN FUNCTIONALITY
===================================================== */


document.addEventListener("DOMContentLoaded",()=>{





/* ================= PASSWORD SHOW/HIDE ================= */


const showPassword =
document.getElementById("showPassword");



const passwordInput =
document.getElementById("loginPassword");



if(showPassword){



showPassword.addEventListener(
"click",
()=>{



if(passwordInput.type==="password"){



passwordInput.type="text";


showPassword.classList.remove(
"fa-eye"
);



showPassword.classList.add(
"fa-eye-slash"
);



}

else{


passwordInput.type="password";


showPassword.classList.remove(
"fa-eye-slash"
);



showPassword.classList.add(
"fa-eye"
);



}



});



}







/* ================= LOGIN SYSTEM ================= */



const loginForm =
document.getElementById("loginForm");



if(loginForm){



loginForm.addEventListener(
"submit",
(e)=>{


e.preventDefault();





let email =
document.getElementById("loginEmail")
.value;



let password =
document.getElementById("loginPassword")
.value;







let users =

JSON.parse(
localStorage.getItem("users")
)

||

[];







let user =

users.find(
u=>
u.email===email
&&
u.password===password
);








if(!user){


alert(
"Invalid Email or Password ❌"
);


return;


}







/* SAVE SESSION */


localStorage.setItem(

"user",

JSON.stringify(user)

);







/* REMEMBER ME */


let remember =
document.getElementById("remember");



if(remember.checked){


localStorage.setItem(
"remember",
"true"
);


}







alert(
"Login Successful 🌱"
);








/* REDIRECT */


if(user.type==="farmer"){



window.location.href=

"farmer/dashboard.html";



}

else{


window.location.href=

"HOMEPAGE/index.html";


}



});



}





});
/* =====================================================
   FARMNEST FARMER DASHBOARD FUNCTIONALITY
===================================================== */


/* ================= SECTION SWITCHING ================= */


function showSection(sectionId){


let sections =

document.querySelectorAll(
".farmer-section"
);



sections.forEach(section=>{


section.classList.remove(
"active"
);



});





let selected =

document.getElementById(
sectionId
);



if(selected){


selected.classList.add(
"active"
);


}



}







document.addEventListener(
"DOMContentLoaded",
()=>{






const farmerDashboard =

document.querySelector(
".farmer-dashboard"
);



if(!farmerDashboard)

return;







/* ================= LOAD FARMER DATA ================= */


let user =

JSON.parse(
localStorage.getItem("user")
)

||

null;





const farmerName =

document.querySelector(
".farmer-profile"
);





if(user && farmerName){


farmerName.innerHTML = `


<i class="fa-solid fa-user"></i>


${user.name}



`;



}







/* ================= DEFAULT SECTION ================= */


showSection(
"dashboard"
);







/* ================= LOGOUT ================= */


const logout =

document.createElement(
"button"
);



logout.innerHTML = `

<i class="fa-solid fa-right-from-bracket"></i>

Logout

`;



logout.className =
"logout-btn";



logout.onclick = ()=>{


localStorage.removeItem(
"user"
);



alert(
"Logged Out Successfully 👋"
);



window.location.href =
"../login.html";



};




document.querySelector(
".farmer-sidebar"
)
.appendChild(
logout
);





});
/* =====================================================
   FARMNEST FARMER - MY CROPS SYSTEM
===================================================== */



document.addEventListener("DOMContentLoaded",()=>{





const cropForm =

document.getElementById(
"cropForm"
);




const cropList =

document.getElementById(
"cropList"
);





if(!cropForm || !cropList)

return;







let crops =

JSON.parse(
localStorage.getItem("crops")
)

||

[];








/* ================= DISPLAY CROPS ================= */


function displayCrops(){



cropList.innerHTML="";



crops.forEach(
(crop,index)=>{





let card =

document.createElement(
"div"
);



card.className =
"crop-card";






card.innerHTML = `



<img src="

${crop.image ||

'../images/crops.jpg'}

">


<div class="crop-card-content">



<h3>

${crop.name}

</h3>



<p>

Type:

${crop.type}

</p>



<p>

Quantity:

${crop.quantity} kg

</p>



<p>

Price:

₹${crop.price}/kg

</p>



<span class="crop-status">

Available 🟢

</span>



<br>



<button 
class="delete-crop"
onclick="deleteCrop(${index})">


Delete


</button>



</div>


`;




cropList.appendChild(card);



});



}







/* ================= ADD CROP ================= */


cropForm.addEventListener(
"submit",
(e)=>{


e.preventDefault();





let crop = {


name:

document.getElementById(
"cropName"
).value,



type:

document.getElementById(
"cropType"
).value,



quantity:

document.getElementById(
"cropQuantity"
).value,



price:

document.getElementById(
"cropPrice"
).value,



image:

document.getElementById(
"cropImage"
)
?.value

};







crops.push(crop);



localStorage.setItem(

"crops",

JSON.stringify(crops)

);






alert(
"Crop Added Successfully 🌱"
);



cropForm.reset();



displayCrops();



});









/* ================= DELETE CROP ================= */


window.deleteCrop = function(index){



crops.splice(
index,
1
);



localStorage.setItem(

"crops",

JSON.stringify(crops)

);




displayCrops();



alert(
"Crop Removed"
);



};








displayCrops();





});