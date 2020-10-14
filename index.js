const path = require("path");
const Util = require("./Util");

const configPath = "./config.json";
const htmlExt = ".html";
const jsExt = ".js";
const cssExt = ".css";

const Colors = Object.freeze({
  BLUE: "\x1b[36m%s\x1b[0m",
  PINK: "\x1b[35m%s\x1b[0m",
  VIOLET: "\x1b[34m%s\x1b[0m",
  YELLOW: "\x1b[33m%s\x1b[0m",
  GREEN: "\x1b[32m%s\x1b[0m",
  RED: "\x1b[31m%s\x1b[0m",
});

class Build {
  constructor(configPath) {
    this.configPath = configPath;
    this.config = null;
    this.htmlFiles = [];
    this.jsFiles = [];
    this.cssFiles = [];
    this.minifyOptions = null;
    this.outputPath = null;
    this.jsPath = null;
    this.cssPath = null;
    this.excludeJs = null;
    this.closureCompiler = null;
  }

  async init() {
    console.log(Colors.BLUE, "Initialize");

    // read config
    this.config = await Util.readFile(this.configPath);
    console.log(Colors.GREEN, "Read configuration");

    // get minify config
    this.minifyOptions = this.config.minifyOptions;

    // get complier service url
    this.closureCompiler = this.config.closureCompiler;

    // get exclude js
    this.excludeJs = this.config.excludeJs;

    // get root path
    this.rootPath = this.config.rootPath;

    // read html files
    this.htmlFiles = Util.readDir(this.rootPath, htmlExt);
    console.log(Colors.GREEN, "Read html files");

    // read js files
    this.jsFiles = Util.readDir(
      path.join(this.rootPath, this.config.jsPath),
      jsExt
    );
    console.log(Colors.GREEN, "Read js files");

    // read css files
    this.cssFiles = Util.readDir(
      path.join(this.rootPath, this.config.cssPath),
      cssExt
    );
    console.log(Colors.GREEN, "Read css files");

    // create output folder
    this.outputPath = path.join(this.rootPath, this.config.output);
    Util.makeDir(this.outputPath);
    console.log(Colors.GREEN, `Create ${this.outputPath}`);

    // create js folder
    this.jsPath = path.join(this.outputPath, this.config.jsPath);
    Util.makeDir(this.jsPath);
    console.log(Colors.GREEN, `Create ${this.jsPath}`);

    // create css folder
    this.cssPath = path.join(this.outputPath, this.config.cssPath);
    Util.makeDir(this.cssPath);
    console.log(Colors.GREEN, `Create ${this.cssPath}`);

    // start minify html
    console.log(Colors.BLUE, `Start minify html`);
    this.minifyHtml(this.htmlFiles, this.minifyOptions);

    // start minify css
    console.log(Colors.BLUE, `Start minify css`);
    this.minifyCss(this.cssFiles, {});

    // start closure compiler
    console.log(Colors.BLUE, `Start compile js`);
    this.compileJs(this.jsFiles, this.closureCompiler, this.excludeJs);

    // copy folder, file necessary
    console.log(Colors.BLUE, `Start copy folder, file necessary`);
    this.copySrc();
  }

  // this method will minify html
  async minifyHtml(files, minifyOptions) {
    for (let i = 0; i < files.length; i++) {
      let text = await Util.readFile(files[i], false);
      let textMinify = Util.minifyHtml(text, minifyOptions);
      let fileName = path.join(this.outputPath, path.basename(files[i]));

      Util.writeFile(fileName, textMinify);
      console.log(Colors.PINK, `Minify ${fileName} successfully`);
    }
  }

  // this method will minify css
  async minifyCss(files, minifyOptions) {
    for (let i = 0; i < files.length; i++) {
      let text = await Util.readFile(files[i], false);
      let textMinify = Util.minifyCss(text, minifyOptions);
      let fileName = path.join(this.cssPath, path.basename(files[i]));

      Util.writeFile(fileName, textMinify);
      console.log(Colors.PINK, `Minify ${fileName} successfully`);
    }
  }

  // this method will compile js
  async compileJs(files, closureCompiler, excludeJs) {
    for (let i = 0; i < files.length; i++) {
      let basename = path.basename(files[i]);

      if (excludeJs.indexOf(basename) > -1) {
        console.log(Colors.VIOLET, `Ignore compile ${basename} file`);
        continue;
      }

      let text = await Util.readFile(files[i], false);
      console.log(Colors.YELLOW, `Compile ${files[i]} ...`);
      let textCompiled = await Util.compileJs(text, closureCompiler);
      let fileName = path.join(this.jsPath, basename);
      Util.writeFile(fileName, textCompiled);
      console.log(Colors.GREEN, `Compile ${files[i]} successfully`);
    }
  }

  copySrc() {
    // copy icon
    let iconOri = path.join(this.rootPath, "icon128.png");
    let iconDest = path.join(this.outputPath, "icon128.png");
    Util.copySrc(iconOri, iconDest);
    console.log(Colors.GREEN, `Copy ${iconDest} successfully`);

    // copy lang
    let langOri = path.join(this.rootPath, "lang");
    let langDest = path.join(this.outputPath, "lang");
    Util.copySrc(langOri, langDest);
    console.log(Colors.GREEN, `Copy ${langDest} successfully`);

    // copy src
    let srcOri = path.join(this.rootPath, "src");
    let srcDest = path.join(this.outputPath, "src");
    Util.copySrc(srcOri, srcDest);
    console.log(Colors.GREEN, `Copy ${srcDest} successfully`);

    // copy jquery
    let jqueryOri = path.join(this.rootPath, this.config.jsPath, "jquery.js");
    let jqueryDest = path.join(this.jsPath, "jquery.js");
    Util.copySrc(jqueryOri, jqueryDest);
    console.log(Colors.GREEN, `Copy ${jqueryDest} successfully`);

    // copy manifest
    let manifestOri = path.join(this.rootPath, "manifest.json");
    let manifestDest = path.join(this.outputPath, "manifest.json");
    Util.copySrc(manifestOri, manifestDest);
    console.log(Colors.GREEN, `Copy ${manifestDest} successfully`);
  }
}

var build = new Build(configPath);
build.init();
