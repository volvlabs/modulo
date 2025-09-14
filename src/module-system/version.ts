import semver from 'semver';
import type { ModuleVersion } from '../types/module';

export function parseVersion(version: string): ModuleVersion {
  const parsed = semver.parse(version);
  if (!parsed) {
    throw new Error(`Invalid version string: ${version}`);
  }
  return {
    major: parsed.major,
    minor: parsed.minor,
    patch: parsed.patch,
  };
}

export function isVersionCompatible(version: string, range: string): boolean {
  return semver.satisfies(version, range);
}

export function checkDependencyCompatibility(
  _moduleId: string,
  version: string,
  dependencies: Record<string, string>
): string[] {
  const incompatibleDeps: string[] = [];
  
  for (const [depId, versionRange] of Object.entries(dependencies)) {
    if (!isVersionCompatible(version, versionRange)) {
      incompatibleDeps.push(depId);
    }
  }
  
  return incompatibleDeps;
}
