import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GlobalStyle } from "./globalStyles";
import Navbar from "./components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./index";
import Loading from "./components/Loading";
import { NavBlack } from "./utils/colors";
import SetAuthToken from "./utils/SetAuthToken";
import { getUserByToken } from "./redux/slices/auth";
import PrivateRoute from "./utils/PrivateRoute";
import AddPost from "./pages/AddPost";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BlogPost from "./pages/BlogPost";
import Profile from "./pages/Profile";
import Blog from "./pages/Blog";
// import GetPostsByTag from "./pages/GetPostsByTag";
const App = () => {
    const auth = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    //Every time the user state changes (logges in or out) the token will be added or deleted
    useEffect(() => {
        SetAuthToken();
    }, [auth]);
    useEffect(() => {
        dispatch(getUserByToken());
    }, []);
    return (
        <Router>
            <GlobalStyle />

            {auth.status === "success" && <Navbar background={NavBlack} image={auth.result?.imageURL} />}
            {auth.status !== "success" && <Navbar background={NavBlack} />}
            <React.Suspense fallback={<Loading />}>
                <Routes>
                    <Route path="/" element={<Blog />} />
                    <Route
                        path="/blog/add"
                        element={
                            <PrivateRoute>
                                <AddPost />
                            </PrivateRoute>
                        }
                    />

                    <Route path="/blog/post/:slug" element={<BlogPost />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />

                    {/* <Route path="*" element={<NotFound />} /> */}
                </Routes>
            </React.Suspense>
        </Router>
    );
};

export default App;
