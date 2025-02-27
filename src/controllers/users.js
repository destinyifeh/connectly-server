import {
  cloudImageRemoval,
  cloudImageUploader,
} from '../configs/cloud-uploader.config.js';
import {User} from '../models/users.js';

export const getUsersController = async (req, res) => {
  const {
    params: {id},
    query: {query, minAge, maxAge, gender},
    user,
  } = req;

  try {
    if (query === 'foryou') {
      const users = await User.find({isActive: true, _id: {$ne: id}}).sort({
        createdAt: -1,
      });

      if (users?.length > 0) {
        return res.status(200).json({
          status: 'success',
          code: '200',
          users: users,
          message: 'Users fetched succesfully',
        });
      }
      return res.status(404).json({
        status: 'not found',
        userCode: '404',
        userMessage: 'No active users',
        users: [],
      });
    }
    if (query === 'fav') {
      const favList = user.favourites;
      const users = await User.find({
        isActive: true,
        _id: {$in: favList}, // Use $in to find users whose _id is in favList
      }).sort({createdAt: -1});

      if (users?.length > 0) {
        return res.status(200).json({
          status: 'success',
          code: '200',
          users: users,
          message: 'Favourites users fetched succesfully',
        });
      }
      return res.status(200).json({
        status: 'not found',
        userCode: '404',
        userMessage: 'No favourite users',
        users: [],
      });
    }

    if (query === 'nearby') {
      const users = await User.find({
        isActive: true,
        city: user.city,
        _id: {$ne: id},
      }).sort({
        createdAt: -1,
      });

      if (users?.length > 0) {
        return res.status(200).json({
          status: 'success',
          code: '200',
          users: users,
          message: 'Nearby uers fetched succesfully',
        });
      }
      return res.status(200).json({
        status: 'not found',
        userCode: '404',
        userMessage: 'No nearby users',
        users: [],
      });
    }

    if (query === 'fil') {
      const filter = {
        age: {$gte: minAge, $lte: maxAge},
      };

      if (gender !== 'both') {
        filter.gender = gender;
      }

      const findUsers = await User.find(filter);

      if (findUsers?.length > 0) {
        res.status(200).json({
          status: 'success',
          userCode: '200',
          users: findUsers,
          message: 'filter users fetched successfully',
        });
      } else {
        res.status(200).json({
          status: 'not found',
          userCode: '404',
          userMessage: 'No users found',
          users: [],
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Oops! Something went wrong while fetchig users.',
    });
  }
};

export const getCurrentUserController = async (req, res) => {
  const {
    params: {id},
    user,
  } = req;
  try {
    const user = await User.findById(id);

    res.status(200).json({
      status: 'success',
      code: '200',
      users: user,
      message: 'User fetched succesfully',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Internal server error',
      error: err,
    });
  }
};

export const deleteUserController = async (req, res) => {
  const {
    params: {id},
    user,
    body: {userId},
  } = req;

  try {
    const photoIds = user.otherPhotos?.map(photo => photo.id) ?? [];
    const userPhotos = [user?.profilePhoto.id, ...photoIds];

    console.log(userPhotos, 'my photos idds');
    await cloudImageRemoval(userPhotos, true);
    await User.findByIdAndDelete(id);
    res.status(200).send('User deleted');
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'error',
      error: err.message,
      code: '500',
      message: 'Internal server error',
    });
  }
};

export const updateUserController = async (req, res) => {
  const {
    params: {id},
    user,
    body,
  } = req;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, body, {new: true});
    console.log(updatedUser, 'updateduser');
    res.status(200).json({
      status: 'success',
      code: '200',
      user: updatedUser,
      message: 'Record updated successfully',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Internal server error',
      error: err,
    });
  }
};

export const updateUserProfilePhotoController = async (req, res) => {
  const {
    query: {profile},
    user,
    body,
    file,
  } = req;

  try {
    if (user.profilePhoto?.id) {
      const removePhotoRes = await cloudImageRemoval(user.profilePhoto.id);

      if (removePhotoRes?.result !== 'ok') {
        return res.status(500).json({message: 'upload failed'});
      }
    }
    const fileUploadResult = await cloudImageUploader(file.path);

    const photo = {
      url: fileUploadResult.secure_url,
      id: fileUploadResult.public_id,
    };
    user.profilePhoto = photo;
    const theUser = await user.save();

    return res.status(200).json({
      status: 'success',
      code: '200',
      user: theUser,
      message: 'Profile photo updated',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Internal server error',
      error: err,
    });
  }
};

