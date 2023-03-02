import { createContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLogin } from "../features/booksReducer";
import { addPopBook, setUser } from "../features/booksReducer";

const DataContext = createContext({});
let user = {
  photo: "",
  name: "",
  username: "",
  password: "",
  confirmPassword: "",
};
export const DataProvider = ({ children }) => {
  // Create the needed states
  const [token, setToken] = useState("");
  const [signUp, setSignUp] = useState(user);
  const [input, setInput] = useState("");
  const [basketItems, setBasketItems] = useState([]);
  const [searchBook, setSearchBook] = useState("");
  const [booksList, setBooksList] = useState([]);

  // Use the redux state
  const userDetails = useSelector((state) => state.books.user);

  const dispatch = useDispatch();
  // This will navigate to different page
  const navigate = useNavigate();
  const fetchLogin = async (e) => {
    try {
      //  Create the option to fetch
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUp),
      };
      e.preventDefault();
      // Fetch the data from the server
      // If the response is not ok throw the error
      const response = await fetch("/users/login", options);
      if (!response.ok) throw Error("Did not receive the expected data");
      // Convert the data from json
      const data = await response.json();
      // If data has a message
      if (!data.message) {
        // Update the states
        setToken(data.token);
        // setLoggedIn((prev) => !prev);
        dispatch(setLogin(true));
        navigate("/user");
      } else {
        alert(data.message);
      }
      // Catch the error and set the fetchError to the error's message
    } catch (error) {
      alert(error);
    }
  };
  // Fetch signup hook
  const fetchSignUp = async (e) => {
    const { photo, name, username, password, confirmPassword } = signUp;
    let userData = new FormData();
    userData.set("photo", photo);
    userData.set("name", name);
    userData.set("username", username);
    userData.set("password", password);
    userData.set("confirmPassword", confirmPassword);
    console.log(userData);
    try {
      //  Create the option to fetch

      const options = {
        method: "POST",
        body: userData,
      };
      e.preventDefault();
      // Fetch the data from the server
      // If the response is not ok throw the error
      const response = await fetch("users/signUp", options);
      if (!response.ok) throw Error("Something went wrong");
      // Convert the data from json
      const data = await response.json();
      // If the message from data is not success
      if (data.message !== "Account successfully created") {
        alert(data.message);
        setSignUp(user);
      } else {
        alert(data.message);
        // Call the fetch login
        await fetchLogin(e);
      }
      // Catch the error and set the fetchError to the error's message
    } catch (error) {
      alert(error);
    }
  };

  // Use useEffect hook to render only when the state updates
  useEffect(() => {
    const fetchList = async () => {
      try {
        //  Create the option for fetch
        const options = {
          method: "GET",
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        };
        // Fetch the data from the server
        // If the response is not ok throw the error
        if (token) {
          const response = await fetch(`/users/${signUp.username}`, options);
          if (!response.ok) throw Error("Did not receive the expected data");
          // Convert the data from json
          const data = await response.json();
          if (data) {
            if (!data.message) dispatch(setUser(data));
          } else {
            alert(data.message);
          }
        }
        // Catch the error
      } catch (error) {
        console.log(error);
      }
    };
    fetchList();
  }, [token, signUp.username, dispatch]);

  const fetchBooks = async (e) => {
    const API_KEY = process.env.REACT_APP_API_KEY;
    try {
      e.preventDefault();
      // Fetch the data from the server
      // If the response is not ok throw the error
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchBook}&key=${API_KEY}&maxResults=40`
      );
      if (!response.ok) throw Error("Did not receive the expected data");
      // Convert the data from json
      const data = await response.json();
      if (data) setBooksList([data.items]);
      // Catch the error
    } catch (error) {
      console.log(error);
    }
  };
  // Add todo hook
  const addBook = async (e, book) => {
    const volumeInfo = book.volumeInfo;
    let thumbnail = volumeInfo.imageLinks.thumbnail;
    let price = book.saleInfo.retailPrice.amount;
    let subtitle = volumeInfo.subtitle;
    let saleability = book.saleInfo.saleability;
    const { title, authors, description, pageCount } = volumeInfo;
    const bookInfo = {
      _id: book.id,
      title,
      author: authors[0],
      description,
      pageCount,
      image: thumbnail,
      saleability,
      subtitle,
      price,
    };
    dispatch(addPopBook(bookInfo));
    try {
      //  Create the option for fetch
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookInfo),
      };
      e.preventDefault();
      // Fetch the data from the server
      // If the response is not ok throw the error
      const response = await fetch("/books/addBook", options);
      if (!response.ok) throw Error("Something went wrong");
      // Convert the data from json
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert(error);
    }
  };

  // Use useEffect hook to render only when the state updates
  useEffect(() => {
    const fetchPopBooks = async () => {
      try {
        //  Create the option for fetch
        const options = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        };
        // Fetch the data from the server
        // If the response is not ok throw the error
        const response = await fetch(`/books/getBooks`, options);
        if (!response.ok) throw Error("Did not receive the expected data");
        // Convert the data from json
        const data = await response.json();
        if (data) {
          if (!data.message) {
            data.forEach((element) => {
              dispatch(addPopBook(element));
            });
          }
        } else {
          alert(data.message);
        }

        // Catch the error
      } catch (error) {
        console.log(error);
      }
    };
    fetchPopBooks();
  }, [dispatch]);

  const addReview = async (e, book, comment) => {
    e.preventDefault();
    const volumeInfo = book.volumeInfo;
    let thumbnail = volumeInfo.imageLinks.thumbnail;
    let price = book.saleInfo.retailPrice.amount;
    let subtitle = volumeInfo.subtitle;
    let saleability = book.saleInfo.saleability;
    const { title, authors, description, pageCount } = volumeInfo;
    console.log(authors);
    const bookInfo = {
      _id: book.id,
      title,
      author: authors[0],
      description,
      pageCount,
      image: thumbnail,
      saleability,
      subtitle,
      price,
      name: userDetails.name,
      comment,
    };

    // dispatch(addPopBook(bookInfo));
    try {
      //  Create the option for fetch
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookInfo),
      };
      // Fetch the data from the server
      // If the response is not ok throw the error
      const response = await fetch("/books/addReview", options);
      if (!response.ok) throw Error("Something went wrong");
      // Convert the data from json
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      alert(error);
    }
  };

  const orderBook = async (book) => {
    try {
      const { id, title, author, image, quantity, price } = book;
      //  Create the option to fetch
      const options = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: signUp.username,
          id,
          title,
          author: author[0],
          image,
          quantity,
          price,
        }),
      };
      // Fetch the data from the server
      // If the response is not ok throw the error
      const response = await fetch("/users/order", options);
      if (!response.ok) throw Error("Something went wrong");
      // Convert the data from json
      const data = await response.json();
      if (data.message !== "Order successfully added!") {
        alert(data.message);
      } else {
        setBasketItems([]);
      }
    } catch (error) {
      alert(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      //  Create the option to fetch
      const options = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
        }),
      };
      // Fetch the data from the server
      // If the response is not ok throw the error
      const response = await fetch("/books/delete", options);
      if (!response.ok) throw Error("Something went wrong");
      // Convert the data from json
      const data = await response.json();
      if (data.message !== "Success") alert(data.message);
    } catch (error) {
      alert(error);
    }
  };

  const handleEdit = async (e, details, editPassword) => {
    const { password, confirmPassword, name, username, photo } = details;
    let userData = new FormData();
    userData.set("photo", photo);
    userData.set("name", name);
    userData.set("username", signUp.username);
    userData.set("newUsername", username);
    userData.set("password", password);
    userData.set("confirmPassword", confirmPassword);
    try {
      const options = {
        method: "PATCH",
        headers: {
          token: token,
        },
        body: userData,
      };
      e.preventDefault();
      // Fetch the data from the server
      // If the response is not ok throw the error
      const response = await fetch(
        `/users/${editPassword ? "changePassword" : "changeDetails"}`,
        options
      );
      if (!response.ok) throw Error("Something went wrong");
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert(error);
    }
  };
  return (
    <DataContext.Provider
      value={{
        addReview,
        basketItems,
        setBasketItems,
        input,
        setInput,
        addBook,
        handleDelete,
        handleEdit,
        signUp,
        setSignUp,
        fetchSignUp,
        fetchLogin,
        fetchBooks,
        searchBook,
        setSearchBook,
        booksList,
        setBooksList,
        orderBook,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
