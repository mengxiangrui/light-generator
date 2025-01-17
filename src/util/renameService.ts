import * as fse from 'fs-extra';
import * as path from 'path';
import { fileExistsSync, readFileSync, writeFileSync } from './fs';

export function renameService(name, servicePath) {
  const serviceFile = path.join(servicePath, 'serverless.yml');
  const packageFile = path.join(servicePath, 'package.json');

  if (!fse.existsSync(serviceFile)) {
    const errorMessage = [
      'serverless.yml not found in',
      ` ${servicePath}`,
    ].join('');
    throw new Error(errorMessage);
  }

  const serverlessYml =
    fse.readFileSync(serviceFile, 'utf-8')
      .replace(/service\s*:.+/gi, (match) => {
        const fractions = match.split('#');
        fractions[0] = `service: ${name}`;
        return fractions.join(' #');
      })
      .replace(/service\s*:\n {2}name:.+/gi, (match) => {
        const fractions = match.split('#');
        fractions[0] = `service:\n  name: ${name}`;
        return fractions.join(' #');
      });

  fse.writeFileSync(serviceFile, serverlessYml);

  if (fileExistsSync(packageFile)) {
    const json = readFileSync(packageFile);
    writeFileSync(packageFile, Object.assign(json, { name }));
  }

  return name;
}
