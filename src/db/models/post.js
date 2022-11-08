const {Sequelize, Op} = require('sequelize');
const db = require('../db');
const UserPost = require('./user_post');

const Post = db.define(
  'post',
  {
    text: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    likes: {
      type: Sequelize.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    reads: {
      type: Sequelize.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    popularity: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0.0,
        max: 1.0,
      },
    },
    tags: {
      // note: comma separated string since sqlite does not support arrays
      type: Sequelize.STRING,
      allowNull: false,
    }
  },
  {
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  }
);

Post.getPostsByUserId = async function (userId, orderBy='id', direction='asc') {
  return Post.findAll({
    attributes:['id', 'likes', 'popularity', 'reads',
    'tags', 'text'],
    order: [[orderBy, direction]],
    include: [
      {
        model: UserPost,
        attributes: [],
        where: {
          userId: {[Op.or]: userId},
        },
      },
    ],
  });
};

Post.getPostByPostId = async function(postId){
  return Post.findOne({
    attributes:['id', 'likes', 'popularity', 'reads',
    'tags', 'text'],
    include:[{
      model: UserPost,
      attributes: ['user_id'],
    }],
    where: {
      id: postId
    }
    
  });
};

module.exports = Post;
