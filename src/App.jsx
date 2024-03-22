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
} from "firebase/auth";

export default function App() {
  const auth = getAuth();

  const [FormData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [users, setUsers] = useState([]);
  const [editUserData, setEditUserData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => getUserDataFromFirestore, []);

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
      <div className="form">
        <h1>Firebase</h1>
        <input
          type="email"
          placeholder="email"
          value={FormData.email}
          name="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          value={FormData.password}
          name="password"
          onChange={handleChange}
        />
        <br />
        <button onClick={handleSignIn}>SignIn</button>
        <button onClick={handleSignUp}>SignUp</button>
        <button onClick={addUserDataToFirestore}>Add Data</button>
      </div>
      <br />
      <br />
      <br />

      <h2>CRUD Firestore</h2>
      <table style={{ padding: "20px", background: "lightgray" }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Password</th>
            <th>Date</th>
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
                        type="email"
                        placeholder="edit email..."
                        onChange={(e) =>
                          setEditUserData({
                            ...editUserData,
                            email: e.target.value,
                          })
                        }
                      />
                      <button onClick={() => updateEmail(user.id)}>Save</button>
                    </>
                  )}
                </td>
                <td>
                  {user.password}
                  {user.showEdit && (
                    <>
                      <input
                        type="text"
                        placeholder="edit password..."
                        onChange={(e) =>
                          setEditUserData({
                            ...editUserData,
                            password: e.target.value,
                          })
                        }
                      />
                      <button onClick={() => updatePassword(user.id)}>
                        Save
                      </button>
                    </>
                  )}
                </td>
                <td>{user.addedOn}</td>
                <td>
                  <button onClick={() => toggleEditBtn(user.id)}>
                    {user.showEdit ? "Hide" : "Edit"}
                  </button>
                  <button onClick={() => deleteDocument(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}
