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
    this.closureCompiler = null;
  }

  async init() {
    // read config
    this.config = await Util.readFile(this.configPath);

    // get minify config
    this.minifyOptions = this.config.minifyOptions;

    // get complier service url
    this.closureCompiler = this.config.closureCompiler;

    // read html files
    this.htmlFiles = Util.readDir(this.config.rootPath, htmlExt);

    // read js files
    this.jsFiles = Util.readDir(
      path.join(this.config.rootPath, this.config.jsPath),
      jsExt
    );

    // read css files
    this.cssFiles = Util.readDir(
      path.join(this.config.rootPath, this.config.cssPath),
      cssExt
    );

    // create output folder
    this.outputPath = path.join(this.config.rootPath, this.config.output);
    Util.makeDir(this.outputPath);

    // start minify html
    this.minify(this.htmlFiles, this.minifyOptions);

    // start closure compiler
    this.compileJs(this.jsFiles, this.closureCompiler);

    // start minify css
    // this.minify(this.cssFiles, this.minifyOptions);
  }

  // this method will minify html and css
  async minify(files, minifyOptions) {
    for (let i = 0; i < files.length; i++) {
      let text = await Util.readFile(files[i], false);
      let textMinify = Util.minify(text, minifyOptions);
      let fileName = path.join(this.outputPath, path.basename(files[i]));

      Util.writeFile(fileName, textMinify);
    }
  }

  // this method will compile js
  async compileJs(files, closureCompiler) {
    for (let i = 0; i < 1; i++) {
      let text = await Util.readFile(files[i], false);
      let textCompiled = await Util.compileJs(text, closureCompiler);
      //console.log(textCompiled);
      //let fileName = path.join(this.outputPath, path.basename(files[i]));
      //Util.writeFile(fileName, textCompiled);
    }
  }
}

var build = new Build(configPath);
build.init();
