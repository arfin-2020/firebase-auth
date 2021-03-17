import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebaseConfig';
import { useState } from 'react';


if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

function App() {
  const [newUser, setnewUser] = useState(false);
  const [users, setUsers] = useState({
    isSignedIn: false,
    name: '',
    newUser: false,
    email: '',
    password: '',
    photo: '',

  })
  const provider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();

  const handleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
      .then(res => {
        const { displayName, photoURL, email } = res.user;
        const signInUser = {
          isSignedIn: true,
          name: displayName,
          photo: photoURL,
          email: email
        }
        setUsers(signInUser)
        // console.log('Name:', displayName, photoURL, email);
      })
      .catch(error => {
        console.log(error.message)
      })
  }
  const handleFbsignIn = () => {
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // The signed-in user info.
        var user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;

        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        // ...
      });
  }
  const handleSignOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const signOutUser = {
          isSignedIn: false,
          name: '',
          photo: '',
          email: '',
          error: '',
          success: false
        }
        setUsers(signOutUser);
      })
      .catch(error => {
        console.log(error.massage);
      })
    // console.log("Signout working");
  }
  const handleSubmit = (event) => {
    if (newUser && users.email && users.password) {
      // console.log(users.email, users.password);
      firebase.auth().createUserWithEmailAndPassword(users.email, users.password)
        .then(res => {
          const newUserInfo = { ...users };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUsers(newUserInfo);
          updateUserName(users.name)
          // console.log(res);
        })

        .catch(error => {
          const newUserInfo = { ...users };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUsers(newUserInfo);
          // console.log(errorMessage, errorCode);
        });
    }
    if (!newUser && users.email & users.password) {
      firebase.auth().signInWithEmailAndPassword(users.email, users.password)
        .then(res => {
          // Signed in
          const newUserInfo = { ...users };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUsers(newUserInfo);
          console.log('sign in info', res.user);
          // ...
        })
        .catch(error => {
          const newUserInfo = { ...users };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUsers(newUserInfo);
          // console.log(errorMessage, errorCode);
        });
    }
    event.preventDefault();
  }
  const updateUserName = name => {
    const user = firebase.auth().currentUser;
    user.updateProfile({
      displayName: name
    }).then(function () {
      console.log("user name updated successful.");
    }).catch(function (error) {
      console.log(error);
    });
  }
  const handleChange = (event) => {
    // console.log(event.target.value);
    // console.log(event.target.name);
    let IsFieldValid = true;
    if (event.target.name === 'email') {
      IsFieldValid = /^\S+@\S+\.\S+$/.test(event.target.value);
      // console.log(IsEmailValid);
    }
    if (event.target.name === 'password') {
      const IsPasswordValid = event.target.value.length > 6;
      const IsPasswordHasNumber = /\d{1}/.test(event.target.value);
      // console.log(IsPasswordValid && IsPasswordHasNumber);
      IsFieldValid = IsPasswordValid && IsPasswordHasNumber;
    }
    if (IsFieldValid) {
      const newUserInfo = { ...users };
      newUserInfo[event.target.name] = event.target.value;
      setUsers(newUserInfo);
    }
  }
  return (
    <div className="App">
      {
        users.isSignedIn ? <button onClick={handleSignOut} style={{
          height: '30px', width: '150px', border: 'none',
          backgroundColor: 'orange', color: 'white'
        }}>sign out</button> : <button onClick={handleSignIn} style={{
          height: '30px', width: '150px', border: 'none',
          backgroundColor: 'orange', color: 'white'
        }}>sign in</button>
      }<br />
      <button onClick={handleFbsignIn}>Sign in using Facebook</button>

      {
        users.isSignedIn && <div>
          <h1>Welcome {users.name}</h1>
          <p>Your Email: {users.email}</p>
          <p>Photo: <img src={users.photo} alt='' height="550px" width="500px" /> </p>
        </div>
      }
      <h1>Our own Authentication Field</h1>
      {/* <p>Name: {users.name}</p>
      <p>Email: {users.email}</p>
      <p>Password: {users.password}</p> */}
      <input type="checkbox" onChange={() => setnewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">Sign up</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input type="text" onBlur={handleChange} name='name' placeholder="Your Name" />}
        <br />
        <input type="text" onBlur={handleChange} name="email" placeholder="Enter email address" height="30px" width="200px" required /><br />
        <input type="password" onBlur={handleChange} name="password" placeholder="Enter password" height="30px" width="200px" required /><br />
        <input type="submit" value={newUser ? 'Sign up' : 'sign in'} />
      </form>
      <p style={{ color: "red" }}>{users.error}</p>
      {users.success && <p style={{ color: "green" }}> User {newUser ? "Created" : "logged in"} Successfully</p>}
    </div>
  );
}

export default App;
