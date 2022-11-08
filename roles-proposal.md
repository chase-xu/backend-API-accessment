
# Part 3: Written Evaluation
The product team has decided that we want to make a change to this application such that authors of a blog post can have different roles:

Authors can be owners, editors, or viewers of a blog post. For any blog post, there must always be at least one owner of the blog post. Only owners of a blog post can modify the authors' list to a blog post (adding more authors, changing their role).

Questions:
What database changes would be required to the starter code to allow for different roles for authors of a blog post? Imagine that we’d want to also be able to add custom roles and change the permission sets for certain roles on the fly without any code changes.
How would you have to change the PATCH route given your answer above to handle roles?
Considerations
Please format your answers so that they are easy to digest, and do not include any code in your pull request related to these questions above. We will be evaluating both the quality of your answer as well as the quality of your written explanation of that answer.
Please include a file in the root of the repo called roles-proposal.md that addresses these questions.



## Q1
In order to make the database to accommodate the new feature, a modification to the database structure is needed. We need to add additional columns in the user_post table, each column should represent different roles we’d like to add, like owner, editor, and viewer. These columns should be indicators with either true or false. True means the user has the role’s level of access to the post, otherwise, false. For each existing user_id, because we should make the field editor as true to keep the user as an editor. If there are a significant number of entries in the user_post table, to save computing power, we could set the editor field’s default as true, whenever we update an entry, we could modify the editor field according to the update. If we add a new entry, we could set the user’s role field as true, and other roles as false.

  
## Q2
To make the patch route able to adapt to this change, we should check the roles for the user to the post with both user_id and post_id. If the user has a role that is either editor or owner, the update should be applied, otherwise a 401 http response should be returned.
To update the roles, if the current user has owner role, we could proceed, otherwise return a 401 http response. For the users are assigned roles by the owner of the post(current user), if the users are existing users to this post, we could update the roles using true or false. If we need to remove a user from the post, which is also equivalent to unassign a user from all of the three roles, we could simply delete the corresponding row in user_post table. Assigning one of the roles to new users is also simple, we could simply add a new entry in the user_post table with proper data filled.
