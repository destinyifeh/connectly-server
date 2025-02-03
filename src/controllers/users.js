import {
  cloudImageRemoval,
  cloudImageUploader,
} from '../configs/cloud-uploader.config.js';
import {User} from '../models/users.js';

export const getUsersController = async (req, res) => {
  try {
    const users = await User.find({}).sort({createdAt: -1});
    console.log(users, 'users');
    res.status(200).json({
      status: 'success',
      code: '200',
      users: users,
      message: 'Users fetched succesfully',
    });
  } catch (err) {
    console.log(err);
  }
};

export const getCurrentUserController = async (req, res) => {
  const {
    params: {_id},
    user,
  } = req;
  try {
    const user = await User.findById(_id);
    console.log(user, 'user');
    res.status(200).json({
      status: 'success',
      code: '200',
      users: user,
      message: 'User fetched succesfully',
    });
  } catch (err) {
    console.log(err);
  }
};

export const deleteUserController = async (req, res) => {
  console.log('req, res');

  const {
    params: {_id},
    user,
  } = req;
  console.log(_id, 'idss');
  try {
    const photoIds = user.otherPhotos?.map(photo => photo.id) ?? [];
    const userPhotos = [user?.profilePhoto, ...photoIds];

    //const userPhotos = ['deee/zvd7lyyxfetdwxs7jkse', ...dee];
    await cloudImageRemoval(userPhotos, isMany);
    await User.findByIdAndDelete(user._id);
    res.status(200).send('User deleted');
  } catch (err) {
    console.log(err);
  }
};

export const updateUserController = async (req, res) => {
  console.log('req, res');
  const {
    params: {_id},
    user,
    body,
  } = req;

  try {
    const updatedUser = await User.findByIdAndUpdate(_id, body, {new: true});
    console.log(updatedUser, 'updateduser');
    res.status(200).json({
      status: 'success',
      code: '200',
      user: updatedUser,
      message: 'User record updated',
    });
  } catch (err) {
    console.log(err);
  }
};

export const updateUserPhotoController = async (req, res) => {
  console.log('req, res');
  const {
    query: {profile},
    user,
    body,
    file,
  } = req;

  try {
    if (profile) {
      const userPhoto = await cloudImageRemoval(user.profilePhoto.id);
      if (!userPhoto) {
        return res.status(500).json({message: 'upload failed'});
      }
      const fileUploadResult = await cloudImageUploader(file.path);
      const photo = {
        url: fileUploadResult.secure_url,
        id: fileUploadResult.public_id,
      };
      user.profilePhoto = photo;
      const theUser = await user.save();
      console.log(theUser, 'updateduser');
      res.status(200).json({
        status: 'success',
        code: '200',
        user: updatedUser,
        message: 'User record updated',
      });
    }
    const fileUploadResult = await cloudImageUploader(file.path);
    // if (!fileUploadResult || !fileUploadResult.secure_url) {
    //     return res.status(500).json({ message: 'File upload failed' });
    //   }
    const photo = {
      url: fileUploadResult.secure_url,
      id: fileUploadResult.public_id,
    };

    user.otherPhotos.push(photo);

    const theUser = await user.save();
    console.log(theUser, 'updateduser');
    res.status(200).json({
      status: 'success',
      code: '200',
      user: updatedUser,
      message: 'User record updated',
    });
  } catch (err) {
    console.log(err);
  }
};

export const deleteUserPhotoController = async (req, res) => {
  console.log('req, res');

  const {
    params: {_id},
    query: {photoId},
    user,
  } = req;
  console.log(_id, 'idss');
  try {
    user.otherPhotos.filter(photo => photo.id !== photoId);

    await cloudImageRemoval(photoId);
    await user.save();
    res.status(200).send('User deleted');
  } catch (err) {
    console.log(err);
  }
};

export const blockUserController = async (req, res) => {
  console.log('req, res');

  const {
    params: {_id},

    user,
  } = req;
  console.log(_id, 'idss');
  try {
    user.blackLists.push(user);

    const theUser = await user.save();
    res.status(200).json({
      status: 'success',
      code: '200',
      user: theUser,
      message: 'User blacklisted successfully',
    });
  } catch (err) {
    console.log(err);
  }
};

export const unBlockUserController = async (req, res) => {
  console.log('req, res');

  const {
    params: {_id},

    user,
  } = req;
  console.log(_id, 'idss');
  try {
    user.blackLists.filter(user => user._id !== _id);

    const theUser = await user.save();
    res.status(200).json({
      status: 'success',
      code: '200',
      user: theUser,
      message: 'User unblacklisted successfully',
    });
  } catch (err) {
    console.log(err);
  }
};

export const userFavouritesController = async (req, res) => {
  console.log('req, res');

  const {
    params: {_id},

    user,
  } = req;
  console.log(_id, 'idss');
  try {
    user.favouritesList.push(user);
    const theUser = await user.save();
    res.status(200).json({
      status: 'success',
      code: '200',
      user: theUser,
      message: 'successfully added to favourites list',
    });
  } catch (err) {
    console.log(err);
  }
};

export const removeUserFromFavouritesController = async (req, res) => {
  console.log('req, res');

  const {
    params: {_id},

    user,
  } = req;
  console.log(_id, 'idss');
  try {
    user.favouritesList.filter(user => user._id !== _id);
    const theUser = await user.save();
    res.status(200).json({
      status: 'success',
      code: '200',
      user: theUser,
      message: 'successfully removed from favourites list',
    });
  } catch (err) {
    console.log(err);
  }
};

export const reportUserController = async (req, res) => {
  console.log('req, res');

  const {
    params: {_id},

    user,
  } = req;
  console.log(_id, 'idss');
  try {
    user.reports.push(user);
    const theUser = await user.save();
    res.status(200).json({
      status: 'success',
      code: '200',
      user: theUser,
      message: 'successfully removed from favourites list',
    });
  } catch (err) {
    console.log(err);
  }
};
