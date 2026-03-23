const moduleAlias = require("module-alias"),
  path = require("path"),
  root = path.join(__dirname, "../"),
  api = `${root}/src`;

const aliasConfig = {
  "@root": root,
  "@api": api,
  "@config": `${root}/config`,
  "@controller": `${api}/controllers`,
  "@route": `${api}/routes`,
  "@model": `${api}/models`,
  "@middleware": `${api}/middlewares`,
  "@service": `${api}/services`,
  "@wrapper": `${api}/wrappers`,
  "@helper": `${api}/helpers`,
};

module.exports = () => moduleAlias.addAliases(aliasConfig);
