const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const minifier = require("html-minifier").minify;
const cleanCSS = require("clean-css");
const ncp = require("ncp").ncp;
ncp.limit = 16;

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
    let resultFiles = [];

    for (let i = 0; i < files.length; i++) {
      let filename = path.join(dirPath, files[i]);
      if (filename.indexOf(filter) >= 0) {
        resultFiles.push(filename);
      }
    }

    return resultFiles;
  }

  static minifyHtml(text, options) {
    return minifier(text, options);
  }

  static minifyCss(text, options) {
    return new cleanCSS(options).minify(text).styles;
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

  static encodeBodyData(body) {
    let s = "";

    function encode(s) {
      return encodeURIComponent(s).replace(/%20/g, "+");
    }

    for (var key in body) {
      if (typeof body[key] == "string") {
        s += (s ? "&" : "") + encode(key) + "=" + encode(body[key]);
      }
    }

    return s;
  }

  static compileJs(text, closureCompiler) {
    return new Promise((resolve, reject) => {
      let closureCompilerUrl = closureCompiler.url;
      let level = closureCompiler.level;

      let body = {
        output_format: "text",
        output_info: "compiled_code",
        compilation_level: level,
        js_code: text,
      };

      fetch(closureCompilerUrl, {
        method: "post",
        headers: {
          "Content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: Util.encodeBodyData(body),
      })
        .then((e) => e.text())
        .then((e) => {
          return resolve(e);
        })
        .catch((ex) => {
          return reject(ex);
        });
    });
  }

  static copySrc(src, dest) {
    ncp(src, dest, function (err) {
      if (err) {
        return console.error(err);
      }
      console.log("done!");
    });
  }
}

module.exports = Util;
