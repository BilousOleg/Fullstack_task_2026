const { Router } = require('express');
const basicMiddlewares = require('../middlewares/basicMiddlewares');
const upload = require('../utils/fileUpload');
const validators = require('../middlewares/validators');
const userController = require('../controllers/userController');
const contestController = require('../controllers/contestController');

const contestsRouter = Router();

// POST /contests
contestsRouter.post(
  '/',
  basicMiddlewares.onlyForCustomer,
  upload.uploadContestFiles,
  basicMiddlewares.parseBody,
  validators.validateContestCreation,
  userController.payment
);

// GET /contests
contestsRouter.get(
  '/',
  basicMiddlewares.onlyForCreative,
  contestController.getContests
);

// GET /contests/byCustomer
contestsRouter.get('/byCustomer', contestController.getCustomersContests);

// GET /contests/:id
contestsRouter.get(
  '/:contestId',
  basicMiddlewares.canGetContest,
  contestController.getContestById
);

module.exports = contestsRouter;
