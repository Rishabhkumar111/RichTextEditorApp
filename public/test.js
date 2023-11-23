import {collection, addDoc, db, getDocs,
     doc, getDoc, deleteDoc, app,
     query, orderBy, limit, startAfter, updateDoc, where} from "./firebase.js"
import {getAuth, signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

let lastDoc = null;
var userEmail, signedInUserUID, signedInUserData, isAdmin;
const auth = getAuth(app);


onAuthStateChanged(auth, (user) => {
    if (user) {
      var email = user.email;
      console.log(email,"top");
      document.querySelector(".loadScreen").style.display = "block";
      funIsAdmin();
      creatingDropdownOption();
    } else {
      console.log("signed out%%%");
      window.location.href = 'auth.html';
    }
});
async function funIsAdmin(){
    const user = await getAuth().currentUser;
    signedInUserUID = user.uid;
    const userCollectionRef = collection(db, "users");
    const userQueryResult = query(userCollectionRef, where("email", "==", user.email));
    try {
        const querySnapshot = await getDocs(userQueryResult);
        if (!querySnapshot.empty) {
          // If there are matching documents, there should be only one
          const userDoc = querySnapshot.docs[0];
            signedInUserData = userDoc.data();
            userEmail = userDoc.data().email;
            isAdmin = userDoc.data().isAdmin;
            showNotes();
        } else {
          console.log("No user found with the email:", userEmail);
        }
      } catch (error) {
        console.error("Error querying Firestore:", error);
      }
      if(isAdmin == false){
        document.querySelector(".slidingMenu .filter").style.display = "none";
      }
}

async function loadRtf(index) {
    // index = index.slice(5);
    const docRef = doc(db, "notes", index);
    const savedRtf = await getDoc(docRef);

    var html = "";
    html+=`
        <div id="pop-up-box">
            <div class="top-part">
                <h2></h2>
                <i id="close" class="ri-close-circle-line"></i>
            </div>
            <div class="box">
                <p></p>
            </div>
            <div class="buttonPair">
                <button id="update">Update</button>
                <button id="allow">Allow</button>
            </div>
        </div>
    `;
        
    var htmlEle = document.getElementById("pop-up-container");
    htmlEle.innerHTML = html;
    if(isAdmin == false){
        var allow = document.getElementById("allow");
        allow.style.display = "none";
    }
    var contentContainer = htmlEle.querySelector("#pop-up-box .box p");
    
    contentContainer.innerHTML = savedRtf.data().rtfContent;
    htmlEle.querySelector("#pop-up-box .top-part h2").textContent = savedRtf.data().subjectName;

    var updateButton = document.getElementById("update");
    updateButton.addEventListener("click", function(){
        update(index);
    });
    var allowButton = document.getElementById("allow");
    allowButton.addEventListener("click",function(){
        questionVerified(index);
    })
    var closeButton = document.getElementById('close');
    // Add a click event listener to the close button
    closeButton.addEventListener('click', closeFun);

    alert('RTF content loaded successfully.');

}

async function questionVerified(index){
    const docRef = doc(db, "notes", index);
    const savedRtf = await getDoc(docRef);
    console.log(savedRtf.data().email,"aaya hai verify me");
    if(savedRtf.data().isApproved){
        alert("it is already appoved");
    }else{
        await updateDoc(docRef,{
            "isApproved" : true
        });
        const userCollectionRef = collection(db, "users");
        const userQueryResult = query(userCollectionRef, where("email", "==", savedRtf.data().email));
        const querySnapshot = await getDocs(userQueryResult);
        console.log("&^%$#",querySnapshot.docs[0].id);
        const userDocRef = doc(db, "users", querySnapshot.docs[0].id);
        const data = await getDoc(userDocRef);
        await updateDoc(userDocRef,{
            "totalApprovals" : data.data().totalApprovals + 1
        });
    }
}

async function update(index){
    closeFun();
    document.querySelector(".loadScreen").style.display = "block";
    console.log("clicked allow");
    var html="";
    html+=`
        <div id="updating-container-box">
            <div class="top-part-update">
                <h2>Update Notes</h2>
                <i id="update-cancle" class="ri-close-circle-line"></i>
            </div>
            <div class="box">
                <textarea id="update-subject-name" placeholder="Enter subject name"></textarea>
                <textarea id="update-froala-editor"></textarea>
            </div>
            <div class="buttons">
                <button id="saveUpdated">Update</button>
            </div>
        </div>
    `;
    var htmlEle = document.getElementById("updating-container");
    htmlEle.innerHTML = html;
    console.log(htmlEle);
    var updateCancle = document.getElementById("update-cancle");
    updateCancle.addEventListener("click", updateClose);
    const editor = new FroalaEditor('#update-froala-editor');
    await new Promise(resolve => setTimeout(resolve, 100));
    // console.log(document.querySelector("#fr-logo span"));
    document.querySelector("#updating-container-box .box .fr-box.fr-basic.fr-top .fr-second-toolbar #fr-logo span").textContent = "Developed by Rishabh";
    const docRef = doc(db, "notes", index);
    const savedRtf = await getDoc(docRef);
    editor.html.set(savedRtf.data().rtfContent);
    document.getElementById("update-subject-name").value = savedRtf.data().subjectName;
    var saveUpdated = document.getElementById("saveUpdated");
    saveUpdated.addEventListener("click", function(){
        saveUpdateds(index, editor.html.get(), document.getElementById('update-subject-name').value);
    });
    document.querySelector(".loadScreen").style.display = "none";
}

async function saveUpdateds(index,rtfContent,subjectName){
    const docRef = doc(db, "notes", index);
    await updateDoc(docRef, {
        "rtfContent": rtfContent,
        "subjectName": subjectName
    });
    updateClose();
    showNotes();
}

function updateClose(){
    var htmlEle = document.getElementById("updating-container");
    htmlEle.innerHTML = "";
}

function closeFun(){
    var closeButton = document.querySelector("#close");
    gsap.to("#pop-up-box",{
        display: "none"
    })
    closeButton.style.color = "white";
    setTimeout(function(){
        closeButton.style.color = "Black";
    },200)
}


async function showNotes(){
    const collectionRef = collection(db, "notes");
    var queryResult;
    var numberOfNotes = 17;
    if(window.innerWidth<600)numberOfNotes = 12;
    if(isAdmin){
        queryResult = query(collectionRef,
        orderBy("time", "desc"),
        limit(numberOfNotes));
    }else{
        queryResult = query(collectionRef,
            orderBy("time", "desc"),
            limit(numberOfNotes), where("email", "==", userEmail));
    }

    const querySnapshot = await getDocs(queryResult);
    lastDoc = querySnapshot.docs[querySnapshot.docs.length-1];

    var html="";
    var htmlEle = document.getElementById("gridContainer");
    const cardIdsToChangeColor = [];

    querySnapshot.forEach(function(element){
        var plainText = htmlToText(element.data().rtfContent);
        var pattern = "Powered by Froala Editor";
        var x = plainText.split(pattern).join('');
        // alert(x);
        plainText = x;
        html+= `
            <div class="card" id="card-${element.id}">
                <h5>${element.data().subjectName}</h5>
                <hr style="margin-top: 0.2vw; margin-bottom: 0.8vw;">
                <p class="para" id="para-${element.id}" >${plainText}</p>
                <button class="deleteButtons" id="${element.id}" >Delete</button>
            </div>
        `;
        if(element.data().isApproved){
            cardIdsToChangeColor.push("card-" + element.id);
        }
    });

    if(html != ""){
        htmlEle.innerHTML=html;
        htmlEle.style.opacity="1";
        cardIdsToChangeColor.forEach(cardId => {
            const cardElement = document.getElementById(cardId);
            if (cardElement) {
              cardElement.style.border = "3px solid green"; 
            }
          });
    }else{
        htmlEle.innerHTML="No data present!!";
        htmlEle.style.fontSize="3vw";
        htmlEle.style.opacity="0.5";
    }

    var paraElements = document.querySelectorAll('.para');
    var deleteButtons = document.querySelectorAll('.deleteButtons');
    
    // Add a click event listener to each "para" element
    paraElements.forEach(function (element) {
        element.addEventListener('click', function () {
            var Temp_id = element.id;
            Temp_id = Temp_id.slice(5);
            // Call the loadRtf function with the corresponding element.id
            loadRtf(Temp_id);
        });
    });
    deleteButtons.forEach(function (element) {
        element.addEventListener('click', function () {
            deleteNote(element.id);
        });
    });
    document.querySelector(".loadScreen").style.display = "none";
}

async function loadMore(){
    document.querySelector(".loadScreen").style.display = "block";
    const collectionRef = collection(db, "notes");
    var cardIdsToChangeColor =[];
    var queryResult;

    if(isAdmin){
        queryResult = query(collectionRef,
                orderBy("time", "desc"),
                startAfter(lastDoc),
                limit(10));
    }else{
        queryResult = query(collectionRef,
            orderBy("time", "desc"),
            startAfter(lastDoc),
            where("email", "==", userEmail),
            limit(5));
    }

    const querySnapshot = await getDocs(queryResult);

    if(querySnapshot.docs.length == 0){
        window.removeEventListener("scroll", handleScroll);
        document.querySelector(".loadScreen").style.display = "none";
        return;
    }
    lastDoc = querySnapshot.docs[querySnapshot.docs.length-1];

    var html="";
    var htmlEle = document.getElementById("gridContainer");

    querySnapshot.forEach(function(element){
        const plainText = htmlToText(element.data().rtfContent);
        html+= `
            <div class="card" id="card-${element.id}">
                <h5>${element.data().subjectName}</h5>
                <hr style="margin-top: 0.2vw; margin-bottom: 0.8vw;">
                <p class="para" id="para-${element.id}" >${plainText}</p>
                <button class="deleteButtons" id="${element.id}" >Delete</button>
            </div>
        `;
        if(element.data().isApproved){
            cardIdsToChangeColor.push("card-" + element.id);
        }
    });
    // console.log(html);
    if(html != ""){
        htmlEle.innerHTML += html;
        htmlEle.style.opacity="1";
        cardIdsToChangeColor.forEach(cardId => {
            const cardElement = document.getElementById(cardId);
            if (cardElement) {
              cardElement.style.border = "3px solid green"; 
            }
          });
    }else{
        htmlEle.innerHTML="No data present!!";
        htmlEle.style.fontSize="3vw";
        htmlEle.style.opacity="0.5";
    }

    var paraElements = document.querySelectorAll('.para');
    var deleteButtons = document.querySelectorAll('.deleteButtons');
    
    // Add a click event listener to each "para" element
    paraElements.forEach(function (element) {
        element.addEventListener('click', function () {
            var Temp_id = element.id;
            Temp_id = Temp_id.slice(5);
            // Call the loadRtf function with the corresponding element.id
            loadRtf(Temp_id);
        });
    });
    deleteButtons.forEach(function (element) {
        element.addEventListener('click', function () {
            deleteNote(element.id);
        });
    });
    document.querySelector(".loadScreen").style.display = "none";
}
window.addEventListener("scroll", handleScroll);
function handleScroll() {
    console.log("scroll2222");
    // Calculate the current scroll position
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    // Calculate the height of the page content
    const pageHeight = document.documentElement.scrollHeight;
    
    // Calculate the height of the viewport
    const windowHeight = window.innerHeight;
    
    // Check if the user has scrolled to the bottom of the page
    if (scrollTop + windowHeight >= pageHeight) {
        loadMore();
    }
}

function htmlToText(html) {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = html;
    return tempElement.textContent || tempElement.innerText || "";
}

async function deleteNote(index){
    const noteElement = document.getElementById("card-"+index);
    noteElement.style.border = "3px red solid";
    // await new Promise(resolve => setTimeout(resolve, 100));
    var docRef = doc(db, "notes", index);
    var getDocRef = await getDoc(docRef);

    const confirmation = confirm("Are you sure want to delete this note");
    document.querySelector(".loadScreen").style.display = "block";
    if(getDocRef.data().isApproved == false)noteElement.style.border = "";
    else noteElement.style.border = "3px green solid";

    if(confirmation == false)return;
    
    
    if(isAdmin || userEmail == getDocRef.data().email){
        await deleteDoc(docRef);
        showNotes();
    }else{
        alert("you don't have authority to delete this doc.")
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Froala Editor on the textarea
    var Addbutton = document.querySelector(".add");
    

    // Attach click event listeners to the buttons
    
    Addbutton.addEventListener("click",async function(){
        Addbutton.style.transform = "scale(0.8)"
        gsap.to(".add",{
            color:"orange",
            fontSize:"1vw",
            duration:0.5,
            display:"none"
        })
        var html="";
        html+=`
        <div class="textArea">
            <div class="top-part">
                <h2>Add Notes</h2>
                <i id="cancle" class="ri-close-circle-line"></i>
            </div>
            <div class="box">
            <textarea id="subject-name" placeholder="Enter subject name"></textarea>
            <textarea id="froala-editor"></textarea>
            </div>
            <div class="buttons">
                <button id="save">Save</button>
            </div>
        </div>
        `;
        document.querySelector(".dynamicTextArea").innerHTML=html;
        const editor = new FroalaEditor('#froala-editor');
        document.getElementById('save').addEventListener('click', saveRtf);
        // await new Promise(resolve => setTimeout(resolve, 1000));
        
        // var linkElement = document.querySelector('a[href="https://www.froala.com/wysiwyg-editor?k=u"]');
        // if (linkElement) {
        //     var parentElement = linkElement.parentElement;
        //     parentElement.style.display = "none"; // Hide the parent <div>
        // }


        var cancleButton = document.querySelector("#cancle");

        cancleButton.addEventListener("click",function(){
            Addbutton.style.transform = "scale(1)";
            cancleButton.style.color = "white";
            if(window.innerWidth<600){
                gsap.to(".add",{
                    color:"white",
                    fontSize:"9vw",
                    duration:0.8,
                    display:"flex"
                })
            }else{
                gsap.to(".add",{
                    color:"white",
                    fontSize:"3vw",
                    duration:0.8,
                    display:"flex"
                })
            }
            gsap.to(".textArea",{
                display: "none"
            })
            setTimeout(function(){
                cancleButton.style.color = "Black";
            },200)
            // // var userInput =
            // document.querySelector('div.fr-element p').innerHTML = '';
            // document.getElementById('subject-name').value = "";
            // userInput.textContent="";
        });
        await new Promise(resolve => setTimeout(resolve, 100));
        document.querySelector(".textArea .box .fr-box.fr-basic.fr-top .fr-second-toolbar #fr-logo span").textContent = "Developed by Rishabh";
        async function saveRtf() {
            document.querySelector(".loadScreen").style.display = "block";
            const currentDate = new Date();
            // Convert the date to a Firestore-compatible timestamp
            const createdAtTimestamp = firebase.firestore.Timestamp.fromDate(currentDate);
    console.log(createdAtTimestamp);
            Addbutton.style.transform = "scale(1)"
            if(window.innerWidth<600){
                gsap.to(".add",{
                    color:"white",
                    fontSize:"9vw",
                    duration:0.8,
                    display:"flex"
                })
            }else{
                gsap.to(".add",{
                    color:"white",
                    fontSize:"3vw",
                    duration:0.8,
                    display:"flex"
                })
            }
            gsap.to(".textArea",{
                display: "none"
            })
            const rtfContent = editor.html.get();
            const subjectName = document.getElementById('subject-name').value;
            console.log(userEmail);
            var resultString = clearDefaultText(rtfContent);
            // alert(resultString);
            try {
                const docRef = await addDoc(collection(db, "notes"), {
                    rtfContent: rtfContent,
                    subjectName: subjectName,
                    email: userEmail,
                    time:createdAtTimestamp.seconds,
                    isApproved:false
                });
              } catch (e) {
                console.error("Error adding document: ", e);
              }
            document.querySelector('div.fr-element p').innerHTML = "";
            document.getElementById('subject-name').value = "";
            showNotes();
        }

    });

    
});

function clearDefaultText(inputString){
    // alert(inputString);
    let pattern = '<p data-f-id="pbf" style="text-align: center; font-size: 14px; margin-top: 30px; opacity: 0.65; font-family: sans-serif;">Powered by <a href="https://www.froala.com/wysiwyg-editor?pb=1" title="Froala Editor">Froala Editor</a></p>';
    //<p>Dthiijb Powered by Froala Editor</p>
    const resultString = inputString.split(pattern).join('');
    return resultString;
    // return data;
}
var menu = document.querySelector(".menu");
menu.addEventListener("click", function(){
    gsap.to(".menu",{
        transform:"rotate(-90Deg)",
        duration:0.3
    })
    gsap.to(".slidingMenu",{
        right:"0vw",
        duration:0.8,
        delay:0.3
    })
    document.querySelector(".slidingMenu").style.display = "flex";
});

var backArrow = document.querySelector(".backbutton");
backArrow.addEventListener("click", async function(){
    gsap.to(".menu",{
        transform:"rotate(0Deg)",
        duration:2
    })
    gsap.to(".backbutton",{
        left:"30vw",
        duration:0.5,
        ease:Expo
    })
    gsap.to(".slidingMenu",{
        right:"-30vw",
        duration:0.8,
        delay:0.1,
    })
    gsap.to(".backbutton",{
        left:"-12vw",
        duration:1,
        delay:2
    })
    await new Promise(resolve => setTimeout(resolve, 1010));
    document.querySelector(".slidingMenu").style.display = "none";
});
    

var account = document.querySelector(".account");
account.addEventListener("click",function(){
    gsap.to(".account",{
        transform : "scale(2)",
        duration:0.4
    })
    gsap.to(".account",{
        transform : "scale(1)",
        duration:0.1
    })

        window.location.href = 'acc.html';
    
})

var signOutButton = document.querySelector(".signOutButton");
signOutButton.addEventListener("click", function(){
    signOut(auth).then(() => {
        console.log("signed out******")

        window.location.href = 'auth.html';
        // Sign-out successful.
      }).catch((error) => {
        // An error happened.
    });
})


const emailSelect = document.getElementById('emailSelect');
function creatingDropdownOption (){
    const usersCollectionRef = collection(db, "users");
    getDocs(usersCollectionRef).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const userEmail = doc.data().email;
            const option = document.createElement('option');
            option.value = userEmail;
            option.textContent = userEmail;
            emailSelect.appendChild(option);
        });
    });
}

