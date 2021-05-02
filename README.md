## Why `safe-install`?

`safe-install` is a simple package that installs other packages without side installations.

## Example

### `package.json`
```plain
{
    ...,
    "devDependencies": {
        "nyc": ...
    }
}
```

You want to install, for example, `cowsay`, but if you do it `nyc` package will also be installed *locally*. But `nyc` is utility and you want to store it *globally*. Actually, NPM does not have tools to ignore global packages installation.

This package will solve this problem. Just run:

```sh
npx safe-install cowsay
```

## How it works?

This utility just removes global packages from your `package.json` and remembers it. Then `safe-install` executes normal `npm i` and passes all its arguments to `npm`. Then remembered packages shall be restored in `package.json`.

Global packages are founding in global storage (`npm config get prefix`) and only they shall be removed and restored later.

## Usage

```sh
npx safe-install <...>
```

`<...>` shall be replaced to normal `npm i` args.