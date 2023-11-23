import {collection, db, getDocs, app, query, where} from "./firebase.js"
import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";


var userEmail;
const auth = getAuth(app);


onAuthStateChanged(auth, (user) => {
    if (user) {
      var email = user.email;
      userEmail = email;
      console.log(userEmail,"****@@@");
      fun();
    } else {
      console.log("signed out%%%");
      window.location.href = 'auth.html';
    }
});

async function fun(){
    console.log(userEmail);
// Define a reference to the Firestore collection where user data is stored
const usersCollectionRef = collection(db, "users");

// Use a query to retrieve the user's data based on their email
const queryResult = query(usersCollectionRef, where("email", "==", userEmail));

var userData;

// Fetch the data
getDocs(queryResult).
    then((querySnapshot) => {
    if (!querySnapshot.empty) {
      // Data found for the user
      querySnapshot.forEach((doc) => {
        userData = doc.data();
        console.log("User Data:", userData);
        populateUserData(userData);
        // You can now use userData to display or work with the user's information
      });
    } else {
      // No data found for the user
      console.log("User data not found.");
    }
  })
  .catch((error) => {
    console.error("Error fetching user data:", error);
  });



    function populateUserData(userData) {
        // Select HTML elements by their IDs
        const emailElement = document.getElementById("email");
        const totalApprovedElement = document.getElementById("totalApproved");
        const joiningTimeElement = document.getElementById("joiningTime");

        // Update the content of the HTML elements with user data
        emailElement.textContent = userData.email;

        // console.log(userData.joiningTime);
        // console.log(userData.joiningTime.toDate());
        var readableDateTime = changeTimeFormate(userData.joiningTime);
        console.log(readableDateTime);

        totalApprovedElement.textContent = userData.totalApprovals;
        
        // Format the joiningTime if needed (e.g., convert to a more user-friendly format)
        // You can use JavaScript Date functions for formatting if required
        joiningTimeElement.textContent = readableDateTime;
    }
}

function changeTimeFormate(createdAtTimestamp){
    const createdAtDate = new Date(createdAtTimestamp * 1000); // Multiply by 1000 to convert to milliseconds
    return createdAtDate;
}

