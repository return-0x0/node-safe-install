import { execSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export function getGlobalPacakgeNames(): string[] {
    const prefix = execSync('npm config get prefix').toString().trimEnd();
    const globalStoragePath = path.join(prefix, 'node_modules');

    return readdirSync(globalStoragePath)
        .map(prefix => prefix.startsWith('@')
            ? readdirSync(path.join(globalStoragePath, prefix))
                .map(postfix => `${prefix}/${postfix}`)
            : [prefix])
        .reduce((sum, names) => { sum.push(...names); return sum; });
}

export const DEPENDENCIES_PROPERTY_NAMES: string[] = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'peerDependenciesMeta',
    'bundledDependencies',
    'optionalDependencies'
];

export function extractPackages(path?: string | null, ...packageNames: string[]): string[] {
    if (packageNames.length === 0) packageNames = getGlobalPacakgeNames();

    path ??= 'package.json';

    const tempPackageNames = new Set(packageNames);
    const package_json = JSON.parse(readFileSync(path).toString());
    const extractedPackages: string[] = [];

    for (const dependencyPropertyName of DEPENDENCIES_PROPERTY_NAMES) {
        if (!(dependencyPropertyName in package_json)) continue;

        for (const dependencyName in package_json[dependencyPropertyName])
            if (tempPackageNames.has(dependencyName)) {
                const version = package_json[dependencyPropertyName][dependencyName];

                tempPackageNames.delete(dependencyName);
                extractedPackages.push(`${dependencyPropertyName}:${dependencyName}:${version}`);

                delete package_json[dependencyPropertyName][dependencyName];
            }
    }

    writeFileSync(path, JSON.stringify(package_json, null, '  '));

    return extractedPackages;
}
export function injectPackages(path?: string | null, ...extractedPackages: string[]): void {
    if (extractedPackages.length === 0) return;
    
    path ??= 'package.json';
    
    const package_json = JSON.parse(readFileSync(path).toString());
    
    for (const extractedPackage of extractedPackages) {
        const [dependencyPropertyName, packageName, version] = extractedPackage.split(':');

        if (!(dependencyPropertyName in package_json))
            Object.defineProperty(package_json, dependencyPropertyName, {
                value: {},
                writable: true,
                enumerable: true,
                configurable: true
            });
        
        const dependencies = package_json[dependencyPropertyName];

        if (!(packageName in dependencies))
            Object.defineProperty(dependencies, packageName, {
                value: version,
                writable: true,
                enumerable: true,
                configurable: true
            });
    }

    writeFileSync(path, JSON.stringify(package_json, null, '  '));
}