const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const axios = require("axios").default;
const minifier = require("html-minifier").minify;

class Util {
  static readFile(path, isJson = true) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, "utf8", (err, data) => {
        if (err) {
          console.log(err);
          return reject(err);
        } else {
          let values = isJson ? JSON.parse(data) : data;
          return resolve(values);
        }
      });
    });
  }

  static readDir(dirPath, filter) {
    if (!fs.existsSync(dirPath)) {
      console.log("no directory found", dirPath);
      return;
    }

    const files = fs.readdirSync(dirPath);
    let htmlFiles = [];

    for (let i = 0; i < files.length; i++) {
      let filename = path.join(dirPath, files[i]);
      if (filename.indexOf(filter) >= 0) {
        htmlFiles.push(filename);
      }
    }

    return htmlFiles;
  }

  static minify(text, options) {
    return minifier(text, options);
  }

  static makeDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
  }

  static writeFile(fileName, text) {
    fs.writeFile(fileName, text, function (err) {
      if (err) {
        return console.log(err);
      }
    });
  }

  static compileJs(text, closureCompiler) {
    return new Promise((resolve, reject) => {
      let closureCompilerUrl = closureCompiler.url;
      let level = closureCompiler.level;

      let body = JSON.stringify({
        output_format: "text",
        output_info: "compiled_code",
        //   output_info: "warnings",
        //   output_info: "errors",
        //   output_info: "statistics",
        compilation_level: level,
        //   warning_level: "default",
        //   output_file_name: "default.js",
        js_code: text,
      });

      fetch(closureCompilerUrl, {
        method: "post",
        headers: {
          "Content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: body,
      })
        .then((e) => e.text())
        .then((e) => {
          console.log(e);
          return resolve(e);
        })
        .catch((ex) => {
          return reject(ex);
        });
    });
  }
}

module.exports = Util;
