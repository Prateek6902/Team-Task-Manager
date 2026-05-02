const AccessControl = require('accesscontrol');
const ac = new AccessControl();

exports.roles = (() => {
  ac.grant('member')
    .readOwn('profile')
    .updateOwn('profile')
    .readAny('project')
    .readAny('task')
    .createOwn('task')
    .updateOwn('task')
    .deleteOwn('task');

  ac.grant('admin')
    .extend('member')
    .readAny('profile')
    .updateAny('profile')
    .deleteAny('profile')
    .createAny('project')
    .updateAny('project')
    .deleteAny('project')
    .createAny('task')
    .updateAny('task')
    .deleteAny('task');

  return ac;
})();