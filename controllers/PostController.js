import PostModel from '../models/Post.js';
import cloudinary from '../utils/cloudinary.js';
export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(10).exec();
    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 10);
    res.json(tags);
  } catch (error) {
    res.status(404).json({
      message: 'cant get all tags',
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate('user').sort({ createdAt: -1 }).exec();

    res.json(posts);
  } catch (error) {
    res.status(404).json({
      message: 'cant get all posts',
    });
  }
};
export const getByPopularity = async (req, res) => {
  try {
    const posts = await PostModel.find().populate('user').sort({ viewsCount: 'desc' }).exec();
    res.json(posts);
  } catch (error) {
    res.status(404).json({
      message: 'cant get all populated posts',
    });
  }
};

export const create = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.imageUrl, { folder: 'mern' });
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      tags: req.body.tags,
      user: req.userId,
    });

    const post = await doc.save();
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'cant create a post',
    });
  }
};
export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;
    //vadimo id posta iz requesta
    await PostModel.findOneAndUpdate(
      {
        _id: postId, //prvi parametar po kom trazimo zeljeni post
      },
      {
        $inc: { viewsCount: 1 }, //ovde zelimo da  se views menja
      },
      {
        returnDocument: 'after', //ovde zelimo da nam vraca updejtovan post(sa update pregledima)
      },
    )
      .populate('user')
      .then((doc, err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Cant get a single post',
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: 'Post doesnt exist',
          });
        }
        res.json(doc);
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Error while getting a post',
    });
  }
};
export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.findOneAndDelete({
      _id: postId,
    }).then((doc, err) => {
      if (err) {
        res.status(500).json({
          message: 'Cant delete a post',
        });
      }
      if (!doc) {
        res.status(404).json({
          message: 'Cant find a post',
        });
      }
      res.json({
        success: true,
      });
    });
  } catch (error) {}
};
export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags,
      },
    );
    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: 'cant update post (wrong id)',
    });
  }
};
