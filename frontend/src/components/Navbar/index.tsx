import React, { useState } from "react";
import {
    Nav,
    MobileIcon,
    NavContainer,
    NavItem,
    NavbarLinks,
    NavLink,
    LoginButton,
    ProfileImage,
    ProfileImageContainer,
    AddPostButton,
    NewLink,
} from "./navbarComponents";
import { FaTimes, FaBars } from "react-icons/fa";

const Navbar = ({ background, image }: { background?: string; image?: string }) => {
    const [click, setClick] = useState(false);
    return (
        <Nav background={background}>
            <NavContainer>
                <NavbarLinks onClick={() => setClick(false)} click={click}>
                    <NavItem>
                        <NavLink to="/">Blog</NavLink>
                    </NavItem>
                    {!image && (
                        <NavItem>
                            <NewLink to="/login">
                                <LoginButton>Login</LoginButton>
                            </NewLink>
                        </NavItem>
                    )}
                    {image && (
                        <>
                            <NavItem>
                                <NewLink to="/profile">
                                    <ProfileImageContainer>
                                        <ProfileImage src={image} alt="Profile Image" height="45" width="45" />
                                    </ProfileImageContainer>
                                </NewLink>
                            </NavItem>

                            <NavItem>
                                <NewLink to="/blog/add">
                                    <AddPostButton>Add Post</AddPostButton>
                                </NewLink>
                            </NavItem>
                        </>
                    )}
                </NavbarLinks>

                <MobileIcon onClick={() => setClick((oldClick) => !oldClick)}>
                    {click ? <FaTimes /> : <FaBars />}
                </MobileIcon>
            </NavContainer>
        </Nav>
    );
};

export default Navbar;