export const updateUserOtherPhotosController = async (req, res) => {
  const {
    query: {profile},
    user,
    body,
    file,
  } = req;

  try {
    const fileUploadResult = await cloudImageUploader(file.path);

    const photo = {
      url: fileUploadResult.secure_url,
      id: fileUploadResult.public_id,
    };

    user.otherPhotos.unshift(photo);

    const theUser = await user.save();

    res.status(200).json({
      status: 'success',
      code: '200',
      user: theUser,
      message: 'Record updated successfully',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      code: '500',
      message: 'Oops! An error occurred',
      error: err,
    });
  }
};

export const deleteUserPhotoController = async (req, res) => {
  const {
    params: {id},
    query: {photoIds},
    user,
    body: {item},
  } = req;

  try {
    user.otherPhotos = user.otherPhotos.filter(photo => photo.id !== item);
    await cloudImageRemoval(item);
    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Photo deleted',
      code: '200',
      status: 'success',
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({message: 'Internal server error', code: '500', status: 'eror'});
  }
};

export const blockUserController = async (req, res) => {
  const {
    params: {id},
    user,
    body,
  } = req;

  try {
    if (!user.blackLists.includes(body.user)) {
      user.blackLists.push(body.user);
      const theUser = await user.save();
      return res.status(200).json({
        status: 'success',
        code: '200',
        user: theUser,
        message: 'Blocked.',
      });
    }

    user.blackLists = user.blackLists.filter(bUser => bUser !== body.user);
    await user.save();
    return res.status(200).json({
      status: 'success',
      code: '200',
      user: user,
      message: 'Unblocked',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'error',
      error: err.message,
      code: '500',
      message: 'Internal server error',
    });
  }
};

export const userFavouritesController = async (req, res) => {
  const {
    params: {id},
    user,
    body,
  } = req;

  try {
    if (!user.favourites.includes(body.user)) {
      user.favourites.push(body.user);
      const theUser = await user.save();
      return res.status(200).json({
        status: 'success',
        code: '200',
        user: theUser,
        message: 'Added to favorites.',
      });
    }

    user.favourites = user.favourites.filter(favUser => favUser !== body.user);
    await user.save();
    return res.status(200).json({
      status: 'success',
      code: '200',
      user: user,
      message: 'Removed from favorites.',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'error',
      error: err.message,
      code: '500',
      message: 'Internal server error',
    });
  }
};

export const reportUserController = async (req, res) => {
  const {
    params: {id},
    user,
    body,
  } = req;

  try {
    const isAlreadyReported = await user.reports.find(
      report => report._id === body._id,
    );
    if (isAlreadyReported) {
      return res.status(400).json({
        status: 'reported',
        code: '400',
        message: 'Your already reported this user',
      });
    }
    user.reports.push(body);
    const theUser = await user.save();
    res.status(200).json({
      status: 'success',
      code: '200',
      user: theUser.username,
      message: 'Your report was successful',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      error: err.message,
      code: '500',
      message: 'Internal server error',
    });
  }
};

export const searchForUserController = async (req, res) => {
  const {
    params: {id},
    query: {query},
    user,
  } = req;

  try {
    const searchUser = await User.find({
      username: {$regex: query, $options: 'i'}, // Example: Case-insensitive name search
    });

    if (searchUser.length > 0) {
      res.status(200).json({
        status: 'success',
        code: '200',
        items: searchUser,
        message: 'user found',
      });
    } else {
      res.status(404).json({
        status: 'invalid',
        code: '404',
        message: 'No user found',
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      error: err.message,
      code: '500',
      message: 'Internal server error',
    });
  }
};

export const saveUserPushNotificationToken = async (req, res) => {
  const {
    params: {id},
    body: {token},
    user,
  } = req;

  try {
    if (user.pushTokens.includes(token)) {
      return res.status(200).json({
        status: 'success',
        code: '200',

        message: 'Token already exist',
      });
    }

    user.pushTokens.push(token);
    const saveUser = await user.save();

    return res.status(200).json({
      status: 'success',
      code: '200',
      user: saveUser,
      message: 'Token saved',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      error: err.message,
      code: '500',
      message: 'Internal server error',
    });
  }
};
