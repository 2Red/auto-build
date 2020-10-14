const path = require("path");
const Util = require("./Util");

const configPath = "./config.json";
const htmlExt = ".html";
const jsExt = ".js";
const cssExt = ".css";

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
    // read config
    this.config = await Util.readFile(this.configPath);

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

    // read js files
    this.jsFiles = Util.readDir(
      path.join(this.rootPath, this.config.jsPath),
      jsExt
    );

    // read css files
    this.cssFiles = Util.readDir(
      path.join(this.rootPath, this.config.cssPath),
      cssExt
    );

    // create output folder
    this.outputPath = path.join(this.rootPath, this.config.output);
    Util.makeDir(this.outputPath);

    // create js folder
    this.jsPath = path.join(this.outputPath, this.config.jsPath);
    Util.makeDir(this.jsPath);

    // create css folder
    this.cssPath = path.join(this.outputPath, this.config.cssPath);
    Util.makeDir(this.cssPath);

    // start minify html
    this.minifyHtml(this.htmlFiles, this.minifyOptions);

    // start minify css
    this.minifyCss(this.cssFiles, {});

    // start closure compiler
    this.compileJs(this.jsFiles, this.closureCompiler, this.excludeJs);

    // copy folder, file necessary
    this.copySrc();
  }

  // this method will minify html
  async minifyHtml(files, minifyOptions) {
    for (let i = 0; i < files.length; i++) {
      let text = await Util.readFile(files[i], false);
      let textMinify = Util.minifyHtml(text, minifyOptions);
      let fileName = path.join(this.outputPath, path.basename(files[i]));

      Util.writeFile(fileName, textMinify);
    }
  }

  // this method will minify css
  async minifyCss(files, minifyOptions) {
    for (let i = 0; i < files.length; i++) {
      let text = await Util.readFile(files[i], false);
      let textMinify = Util.minifyCss(text, minifyOptions);
      let fileName = path.join(this.cssPath, path.basename(files[i]));

      Util.writeFile(fileName, textMinify);
    }
  }

  // this method will compile js
  async compileJs(files, closureCompiler, excludeJs) {
    for (let i = 0; i < files.length; i++) {
      let basename = path.basename(files[i]);

      if (excludeJs.indexOf(basename) > -1) {
        continue;
      }

      let text = await Util.readFile(files[i], false);
      let textCompiled = await Util.compileJs(text, closureCompiler);
      let fileName = path.join(this.jsPath, basename);
      Util.writeFile(fileName, textCompiled);
    }
  }

  copySrc() {
    // copy lang
    let langOri = path.join(this.rootPath, "lang");
    let langDest = path.join(this.outputPath, "lang");
    Util.copySrc(langOri, langDest);

    //copy src
    let srcOri = path.join(this.rootPath, "src");
    let srcDest = path.join(this.outputPath, "src");
    Util.copySrc(srcOri, srcDest);

    // copy manifest
    let manifestOri = path.join(this.rootPath, "manifest.json");
    let manifestDest = path.join(this.outputPath, "manifest.json");
    Util.copySrc(manifestOri, manifestDest);
  }
}

var build = new Build(configPath);
build.init();
