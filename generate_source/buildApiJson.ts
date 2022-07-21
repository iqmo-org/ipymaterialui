import { mkdirSync } from 'fs';
import * as fse from 'fs-extra';
import path from 'path';
import * as ttp from 'typescript-to-proptypes';
import { findComponents } from 'docs/src/modules/utils/find';
import {
  getMaterialComponentInfo,

} from 'docs/scripts/buildApiUtils';
import buildComponentApi, {
} from 'docs/scripts/ApiBuilders/ComponentApiBuilder';
import { writeFileSync } from 'fs-extra';

const args = process.argv;

// Exit with a message
function exit(error) {
  console.log(error, '\n');
  process.exit();
}

if (args.length < 4) {
  exit('\nERROR: syntax: buildApiJson source target');
}

const rootDirectory = path.resolve(__dirname, '../../');
const docsApiDirectory = path.resolve(rootDirectory, args[3]);


const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
  const files = fse.readdirSync(dirPath);

  files.forEach((file) => {
    if (fse.statSync(`${dirPath}/${file}`).isDirectory()) {
      arrayOfFiles = getAllFiles(`${dirPath}/${file}`, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, '/', file));
    }
  });

  return arrayOfFiles;
};


async function run() {
  const workspaceRoot = path.resolve(__dirname, '../../');

  const componentDirectory = args[2];

  const components = findComponents(componentDirectory).filter((component) => {
    if (
      component.filename.includes('ThemeProvider') ||
      (component.filename.includes('mui-material') &&
        component.filename.includes('CssVarsProvider'))
    ) {
      return false;
    }
    return true;
  });

  const tsconfig = ttp.loadConfig(path.resolve(workspaceRoot, './tsconfig.json'));
  const program = ttp.createTSProgram(
    components.map((component) => {
      if (component.filename.endsWith('.tsx')) {
        return component.filename;
      }
      if (component.filename.endsWith('.js')) {
        return component.filename.replace(/\.js$/, '.d.ts');
      }
      throw new TypeError(
        `Unexpected component filename '${component.filename}'. Expected either a .tsx or .js file.`,
      );
    }),
    tsconfig,
  );

  const componentBuilds = components.map(async (component) => {
    try {
      const { filename } = component;
      const componentInfo = getMaterialComponentInfo(filename);

      mkdirSync(componentInfo.apiPagesDirectory, { mode: 0o777, recursive: true });

      const info = await buildComponentApi(componentInfo, program);

      return info;
    } catch (error: any) {
      error.message = `${path.relative(process.cwd(), component.filename)}: ${error.message}`;
      throw error;
    }
  });

  const promises = await Promise.allSettled(componentBuilds);

  const fails = promises.filter(
    (promise): promise is PromiseRejectedResult => promise.status === 'rejected',
  );

  fails.forEach((build) => {
    console.error(build.reason);
  });
  if (fails.length > 0) {
    process.exit(1);
  }
  const builds = (await Promise.all(componentBuilds)).filter(comp=>comp)


  writeFileSync(docsApiDirectory, JSON.stringify(builds, null, 2));

}

run();
