/* =====================================
   FARMNEST CATEGORY PAGE JS
===================================== */


document.addEventListener("DOMContentLoaded", function(){


    // Category Card Animation

    const categoryCards = document.querySelectorAll(".category-card");


    categoryCards.forEach((card,index)=>{


        card.style.opacity="0";


        card.style.transform="translateY(30px)";



        setTimeout(()=>{


            card.style.transition="0.6s";


            card.style.opacity="1";


            card.style.transform="translateY(0)";


        }, index * 150);



    });



    // Category Button Click


    const categoryButtons = document.querySelectorAll(".category-card a");


    categoryButtons.forEach(button=>{


        button.addEventListener("click",function(){


            localStorage.setItem(
                "selectedCategory",
                this.parentElement.querySelector("h3").innerText
            );


        });


    });



});