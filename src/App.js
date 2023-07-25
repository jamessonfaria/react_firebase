import { db, auth } from "./FirebaseConnection";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { useState, useEffect } from "react";

import "./app.css";

function App() {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [posts, setPosts] = useState([]);
  const [idPost, setIdPost] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [user, setUser] = useState(false);
  const [userDetail, setUserDetail] = useState({});

  useEffect(() => {
    async function loadPosts() {
      const unsub = onSnapshot(collection(db, "posts"), (snapshot) => {
        let listaPost = [];

        snapshot.forEach((doc) => {
          listaPost.push({
            id: doc.id,
            titulo: doc.data().titulo,
            autor: doc.data().autor,
          });
        });

        setPosts(listaPost);
      });
    }

    loadPosts();
  }, []);

  useEffect(() => {
    async function checkLogin() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(true);
          setUserDetail({ uid: user.uid, email: user.email });
        } else {
          setUser(false);
          setUserDetail({});
        }
      });
    }

    checkLogin();
  }, []);

  async function handleAdd() {
    // await setDoc(doc(db, "posts", "12345"), {
    //   titulo: titulo,
    //   autor: autor,
    // })
    //   .then((data) => {
    //     console.log("DADOS REGISTRADOS COM SUCESSO");
    //   })
    //   .catch((error) => {
    //     console.error("GEROU ERROR: " + error);
    //   });

    await addDoc(collection(db, "posts"), {
      titulo: titulo,
      autor: autor,
    })
      .then((data) => {
        console.log("DADOS REGISTRADOS COM SUCESSO");
        setAutor("");
        setTitulo("");
      })
      .catch((error) => {
        console.error("GEROU ERROR: " + error);
      });
  }

  async function buscarPost() {
    // const postRef = doc(db, "posts", "12345");
    // await getDoc(postRef)
    //   .then((snapshot) => {
    //     setAutor(snapshot.data().autor);
    //     setTitulo(snapshot.data().titulo);
    //   })
    //   .catch((error) => {
    //     console.log("ERROR: ", error);
    //   });

    const postRef = collection(db, "posts");
    await getDocs(postRef)
      .then((snapshot) => {
        let lista = [];

        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            titulo: doc.data().titulo,
            autor: doc.data().autor,
          });
        });

        setPosts(lista);
      })
      .catch((error) => console.error("ERRO: ", error));
  }

  async function editarPost() {
    const docRef = doc(db, "posts", idPost);
    await updateDoc(docRef, { titulo: titulo, autor: autor })
      .then(() => {
        setIdPost("");
        setAutor("");
        setTitulo("");
      })
      .catch((error) => {
        console.error("ERROR: ", error);
      });
  }

  async function excluirPost(id) {
    const docRef = doc(db, "posts", id);
    await deleteDoc(docRef)
      .then(() => {})
      .catch((error) => console.error("ERROR: ", error));
  }

  async function novoUsuario() {
    await createUserWithEmailAndPassword(auth, email, senha)
      .then((value) => {
        console.log("Cliente cadastrado com sucesso.");
        setEmail("");
        setSenha("");
      })
      .catch((error) => {
        if (error.code === "auth/weak-password") {
          alert("Senha muito fraca.");
        } else if (error.code === "auth/email-already-in-use") {
          alert("Email já existe");
        }
      });
  }

  async function logarUsuario() {
    await signInWithEmailAndPassword(auth, email, senha)
      .then((value) => {
        console.log("Logado com sucesso");
        console.log(value.user);
        setEmail("");
        setSenha("");

        setUserDetail({ uid: value.user.uid, email: value.user.email });
        setUser(true);
      })
      .catch((error) => console.log("Error: ", error));
  }

  async function fazerLogout() {
    await signOut(auth);
    setUser(false);
    setUserDetail({});
  }

  return (
    <div>
      <h1>ReactJS + Firebase</h1>

      {user && (
        <div>
          <strong>Bem vindo vc esta logado</strong>
          <br />
          <span>
            ID: {userDetail.uid} - Email: {userDetail.email}
            <button onClick={fazerLogout}>Sair da conta</button>
          </span>
        </div>
      )}

      <div className="container">
        <h2>Usuários</h2>
        <label>Email:</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite um email"
        />
        <br />
        <label>Senha:</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Digite um senha"
        />
        <br />

        <button onClick={novoUsuario}>Novo usuario</button>
        <button onClick={logarUsuario}>Logar usuario</button>
      </div>

      <br />
      <br />
      <hr />

      <div className="container">
        <h2>Posts</h2>
        <label>ID do Post:</label>
        <input value={idPost} onChange={(e) => setIdPost(e.target.value)} />
        <label>Titulo:</label>
        <textarea
          value={titulo}
          type="text"
          placeholder="Digite o titulo"
          onChange={(e) => setTitulo(e.target.value)}
        />

        <label>Autor:</label>
        <input
          value={autor}
          type="text"
          placeholder="Autor do post"
          onChange={(e) => setAutor(e.target.value)}
        />
        <button onClick={handleAdd}>Cadastrar</button>
        <button onClick={buscarPost}>Buscar Post</button>
        <button onClick={editarPost}>Atualizar Post</button>

        <ul>
          {posts.map((post) => {
            return (
              <li key={post.id}>
                <strong>ID: {post.id}</strong> <br />
                <span>Titulo: {post.titulo}</span> <br />
                <span>Autor: {post.autor}</span> <br />
                <button onClick={() => excluirPost(post.id)}>Excluir</button>
                <br />
                <br />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