const filterButton = document.getElementById('filterButton');

filterButton.addEventListener('click', async () => {

    const notesCollectionRef = collection(db, 'notes');
    const filteredNotes = document.getElementById('gridContainer');
    const daysInput = document.getElementById('daysInput');

    const selectedEmail = emailSelect.value;
    const numberOfDays = parseInt(daysInput.value);

    if(numberOfDays<0 || selectedEmail == "Click here to select Email"){
        alert("wrong values in filter");
        return ;
    }

    // Calculate the date 'numberOfDays' days ago from today
    const currentDate = new Date();

    currentDate.setDate(currentDate.getDate() - numberOfDays);
    // Query notes based on email and timeOfCreation
    var queryResult = query(notesCollectionRef,
                            where('email', '==', selectedEmail),
                            where('time', '>=', firebase.firestore.Timestamp.fromDate(currentDate).seconds));
    
        
        var html="";
        const cardIdsToChangeColor = [];
        
        await getDocs(queryResult).then((querySnapshot) => {
            filteredNotes.innerHTML = ''; // Clear previous results
            querySnapshot.forEach((element) => {
                var plainText = htmlToText(element.data().rtfContent);
                var pattern = "Powered by Froala Editor";
                plainText = plainText.split(pattern).join('');
                html+= `
                    <div class="card" id="card-${element.id}">
                        <h5>${element.data().subjectName}</h5>
                        <hr style="margin-top: 0.2vw; margin-bottom: 0.8vw;">
                        <p class="para" id="para-${element.id}" >${plainText}</p>
                        <button class="deleteButtons" id="${element.id}" >Delete</button>
                    </div>
                `;
                if(element.data().isApproved){
                    cardIdsToChangeColor.push("card-" + element.id);
                }
            });
            if(html != ""){
                filteredNotes.innerHTML=html;
                filteredNotes.style.opacity="1";
                cardIdsToChangeColor.forEach(cardId => {
                    const cardElement = document.getElementById(cardId);
                    if (cardElement) {
                      cardElement.style.border = "3px solid green"; 
                    }
                });
            }else{
                filteredNotes.innerHTML="No data present!!";
                filteredNotes.style.fontSize="3vw";
                filteredNotes.style.opacity="0.5";
            }
            var paraElements = document.querySelectorAll('.para');
            var deleteButtons = document.querySelectorAll('.deleteButtons');
            
            // Add a click event listener to each "para" element
            paraElements.forEach(function (element) {
                element.addEventListener('click', function () {
                    var Temp_id = element.id;
                    Temp_id = Temp_id.slice(5);
                    // Call the loadRtf function with the corresponding element.id
                    loadRtf(Temp_id);
                });
            });
            deleteButtons.forEach(function (element) {
                element.addEventListener('click', function () {
                    deleteNote(element.id);
                });
            });
        })
        .catch((error) => {
            console.error('Error applying filter:', error);
        });
});


