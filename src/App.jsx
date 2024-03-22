import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarHeader from "./components/NavbarHeader";

export default function App() {
  const auth = getAuth();

  const [FormData, setFormData] = useState({
    email: "",
    password: "",
    currentUser: "",
  });
  const [users, setUsers] = useState([]);
  const [editUserData, setEditUserData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => getUserDataFromFirestore, []);
  useEffect(() => checkLoginStatus, []);

  async function checkLoginStatus() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData((prevFormData) => {
          return {
            ...prevFormData,
            currentUser: user.email,
          };
        });
      } else {
        console.log("User is signed out");
      }
    });
  }

  async function signOutFirbase() {
    signOut(auth)
      .then(() => {
        alert("Signed out!");
        setFormData((prevFormData) => {
          return { ...prevFormData, currentUser: "" };
        });
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  async function getUserDataFromFirestore() {
    try {
      const response = await getDocs(collection(db, "users"));
      setUsers(
        response.docs.map((doc) => {
          return { ...doc.data(), id: doc.id, showEdit: false };
        })
      );
    } catch (error) {
      alert(error.message);
    }
  }

  async function deleteDocument(id) {
    await deleteDoc(doc(db, "users", id));
    getUserDataFromFirestore();
    alert("Entry removed!");
  }

  async function updateEmail(docId) {
    const docRef = doc(db, "users", docId);
    await updateDoc(docRef, {
      email: editUserData.email,
      addedOn: Date.now(),
    });
    getUserDataFromFirestore();
    alert("Email updated!");
  }

  async function updatePassword(docId) {
    const docRef = doc(db, "users", docId);
    await updateDoc(docRef, {
      password: editUserData.password,
      addedOn: Date.now(),
    });
    getUserDataFromFirestore();
    alert("Password updated!");
  }

  async function addUserDataToFirestore() {
    try {
      const docRef = await addDoc(collection(db, "users"), {
        email: FormData.email,
        password: FormData.password,
        addedOn: Date.now(),
      });
      getUserDataFromFirestore();
      console.log("data added!", docRef.id);
    } catch (err) {
      alert(err.message);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        [name]: value,
      };
    });
  }

  function handleSignIn() {
    signInWithEmailAndPassword(auth, FormData.email, FormData.password)
      .then((userCredential) => {
        console.log("user is signed in", userCredential.user.email);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorCode, errorMessage);
      });
  }

  function handleSignUp() {
    createUserWithEmailAndPassword(auth, FormData.email, FormData.password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorCode, errorMessage);
      });
  }

  function toggleEditBtn(id) {
    setUsers((prevUsers) => {
      return prevUsers.map((user) => {
        if (user.id == id) {
          return { ...user, showEdit: !user.showEdit };
        }
        return user;
      });
    });
  }
  return (
    <>
      <NavbarHeader />
      <div style={{ margin: "20px" }}>
        <div className="form">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "2em",
            }}
          >
            <h2>
              {FormData.currentUser
                ? "hello " + FormData.currentUser.split("@")[0]
                : "Signed out"}
            </h2>
            {FormData.currentUser && (
              <button
                className="btn btn-danger btn-sm"
                onClick={signOutFirbase}
              >
                sign out
              </button>
            )}
          </div>
          <input
            className="form-control"
            type="email"
            placeholder="email"
            value={FormData.email}
            name="email"
            onChange={handleChange}
          />
          <input
            className="form-control"
            type="password"
            placeholder="password"
            value={FormData.password}
            name="password"
            onChange={handleChange}
          />
          <br />
          <div className="btn-group">
            <button className="btn btn-success" onClick={handleSignIn}>
              SignIn
            </button>
            <button className="btn btn-primary" onClick={handleSignUp}>
              SignUp
            </button>
            <button
              className="btn btn-secondary"
              onClick={addUserDataToFirestore}
            >
              Add Data
            </button>
          </div>
        </div>
        <h2 className="mt-5">CRUD Firestore</h2>
        <table
          className="table table-striped table-hover"
          style={{ padding: "20px", background: "lightgray" }}
        >
          <thead>
            <tr>
              <th>Email</th>
              <th>Password</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users
              .toSorted((a, b) => b.addedOn - a.addedOn)
              .map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.email}{" "}
                    {user.showEdit && (
                      <>
                        <input
                          className="form-control"
                          type="email"
                          placeholder="edit email..."
                          onChange={(e) =>
                            setEditUserData({
                              ...editUserData,
                              email: e.target.value,
                            })
                          }
                        />
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateEmail(user.id)}
                        >
                          Save
                        </button>
                      </>
                    )}
                  </td>
                  <td>
                    {user.password}
                    {user.showEdit && (
                      <>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="edit password..."
                          onChange={(e) =>
                            setEditUserData({
                              ...editUserData,
                              password: e.target.value,
                            })
                          }
                        />
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updatePassword(user.id)}
                        >
                          Save
                        </button>
                      </>
                    )}
                  </td>
                  <td>{user.addedOn}</td>
                  <td>
                    <div className="btn-group">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => toggleEditBtn(user.id)}
                      >
                        {user.showEdit ? "Hide" : "Edit"}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteDocument(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
