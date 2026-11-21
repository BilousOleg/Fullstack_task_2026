const schems = require('../validationSchemes/schems');
const BadRequestError = require('../errors/BadRequestError');
const UtilFunctions = require('../utils/functions');
const {
  DEFAULTS: { DEFAULT_LIMIT, DEFAULT_OFFSET },
} = require('../constants');

module.exports.validateRegistrationData = async (req, res, next) => {
  const validationResult = await schems.registrationSchem.isValid(req.body);
  if (!validationResult) {
    return next(new BadRequestError('Invalid data for registration'));
  } else {
    next();
  }
};

module.exports.validateLogin = async (req, res, next) => {
  const validationResult = await schems.loginSchem.isValid(req.body);
  if (validationResult) {
    next();
  } else {
    return next(new BadRequestError('Invalid data for login'));
  }
};

module.exports.validateContestCreation = (req, res, next) => {
  const promiseArray = [];
  req.body.contests.forEach(el => {
    promiseArray.push(schems.contestSchem.isValid(el));
  });
  return Promise.all(promiseArray)
    .then(results => {
      results.forEach(result => {
        if (!result) {
          return next(new BadRequestError());
        }
      });
      next();
    })
    .catch(err => {
      next(err);
    });
};

module.exports.validateGetContestsQuery = (req, res, next) => {
  try {
    const { typeIndex, contestId, industry, awardSort, ownEntries } = req.query;

    const limit =
      req.query.limit === undefined ? DEFAULT_LIMIT : Number(req.query.limit);

    const offset =
      req.query.offset === undefined
        ? DEFAULT_OFFSET
        : Number(req.query.offset);

    if (!Number.isInteger(limit) || limit <= 0) {
      throw new BadRequestError('Invalid limit');
    }

    if (!Number.isInteger(offset) || offset < 0) {
      throw new BadRequestError('Invalid offset');
    }

    const normalizedContestId = contestId || undefined;

    if (normalizedContestId !== undefined) {
      const parsedContestId = Number(normalizedContestId);

      if (!Number.isInteger(parsedContestId) || parsedContestId <= 0) {
        throw new BadRequestError('Invalid contestId');
      }
    }

    const normalizedTypeIndex = typeIndex || undefined;

    if (
      normalizedTypeIndex !== undefined &&
      !UtilFunctions.isValidTypeIndex(normalizedTypeIndex)
    ) {
      throw new BadRequestError('Invalid typeIndex');
    }

    if (
      awardSort !== undefined &&
      awardSort !== '' &&
      !['asc', 'desc'].includes(awardSort)
    ) {
      throw new BadRequestError('Invalid awardSort');
    }

    if (ownEntries !== undefined && !['true', 'false'].includes(ownEntries)) {
      throw new BadRequestError('Invalid ownEntries');
    }

    req.contestsQuery = {
      limit,
      offset,
      typeIndex: normalizedTypeIndex,
      contestId: normalizedContestId ? Number(normalizedContestId) : undefined,
      industry: industry || undefined,
      awardSort: awardSort || undefined,
      ownEntries: ownEntries === 'true',
    };

    next();
  } catch (err) {
    next(err);
  }
};
