import { Request, Response } from "express";
import { IGetUserAuthInfoRequest } from "../middleware/tokenCheck";
import Post, { IPost } from "../models/post";
import { Comment } from "../models/comment";
const PaginatePosts = ({
  posts,
  page,
  perPage,
}: {
  posts: IPost[];
  page: number;
  perPage: number;
}): IPost[] => {
  return posts.slice(page * perPage - perPage, page * perPage);
};
const SlicePosts = ({ posts }: { posts: IPost[] }) => {
  return posts.map((newPost) => {
    return {
      description: newPost.description,
      title: newPost.title,
      imageURL: newPost.imageURL,
      slug: newPost.slug,
      id: newPost._id as string,
    };
  });
};
export const Posts = (req: Request, res: Response) => {
  const page = req.query.page as string;
  const perPage = req.query.perPage as string;
  const search = req.query.search as string;
  if (!page || !perPage) {
    res.status(401).send({
      message: "Please specify the page and perPage parameters",
    });
  }

  Post.find({
    // If search param exists, make a partial text search in content and title fields
    ...(search && {
      $or: [
        {
          content: {
            $regex: search,
            $options: "i",
          },
        },
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    }),
  })
    .sort("-createdAt")
    .then((posts) => {
      const PaginatedPosts = PaginatePosts({
        posts,
        page: Number(page),
        perPage: Number(perPage),
      });
      const PaginatedAndSlicedPosts = SlicePosts({ posts: PaginatedPosts });
      const totalPages = Math.ceil(posts.length / Number(perPage));
      res.send({
        totalPages: totalPages,
        page: parseInt(page),
        numberOfElements: posts.length,
        perPage: parseInt(perPage),
        results: PaginatedAndSlicedPosts,
      });
      return;
    })
    .catch((error) => {
      res.status(500).send(error);
      console.log(error);
    });
};

export const PostBySlug = (req: Request, res: Response) => {
  const slug = req.params.slug;
  if (!slug) {
    res.status(401).send({
      message: "Please specify the slug",
    });
  }
  Post.findOne({ slug: slug })
    .populate({ path: "createdBy", select: ["username"] })
    .populate({ path: "comments.createdBy", select: ["username", "imageURL"] })
    .populate({
      path: "comments.replies.createdBy",
      select: ["username", "imageURL"],
    })
    .then((post) => {
      if (!post) {
        res.status(404).send({
          message: "Can't find specific post",
        });
        return;
      }
      // This sorts the comments
      post.comments.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      // This sorts the replies
      post.comments.forEach((comment) => {
        comment.replies.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
      });
      res.send(post);
    })
    .catch((error) => {
      res.status(500).send(error);
      console.log(error);
    });
};

export const GetPostsByTag = (req: Request, res: Response) => {
  const tag = req.query.tag as string;
  const page = req.query.page as string;
  const perPage = req.query.perPage as string;
  if (!tag) {
    res.status(401).send({
      message: "Please specify the tag",
    });
    return;
  }
  Post.find({ tags: tag })
    .sort("-createdAt")
    .then((posts) => {
      const PaginatedPosts = PaginatePosts({
        posts,
        page: Number(page),
        perPage: Number(perPage),
      });
      const PaginatedAndSlicedPosts = SlicePosts({ posts: PaginatedPosts });
      const totalPages = Math.ceil(posts.length / Number(perPage));
      res.send({
        totalPages: totalPages,
        page: parseInt(page),
        numberOfElements: posts.length,
        perPage: parseInt(perPage),
        results: PaginatedAndSlicedPosts,
      });
      return;
    })
    .catch((error) => {
      res.status(500).send(error);
      console.log(error);
    });
};

export const GetPostsByCategory = (req: Request, res: Response) => {
  const category = req.query.category as string;
  const page = req.query.page as string;
  const perPage = req.query.perPage as string;
  if (!category) {
    res.status(401).send({
      message: "Please specify the category",
    });
    return;
  }
  if (!page || !perPage) {
    res.status(401).send({
      message: "Please specify the page and perPage params",
    });
    return;
  }
  Post.find({ category: category })
    .sort("-createdAt")
    .then((posts) => {
      const PaginatedPosts = PaginatePosts({
        posts,
        page: Number(page),
        perPage: Number(perPage),
      });
      const PaginatedAndSlicedPosts = SlicePosts({ posts: PaginatedPosts });
      const totalPages = Math.ceil(posts.length / Number(perPage));
      res.send({
        totalPages: totalPages,
        page: parseInt(page),
        numberOfElements: posts.length,
        perPage: parseInt(perPage),
        results: PaginatedAndSlicedPosts,
      });
      return;
    })
    .catch((error) => {
      res.status(500).send(error);
      console.log(error);
    });
};

export const AddPost = async (req: IGetUserAuthInfoRequest, res: Response) => {
  try {
    const { title, content, category, imageURL } = req.body;

    // let imageURL = req.file.filename;

    const post = new Post({
      title: title,
      content: content,
      category: category,
      imageURL: imageURL,
      slug: title.replaceAll(" ", "-").toLowerCase(),
      description: content.slice(0, 55),
      createdBy: req.user.id,
    });

    const newPost = await post.save();
    res.status(200).json({
      message: "added",
      data: newPost,
    });
  } catch (error: any) {
    console.log(error.message);

    res.status(500).send(error.message);
  }
};
export const AddComment = (req: IGetUserAuthInfoRequest, res: Response) => {
  const id = req.body.id as string;
  const content = req.body.content as string;
  if (!content) {
    res
      .status(401)
      .send({ message: "You need to specify the content of the comment" });
    return;
  }
  if (!id) {
    res.status(401).send({ message: "You need to specify the id of the post" });
    return;
  }
  Post.updateOne(
    { _id: id },
    {
      $push: {
        comments: [
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            createdBy: req.user.id,
            content: content,
            createdAt: new Date(),
          },
        ],
      },
    }
  )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .then((post) => {
      res.send({ message: "Comment added successfully" });
      return;
    })
    .catch((error) => {
      res.status(500).send(error);
      console.log(error);
      return;
    });
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DeletePost = (req: IGetUserAuthInfoRequest, res: Response) => {
  const _id = req.body.id as string;
  if (!_id) {
    res.status(401).send({ message: "You need to specify the id of the post" });
    return;
  }
  Post.findById(_id)
    .then((post) => {
      if (!post) {
        res.status(404).send({ message: "The id does not match any post" });
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (!post.createdBy.equals(req.user._id)) {
        res
          .status(403)
          .send({ message: "You don't have permission to delete this post" });
        return;
      }
      post
        .remove()
        .then((data) => {
          res.send({ data: data, message: "Post deleted successfully" });
        })
        .catch((error) => {
          res.status(500).send(error);
          console.log(error);
          return;
        });
    })
    .catch((error) => {
      res.status(500).send(error);
      console.log(error);
      return;
    });
};

export const DeleteComment = (req: IGetUserAuthInfoRequest, res: Response) => {
  const postId = req.body.postId as string;
  const commentId = req.body.commentId as string;
  const parentId = req.body.parentId as string;
  if (!postId) {
    res.status(401).send({ message: "You need to specify the id of the post" });
    return;
  }
  if (!commentId) {
    res
      .status(401)
      .send({ message: "You need to specify the id of the comment" });
    return;
  }
  Post.findById(postId)
    .then((post) => {
      let foundComment;
      let index;
      //Find the comment and its index
      if (!parentId) {
        foundComment = post.comments.find(
          (comment) => comment.id === commentId
        );
        index = post.comments.indexOf(foundComment);
      } else {
        foundComment = post.comments
          .find((comment) => comment.id === parentId)
          .replies.find((comment) => comment.id === commentId);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        index = post.comments
          .find((comment) => comment.id === parentId)
          .replies.indexOf(foundComment);
      }

      //Edge cases
      if (!foundComment) {
        res.status(404).send({ message: "Comment does not exists" });
        return;
      }

      if (!foundComment.createdBy === req.user.id) {
        res
          .status(403)
          .send({ message: "You don't have permission to delete this post" });
        return;
      }

      //Changing the array for specific case
      if (!parentId) {
        post.comments.splice(index, 1);
      } else {
        post.comments
          .find((comment) => comment.id === parentId)
          .replies.splice(index, 1);
      }
      //Save the whole post after the comment was deleted
      post
        .save()
        .then((data) => {
          res.send({ data: data, message: "Comment deleted successfully" });
          return;
        })
        .catch((error) => {
          res.status(500).send(error);
          console.log(error);
          return;
        });
    })
    .catch((error) => {
      res.status(500).send(error);
      console.log(error);
      return;
    });
};
export const UpdatePost = (req: IGetUserAuthInfoRequest, res: Response) => {
  const id = req.body.id as string;
  const newContent = req.body.content as string;
  if (!id) {
    res.status(401).send({ message: "You need to specify the id of the post" });
    return;
  }
  if (!newContent) {
    res
      .status(401)
      .send({ message: "You need to specify the new content of the post" });
    return;
  }
  Post.findById(id)
    .then((post) => {
      if (!post) {
        res.status(404).send({ message: "No post found with this id" });
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (!post.createdBy.equals(req.user.id)) {
        res
          .status(403)
          .send({ message: "You don't have permission to update this post" });
        return;
      }
      post.content = newContent;
      post
        .save()
        .then((data) => {
          res.send({ data: data, message: "Post updated successfully" });
          return;
        })
        .catch((error) => {
          res.status(500).send(error);
          console.log(error);
          return;
        });
    })
    .catch((error) => {
      res.status(500).send(error);
      console.log(error);
      return;
    });
};
export const AddReply = (req: IGetUserAuthInfoRequest, res: Response) => {
  const postId = req.body.postId as string;
  const commentId = req.body.commentId as string;
  const content = req.body.content as string;
  if (!postId) {
    res.status(401).send({ message: "You need to specify the id of the post" });
    return;
  }
  if (!commentId) {
    res
      .status(401)
      .send({ message: "You need to specify the id of the parent comment" });
    return;
  }
  if (!content) {
    res
      .status(401)
      .send({ message: "You need to specify the content of the reply" });
    return;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        res.status(404).send({ message: "No post with this id" });
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const foundComment = post.comments.find((comment) =>
        comment._id.equals(commentId)
      );
      if (!foundComment) {
        res
          .status(404)
          .send({ message: "No comment on specified post with this id" });
        return;
      }
      const index = post.comments.indexOf(foundComment);
      const newComment = new Comment({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        createdBy: req.user.id,
        content: content,
        createdAt: new Date(),
      });
      post.comments[index].replies.push(newComment);
      post
        .save()
        .then((data) => {
          res.send({ message: "Reply added successfully", data: data });
          return;
        })
        .catch((error) => {
          res.status(500).send(error);
          console.log(error);
          return;
        });
      return;
    })
    .catch((error) => {
      res.status(500).send(error);
      console.log(error);
      return;
    });
};