var filter = document.querySelector(".filter");
filter.addEventListener("click", function(){
    var filterBox = document.querySelector(".filterBox");
    if(filter.textContent == "Filter"){
        filter.textContent = "Rest Filter";
        filter.style.backgroundColor = "rgb(255, 233, 192)";
        filter.style.color = "orange";
        filterBox.style.display = "flex";
    }else{
        filter.textContent = "Filter";
        filter.style.backgroundColor = "orange";
        filter.style.color = "white";
        filterBox.style.display = "none";
        showNotes();
        const emailSelect = document.getElementById('emailSelect');
        const daysInput = document.getElementById('daysInput');
        emailSelect.value = "Click here to select Email";
        daysInput.value = parseInt("0");
    }
})


// Function to update the title text based on screen width
function updateTitleText() {
    const titleElement = document.querySelector('#nav .title');
    const screenWidth = window.innerWidth;
  
    if (screenWidth < 600) {
        titleElement.textContent = 'RTE Note App'; // Update text for small screens

        var menu = document.querySelector(".menu");
        menu.addEventListener("click", function(){
            gsap.to(".menu",{
                transform:"rotate(-90Deg)",
                duration:0.3
            })
            gsap.to(".slidingMenu",{
                right:"0vw",
                duration:0.8,
                delay:0.3
            })
            document.querySelector(".slidingMenu").style.display = "flex";
        });


        var backArrow = document.querySelector(".backbutton");
        backArrow.addEventListener("click", async function(){
            gsap.to(".menu",{
                transform:"rotate(0Deg)",
                duration:2
            })
            gsap.to(".backbutton",{
                left:"50vw",
                duration:0.6,
                ease:Expo
            })
            gsap.to(".slidingMenu",{
                right:"-50vw",
                duration:0.8,
                delay:0.1,
            })
            gsap.to(".backbutton",{
                left:"-17vw",
                duration:1,
                delay:2
            })
            await new Promise(resolve => setTimeout(resolve, 1010));
            document.querySelector(".slidingMenu").style.display = "none";
        });

        var account = document.querySelector(".account");
        account.addEventListener("click",function(){
            gsap.to(".account",{
                transform : "scale(1.3)",
                duration:0.5
            })
            gsap.to(".account",{
                transform : "scale(1)",
                duration:0.3
            })

                window.location.href = 'acc.html';
            
        })

    } else {
        titleElement.textContent = 'Rich Text Editor Note Web App'; // Restore text for larger screens
    }

}

  // Call the function on page load and when the window is resized
  window.addEventListener('load', updateTitleText);
  window.addEventListener('resize', updateTitleText);