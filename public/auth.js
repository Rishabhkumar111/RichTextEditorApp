import { app ,addDoc,collection,db, getDocs} from "./firebase.js";
import { getAuth, createUserWithEmailAndPassword,
     onAuthStateChanged ,signInWithEmailAndPassword,
      signOut, sendPasswordResetEmail,
      GoogleAuthProvider,signInWithPopup } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

var userEmail;
const auth = getAuth(app);
if(document.getElementById("authButton")!=null)document.getElementById("authButton").addEventListener("click", login);



function signup(){
    var email = document.getElementById("Email").value;
    var password = document.getElementById("Password").value;

    // Validate input fields
    if (validate_email(email) == false ) {
        alert('Email is Outta Line!!')
        return
        // Don't continue running the code
    }
    if(!validate_field(email) || !validate_field(password)){
        alert('Please fill form properly');
        return
    }
    // console.log(email,"***",password);
    console.log("signup me aa gya");
    createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
        // Signed in 
        document.querySelector(".loadScreen").style.display = "block";
        const currentDate = new Date();
        const createdAtTimestamp = firebase.firestore.Timestamp.fromDate(currentDate);
        try {
                await addDoc(collection(db, "users"), {
                email: email,
                joiningTime:createdAtTimestamp.seconds,
                totalApprovals:0,
                isAdmin:false
            });
            window.location.href = 'test.html';
        } catch (e) {
            console.error("Error adding user: ", e);
            console.log(e);
        }
        const user = userCredential.user;
        // ...
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if(errorMessage=="Firebase: Error (auth/email-already-in-use)."){
            alert("email-already-in-use");
        }
    });
}

var navButton = document.getElementById("navButton");
if(navButton != null)navButton.addEventListener("click", toggleAuth);

function toggleAuth() {
    const authButton = document.getElementById("authButton");
    
    if (authButton.textContent == "Login") {
        document.querySelector(".forgotPassword").style.display = "none";
        document.querySelector(".box h1").textContent = "SignUp";
        navButton.textContent = "Sign In";
        authButton.textContent = "Submit";
        authButton.removeEventListener("click", login);
        authButton.addEventListener("click", signup);
    } else if (authButton.textContent == "Submit") {
        document.querySelector(".forgotPassword").style.display = "block";
        document.querySelector(".box h1").textContent = "SignIn";
        navButton.textContent = "Sign Up";
        authButton.textContent = "Login";
        authButton.removeEventListener("click", signup);
        authButton.addEventListener("click", login);
    }
}
if(document.querySelector(".forgotPassword")!=null)document.querySelector(".forgotPassword").addEventListener("click",function(){
    // Validate input fields
    var email = document.getElementById("Email").value;
    if (validate_email(email) == false ) {
        alert('Email is Outta Line!!')
        return ;
        // Don't continue running the code
    }
    if(!validate_field(email)){
        alert('Please fill form properly');
        return ;
    }

    gsap.to(".forgotPassword",{
        color:"#909090",
        duration:0.1
    })

    var email = document.getElementById("Email").value;
    sendPasswordResetEmail(auth, email)
  .then(async () => {
    var isNew = false;
    var usersCollection = collection(db, "users");
    await getDocs(usersCollection).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if(doc.data().email == email){
                isNew = true;
            }
        });
    });
    if(isNew){
        alert("Please check your email to reset password");
    }else{
        alert("You don't have account, Please SignUp first.");
    }
    // Password reset email sent!
    // ..
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
    // ..
  });
})

function login(){
    document.querySelector(".loadScreen").style.display = "block";
    var email = document.getElementById("Email").value;
    var password = document.getElementById("Password").value;

    // Validate input fields
    if (validate_email(email) == false ) {
        alert('Email is Outta Line!!')
        return
        // Don't continue running the code
    }
    if(!validate_field(email) || !validate_field(password)){
        alert('Please fill form properly');
        return
    }
    console.log("login me aaya hai");
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        userEmail = email;
        const user = userCredential.user;
        console.log("&&&&&",email);
        // document.querySelector(".loadScreen").style.display = "none";
        window.location.href = 'test.html';
        // ...
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if(errorMessage == "Firebase: Error (auth/invalid-login-credentials).")alert("invalid-login-credentials");
        document.querySelector(".loadScreen").style.display = "none";
    });
}


onAuthStateChanged(auth, (user) => {
    if (user) {
      var uid = user.uid;
    //   window.location.href = 'test.html';
      console.log(uid,"%%%%%");
    } else {
      console.log("signed out%%%")
    }
});


// var googleLogin = document.querySelector(".googleLogin");
// const provider = new GoogleAuthProvider();

// googleLogin.addEventListener("click",function(){
//     signInWithPopup(auth, provider)
//     .then(async (result)=>{

//         const usersCollection = collection(db,"users");
//         var isNew = false;
//         await getDocs(usersCollection).then((querySnapshot) => {
//             querySnapshot.forEach((doc) => {
//                 if(doc.data().email == result.user.email){
//                     isNew = true;
//                 }
//             });
//         })
//         .catch((error) => {
//             console.error("Error getting documents: ", error);
//         });
//         if(isNew){
//             window.location.href = "test.html";
//         }

//         console.log("sihnin hua");
//         const currentDate = new Date();
//         const createdAtTimestamp = firebase.firestore.Timestamp.fromDate(currentDate);
//         try {
//                 await addDoc(collection(db, "users"), {
//                 email: result.user.email,
//                 joiningTime:createdAtTimestamp.seconds,
//                 totalApprovals:0,
//                 isAdmin:false
//             });
//             window.location.href = 'test.html';
//         } catch (e) {
//             console.error("Error adding user: ", e);
//             alert(e);
//         }
//         // window.location.href = "test.html";
//     }).catch((error)=>{
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         console.log("sihnin hua>>>",errorMessage);
//     })
// })



function validate_email(email) {
    // Regular expression for a valid email address
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validate_field(field) {
    if (field == null) {
        return false
    }
    if (field.length <= 0) {
        return false
    } else {
        return true
    }
}



// Function to update the title text based on screen width
function updateTitleText() {
    const titleElement = document.querySelector('#nav .title');
    const screenWidth = window.innerWidth;
  
    if (screenWidth < 600) {
        titleElement.textContent = 'RTE Note App'; // Update text for small screens
    } else {
        titleElement.textContent = 'Rich Text Editor Note Web App'; // Restore text for larger screens
    }
  }
  
  // Call the function on page load and when the window is resized
  window.addEventListener('load', updateTitleText);
  window.addEventListener('resize', updateTitleText);
