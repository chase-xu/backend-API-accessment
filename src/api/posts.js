const express = require('express');
const { INTEGER } = require('sequelize');
const { Post, UserPost, User } = require('../db/models');
const router = express.Router();

/**
 * Create a new blog post
 * req.body is expected to contain {text: required(string), tags: optional(Array<string>)}
 */

/** Part 2: update posts */
router.patch('/:postId', async(req, res, next)=>{
  try{
    //  Validation
    if(!req.user) return res.status(401).json({error: 'Unauthorized User.'});

    const userId = req.user.id;
    const {authorIds, tags, text} = req.body;
    const postId = req.params.postId;

    let post = await Post.getPostByPostId(postId);
    if(post === null || post === undefined) return res.status(204).json({error: `No data with postId ${postId}`});
    /** collect user ids */
    let userIds = [];
    for(let userPost in post.user_posts){
      userIds.push(post.user_posts[userPost].dataValues.user_id);
    }
    if(!userIds.includes(userId)) return res.status(401).json({"error": 'users can edit only their posts.'});

    /** update user_posts */
    if(authorIds !== undefined){
      if(!Array.isArray(authorIds)) return res.status(400).json({error: 'authorIds should be array of integers.'});
      if(authorIds.length === 0) return res.status(400).json({error: 'authorIds should be array of integers, not empty.'});
    
      const promises = [];
      for(let author of authorIds){
        if(!Number.isInteger(author)) return res.status(400).json({error: 'authorIds should be array of integers.'});
        if (!userIds.includes(author)){
          const promise = UserPost.create({
              userId: author,
              postId: Number(postId)
              });
          promises.push(promise);
        }
      }
      for(let uid of userIds){
        if(!authorIds.includes(uid)){
          const promise = 
              UserPost.destroy({
                where:{
                  userId: uid,
                  postId: Number(postId)
                }
              })
          promises.push(promise);
        }
      }
      try{
        await Promise.all(promises);        
      } catch(err){
        return res.status(500).json({error: err});
      }
    
    }
    /** Update entry with new data */
    if(tags !== undefined){
      if(!Array.isArray(tags)) return res.status(400).json({error: 'tags should be array of strings.'});
      if(tags.length === 0) return res.status(400).json({error: 'tags should be array of strings, not empty.'});
      try{
        post.tags = tags.join(',');
      } catch(err){
        return res.status(400).json({error: 'tags should be array of strings.'});
      }
      
    }
    if(text !== undefined){
      if(typeof text !== 'string') return res.status(400).json({error: 'text should be string.'});
      if(text.length === 0) return res.status(400).json({error: 'text should be none empty string.'});
      post.text = text;
    }
    await post.save();
    // Remove user post that got from include
    delete post.dataValues.user_posts;

    // modify response
    if(!Array.isArray(post.dataValues.tags)) post.tags = post.tags.split(',');
    if(authorIds !== undefined) {
      post.dataValues.authorIds = authorIds;
    } else {
      post.dataValues.authorIds = userIds;
    }
    return res.json({post});
    
  } catch(err){
    next(err);
  }
})



/** Part 1: get posts */
router.get('/', async (req, res, next)=>{
  
  try{

    if(!req.user) return res.status(401).json({error: 'Unauthorized User.'});
    if(!req.query.authorIds) return res.status(400).json({error: 'Missing authorIds as query parameter.'});
    if(typeof req.query.authorIds !== 'string') return res.status(400).json({error: 'Query parameter authorIds should be string.'});

    let authorIds = req.query.authorIds;
    authorIds = authorIds.split(',');
    const arrOfIds = [];
    authorIds.forEach(str => {
      arrOfIds.push(Number(str));
    });
    /** Default option for sorting */
    let sortBy = 'id';
    let direction = 'asc';
    if(req.query.sortBy) {sortBy = req.query.sortBy}
    if(req.query.direction) {direction = req.query.direction}

    let data = await Post.getPostsByUserId(arrOfIds, sortBy, direction);
    if(data === null || data === undefined) return res.status(204).json({error: 'No existing data found.'})
    data.forEach((item, index, arr)=>{
      arr[index].tags = item.tags.split(',');
    })
    return res.json({"posts": data});
    
  } catch(err){
    next(err);
  }
})


router.post('/', async (req, res, next) => {
  try {
    // Validation
    if (!req.user) {
      return res.sendStatus(401).json({error: 'Unauthorized User.'});
    }

    const { text, tags } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ error: 'Must provide text for the new post' });
    }

    // Create new post
    const values = {
      text,
    };
    if (tags) {
      values.tags = tags.join(',');
    }
    const post = await Post.create(values);
    await UserPost.create({
      userId: req.user.id,
      postId: post.id,
    });

    res.json({ post });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
