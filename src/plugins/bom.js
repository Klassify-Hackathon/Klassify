const { withProjectBuildGradle } = require("expo/config-plugins");

module.exports = function withFirebaseBom(config, { bom }) {
  return withProjectBuildGradle(config, (cfg) => {
    const marker = "// withFirebaseBom";
    if (!cfg.modResults.contents.includes(marker)) {
      cfg.modResults.contents += `
${marker}
project.ext {
  set('react-native', [versions: [firebase: [bom: '${bom}']]])
}
`;
    }
    return cfg;
  });
};
