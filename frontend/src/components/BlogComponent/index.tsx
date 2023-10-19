import { shortPostInterface } from "../../redux/types/post";
import Post from "../Post";
import { BlogContainer } from "./BlogContainerComponents";
import React from "react";
import { Title } from "../BlogPostComponent/BlogPostComponents";

import SearchBox from "../SearchBox";

const BlogComponent = ({
    data,

    handleSubmit,
    handleChange,
    search,
}: {
    data: shortPostInterface[];
    currentPage: number;
    handleClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    totalPages: number;
    handleSubmit: (e: React.FormEvent) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    search: string;
}) => {
    return (
        <>
            <BlogContainer>
                <Title>Blog Posts</Title>
                <SearchBox handleSubmit={handleSubmit} handleChange={handleChange} value={search} />
                {data.map((element: shortPostInterface) => (
                    <Post {...element} key={element.id} />
                ))}
            </BlogContainer>
        </>
    );
};

export default BlogComponent;
